import { UploadedFileDto } from "../../dtos/file";
import UploadFileFacade from "@/facades/upload-file.facade";
import UploadHitService from "@/services/upload-hit-service";
import ConfigService from "@/services/config-service";
import { Container } from "typedi";
import Imap from "imap";
import ImapIdleKeepConnection from "imap-idle-keep-connection";
import { simpleParser } from "mailparser";
import { logger } from "@/utils/logger";
import { MAIL_CONSTANTS } from "@/constants/mail.constants";
import { ParsedEmail } from "@/dtos/mail";
import { promisify } from "util";
import MailUtils from "@/utils/mail-utils";
import moment from "moment";
import UploadParentReq from "@/models/mongo/upload-parent-req.schema";

const uploadFileFacade = Container.get(UploadFileFacade);
const uploadHitService = Container.get(UploadHitService);
const configService = Container.get(ConfigService);

const setupEmailListener = async () => {
  try {
    const configKey = MAIL_CONSTANTS.configKey;
    const { config } =
      (await configService.getConfigValueByKey(configKey)) ?? {};

    const imapConfig = config.configValue?.connectionConfig;
    const imapIdle = new ImapIdleKeepConnection(imapConfig);
    const imap = new Imap(imapConfig);

    imapIdle.on(MAIL_CONSTANTS.mail, () => processNewEmails(imap, config));
    imapIdle.on(MAIL_CONSTANTS.error, (err: any) =>
      logger.error("IMAP Idle error:", { err })
    );
  } catch (error) {
    logger.error("Error occured in setting up mail listener:", { error });
  }
};

const processNewEmails = (imap: any, config: any) => {
  try {
    imap.once(MAIL_CONSTANTS.ready, () =>
      openInbox(imap, async (err: any) => {
        if (err) {
          logger.error("Error opening inbox:", err);
          return;
        }
        await searchUnseenEmails(imap, config);
      })
    );

    imap.once(MAIL_CONSTANTS.error, (err: any) =>
      logger.error("IMAP Connection error:", { err })
    );
    imap.connect();
  } catch (error) {
    logger.error("Error while processing emails", { error });
  }
};

const openInbox = (imap, callback) => {
  imap.openBox(MAIL_CONSTANTS.inbox, true, callback);
};

const searchUnseenEmails = async (imap: any, config: any) => {
  try {
    const search = promisify(imap.search).bind(imap);
    const results = await search([MAIL_CONSTANTS.unseen]);

    if (!results?.length) {
      logger.info("No unseen emails found.");
      imap.end();
      return;
    }

    const latestEmailUID = results[results.length - 1];
    const fetchOptions = { bodies: "" };
    const fetch = imap.fetch(latestEmailUID.toString(), fetchOptions);

    fetch.on(
      MAIL_CONSTANTS.message,
      async (message) => await processEmailMessage(message, config)
    );
    fetch.once(MAIL_CONSTANTS.error, (err) =>
      logger.error("Fetch error:", { err })
    );
    fetch.once(MAIL_CONSTANTS.end, () => imap.end());
  } catch (error) {
    logger.error("Error occurred during email search:", { error });
  }
};

const processEmailMessage = async (message, config) => {
  try {
    const stream = await new Promise((resolve) => {
      message.on(MAIL_CONSTANTS.body, (stream: any) => {
        resolve(stream);
      });
    });

    const mail = await simpleParser(stream);

    const mailServiceConfig = config.configValue?.mailServiceConfig;
    if (!validEmail(mail, mailServiceConfig)) {
      logger.info(`Email from ${mail.from.value[0].address} is not valid.`);
      return;
    }
    await handleEmail(mail, mailServiceConfig);
  } catch (error) {
    logger.error("Error processing email:", { error });
  }
};

const validEmail = (mail: ParsedEmail, { subject, sender }) => {
  return (
    subject.includes(mail?.subject) && mail.from.value[0].address === sender
  );
};

const handleEmail = async (mail: ParsedEmail, mailConfig: any) => {
  logger.info("printing mail:", {
    mail,
    mailText: mail.text,
    linkIdentifier: mailConfig?.linkIdentifier,
  });
  const fileLink = MailUtils.extractUrlFromMailText(
    mail.text,
    mailConfig?.linkIdentifier ?? ""
  );
  const url = fileLink;
  const file = mail.attachments?.[0] ?? null;

  logger.info("extracted following url from the mail: ", { url });
  if (file) {
    file.buffer = file.content;
    delete file.content;
  }

  const configKey = MAIL_CONSTANTS.configKey;
  const { config } = await configService.getConfigValueByKey(configKey);

  const requestFile: UploadedFileDto = {
    file: file ?? url,
    type: file ? "File" : "Link",
    extension: config.configValue?.dataStoreType,
  };

  const s3FileLink = await uploadFileFacade.uploadFile(requestFile);
  const body = config.configValue?.body;

  const currDate = moment()
    .subtract(
      config.configValue?.timeDiff ?? MAIL_CONSTANTS.defaultTimeDiff,
      "seconds"
    )
    .toDate();
  const duplicateCount = await UploadParentReq.countDocuments({
    type: body.type,
    updatedAt: { $gte: currDate },
  });

  if (duplicateCount) {
    logger.info("Email already started processing");
    return;
  }

  const message = await uploadHitService.initiateParentHit(
    config,
    s3FileLink,
    body,
    {}
  );
  logger.info("Processed email with message:", { message });
};

export default setupEmailListener;

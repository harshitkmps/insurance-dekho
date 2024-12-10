import { MAIL_CONSTANTS } from "@/constants/mail.constants";
import { logger } from "./logger";

export default class MailUtils {
  static extractUrlFromMailHtml(mailText: string | any) {
    const startIndex = mailText.indexOf("https://");
    const endIndex =
      startIndex !== -1 ? mailText.indexOf(`">`, startIndex) : -1;
    return endIndex === -1 ? null : mailText.slice(startIndex, endIndex);
  }
  static extractUrlFromMailText(mailText: string, identifier: string) {
    // const link = (mailText?.match(MAIL_CONSTANTS.urlRegex) ?? [])
    //   .filter((link) => link?.includes(identifier))
    //   ?.at(0)
    //   ?.replace(MAIL_CONSTANTS.suffixRemovalRegex, "");
    const httpLinks = mailText?.match(MAIL_CONSTANTS.urlRegex) ?? [];
    logger.info("extracted http links from mail text", {
      httpLinks,
    });
    const linksSatisfyingIdentifier = httpLinks.filter((link) =>
      link?.includes(identifier)
    );
    logger.info("extracted linksSatisfyingIdentifier from mail text", {
      linksSatisfyingIdentifier,
    });
    const link = linksSatisfyingIdentifier
      ?.at(0)
      ?.replace(MAIL_CONSTANTS.suffixRemovalRegex, "");

    logger.info("final link extraced", { link });

    return link;
  }
}

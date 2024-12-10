import { logger } from "@/utils/logger";
import amqp, { Channel } from "amqplib";
import CommonUtils from "@utils/common-utils";
import { parentHitConsumer } from "@/services/consumers/download-parent-hit-consumer";
import { accumulatorConsumer } from "@/services/consumers/download-accumulator-consumer";
import { childApiHitConsumer } from "@/services/consumers/download-child-hit-consumer";
import { gcdDataConsumer } from "@/services/consumers/gcd-data-consumer";
import { uploadParentHitConsumer } from "@/services/consumers/upload-parent-hit-consumer";
import { uploadChildApiHitConsumer } from "@/services/consumers/upload-child-hit-consumer";
import { uploadAccumulatorHitConsumer } from "@/services/consumers/upload-accumulator-consumer";
import {
  ACCUMULATOR_CONSUMER_PREFETCH_COUNT,
  CHILD_CONSUMER_PREFETCH_COUNT,
  PARENT_CONSUMER_PREFETCH_COUNT,
} from "@/constants/upload.constants";
import { pdfAccumulatorConsumer } from "@/services/consumers/download-pdf-accumulator-consumer";
import { filesComparatorParentConsumer } from "@/services/consumers/files-comparator-parent-consumer";
import { filesComparatorAccumulatorConsumer } from "@/services/consumers/files-comparator-accumulator-consumer";
let channel: Channel = null;

const uploadParentConsumerCount: number =
  parseInt(process.env.PARENT_CONSUMER_PREFETCH_COUNT) ??
  PARENT_CONSUMER_PREFETCH_COUNT;
const uploadChildConsumerCount: number =
  parseInt(process.env.CHILD_CONSUMER_PREFETCH_COUNT) ??
  CHILD_CONSUMER_PREFETCH_COUNT;
const uploadAccumulatorConsumerCount: number =
  parseInt(process.env.ACCUMULATOR_CONSUMER_PREFETCH_COUNT) ??
  ACCUMULATOR_CONSUMER_PREFETCH_COUNT;
const uploadSlowChildConsumerCount: number =
  parseInt(process.env.CHILD_CONSUMER_SLOW_PREFETCH_COUNT) ?? 1;
const uploadRetryChildConsumerCount: number =
  parseInt(process.env.CHILD_CONSUMER_RETRY_PREFETCH_COUNT) ?? 1;

const connectRabbitMq = async () => {
  try {
    logger.info("connecting to rabbitMq");
    const conn = await amqp.connect(`${process.env.RABBIT_MQ_URL}`);
    const chann = await conn.createChannel();
    logger.info("connected to rabbitMq");
    conn.on("error", function (err) {
      if (err.message !== "Connection closing") {
        logger.error("RabbitMq conn error", {
          error: err,
          message: err.message,
        });
        // connectRabbitMq();
      }
    });

    // conn.on("close", function () {
    //   logger.error("RabbitMq reconnecting");
    //   connectRabbitMq();
    // });
    channel = chann;
    const delayedExchangeType = process.env.RABBIT_MQ_DELAYED_EXCHANGE_TYPE;
    const delayedDefaultExchangeOptions = {
      autoDelete: false,
      durable: true,
      arguments: { "x-delayed-type": "direct" },
    };
    await Promise.all([
      channel.assertExchange(
        process.env.RABBIT_MQ_DOWNLOAD_CHILD_EXCHANGE,
        delayedExchangeType,
        delayedDefaultExchangeOptions
      ),
      channel.assertExchange(
        process.env.RABBIT_MQ_UPLOAD_ACCUMULATOR_EXCHANGE,
        delayedExchangeType,
        delayedDefaultExchangeOptions
      ),
      channel.assertExchange(process.env.RABBIT_MQ_FAILURE_EXCHANGE, "fanout", {
        durable: true,
      }),

      channel.assertExchange(
        process.env.RABBIT_MQ_UPLOAD_ORCHESTRATOR_EXCHANGE,
        delayedExchangeType,
        delayedDefaultExchangeOptions
      ),

      channel.assertQueue(process.env.RABBIT_MQ_PARENT_HIT_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),
      channel.assertQueue(process.env.RABBIT_MQ_CHILD_HIT_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),
      channel.assertQueue(process.env.RABBIT_MQ_ACCUMULATOR_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),
      channel.assertQueue(process.env.RABBIT_MQ_UPLOAD_PARENT_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),
      channel.assertQueue(process.env.RABBIT_MQ_UPLOAD_CHILD_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),
      channel.assertQueue(
        process.env.RABBIT_MQ_UPLOAD_TRANSACTION_SLOW_CHILD_QUEUE,
        {
          durable: true,
          deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
        }
      ),
      channel.assertQueue(
        process.env.RABBIT_MQ_UPLOAD_TRANSACTION_FAST_CHILD_QUEUE,
        {
          durable: true,
          deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
        }
      ),
      channel.assertQueue(
        process.env.RABBIT_MQ_UPLOAD_NON_TRANSACTION_CHILD_QUEUE,
        {
          durable: true,
          deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
        }
      ),
      channel.assertQueue(process.env.RABBIT_MQ_UPLOAD_RETRY_CHILD_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),
      channel.assertQueue(process.env.RABBIT_MQ_UPLOAD_ACCUMULATOR_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),
      channel.assertQueue(process.env.GCD_DATA_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),
      channel.assertQueue(process.env.RABBIT_MQ_COMPARATOR_PARENT_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),
      channel.assertQueue(process.env.RABBIT_MQ_COMPARATOR_ACCUMULATOR_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),
      channel.assertQueue(process.env.RABBIT_MQ_ACCUMULATOR_FAILURE_QUEUE, {
        durable: true,
      }),
      channel.assertQueue(process.env.RABBIT_MQ_PDF_ACCUMULATOR_QUEUE, {
        durable: true,
        deadLetterExchange: process.env.RABBIT_MQ_FAILURE_EXCHANGE,
      }),

      channel.bindQueue(
        process.env.RABBIT_MQ_CHILD_HIT_QUEUE,
        process.env.RABBIT_MQ_DOWNLOAD_CHILD_EXCHANGE,
        process.env.RABBIT_MQ_DOWNLOAD_CHILD_ROUTING_KEY
      ),
      channel.bindQueue(
        process.env.RABBIT_MQ_UPLOAD_ACCUMULATOR_QUEUE,
        process.env.RABBIT_MQ_UPLOAD_ACCUMULATOR_EXCHANGE,
        process.env.RABBIT_MQ_UPLOAD_ACCUMULATOR_ROUTING_KEY
      ),
      channel.bindQueue(
        process.env.RABBIT_MQ_ACCUMULATOR_FAILURE_QUEUE,
        process.env.RABBIT_MQ_FAILURE_EXCHANGE,
        process.env.RABBIT_MQ_FAILURE_ROUTING_KEY
      ),
      channel.bindQueue(
        process.env.RABBIT_MQ_UPLOAD_TRANSACTION_FAST_CHILD_QUEUE,
        process.env.RABBIT_MQ_UPLOAD_ORCHESTRATOR_EXCHANGE,
        process.env.RABBIT_MQ_UPLOAD_TRANSACTION_FAST_CHILD_QUEUE_ROUTING_KEY
      ),
      channel.bindQueue(
        process.env.RABBIT_MQ_UPLOAD_TRANSACTION_SLOW_CHILD_QUEUE,
        process.env.RABBIT_MQ_UPLOAD_ORCHESTRATOR_EXCHANGE,
        process.env.RABBIT_MQ_UPLOAD_TRANSACTION_SLOW_CHILD_QUEUE_ROUTING_KEY
      ),
      channel.bindQueue(
        process.env.RABBIT_MQ_UPLOAD_NON_TRANSACTION_CHILD_QUEUE,
        process.env.RABBIT_MQ_UPLOAD_ORCHESTRATOR_EXCHANGE,
        process.env.RABBIT_MQ_UPLOAD_NON_TRANSACTION_CHILD_QUEUE_ROUTING_KEY
      ),
      channel.bindQueue(
        process.env.RABBIT_MQ_UPLOAD_CHILD_QUEUE,
        process.env.RABBIT_MQ_UPLOAD_ORCHESTRATOR_EXCHANGE,
        process.env.RABBIT_MQ_UPLOAD_CHILD_QUEUE_ROUTING_KEY
      ),
      channel.bindQueue(
        process.env.RABBIT_MQ_UPLOAD_RETRY_CHILD_QUEUE,
        process.env.RABBIT_MQ_UPLOAD_ORCHESTRATOR_EXCHANGE,
        process.env.RABBIT_MQ_UPLOAD_RETRY_CHILD_QUEUE_ROUTING_KEY
      ),
    ]);

    channel.consume(
      process.env.RABBIT_MQ_PARENT_HIT_QUEUE,
      async (msg) => {
        await parentHitConsumer(msg);
      },
      { noAck: false }
    );
    channel.consume(
      process.env.RABBIT_MQ_CHILD_HIT_QUEUE,
      async (msg) => {
        await childApiHitConsumer(msg);
      },
      { noAck: false }
    );
    channel.consume(
      process.env.RABBIT_MQ_ACCUMULATOR_QUEUE,
      async (msg) => {
        await accumulatorConsumer(msg);
      },
      { noAck: false }
    );
    channel.consume(
      process.env.RABBIT_MQ_PDF_ACCUMULATOR_QUEUE,
      async (msg) => {
        await pdfAccumulatorConsumer(msg);
      },
      { noAck: false }
    );
    channel.prefetch(uploadParentConsumerCount, false);
    channel.consume(
      process.env.RABBIT_MQ_UPLOAD_PARENT_QUEUE,
      async (msg) => {
        await uploadParentHitConsumer(msg);
      },
      { noAck: false }
    );
    channel.prefetch(uploadChildConsumerCount, false);
    channel.consume(
      process.env.RABBIT_MQ_UPLOAD_CHILD_QUEUE,
      async (msg) => {
        await uploadChildApiHitConsumer(msg);
      },
      { noAck: false }
    );
    channel.prefetch(uploadChildConsumerCount, false);
    channel.consume(
      process.env.RABBIT_MQ_UPLOAD_TRANSACTION_FAST_CHILD_QUEUE,
      async (msg) => {
        await uploadChildApiHitConsumer(msg);
      },
      { noAck: false }
    );
    channel.prefetch(uploadChildConsumerCount, false);
    channel.consume(
      process.env.RABBIT_MQ_UPLOAD_NON_TRANSACTION_CHILD_QUEUE,
      async (msg) => {
        await uploadChildApiHitConsumer(msg);
      },
      { noAck: false }
    );
    channel.prefetch(uploadAccumulatorConsumerCount, false);
    channel.consume(
      process.env.RABBIT_MQ_UPLOAD_ACCUMULATOR_QUEUE,
      async (msg) => {
        await uploadAccumulatorHitConsumer(msg);
      },
      { noAck: false }
    );
    channel.prefetch(uploadSlowChildConsumerCount ?? 1, false);
    channel.consume(
      process.env.RABBIT_MQ_UPLOAD_TRANSACTION_SLOW_CHILD_QUEUE,
      async (msg) => {
        await uploadChildApiHitConsumer(msg);
      },
      { noAck: false }
    );
    channel.prefetch(uploadRetryChildConsumerCount ?? 1, false);
    channel.consume(
      process.env.RABBIT_MQ_UPLOAD_RETRY_CHILD_QUEUE,
      async (msg) => {
        await uploadChildApiHitConsumer(msg);
      },
      { noAck: false }
    );
    channel.prefetch(1, false);
    channel.consume(
      process.env.GCD_DATA_QUEUE,
      async (msg) => {
        await gcdDataConsumer(msg, process.env.GCD_DATA_QUEUE);
      },
      { noAck: false }
    );
    channel.consume(
      process.env.RABBIT_MQ_COMPARATOR_PARENT_QUEUE,
      async (msg) => {
        await filesComparatorParentConsumer(msg);
      },
      {
        noAck: false,
      }
    );
    channel.consume(
      process.env.RABBIT_MQ_COMPARATOR_ACCUMULATOR_QUEUE,
      async (msg) => {
        await filesComparatorAccumulatorConsumer(msg);
      },
      {
        noAck: false,
      }
    );
    return chann;
  } catch (err) {
    logger.error("error in connecting to rabbitMq", { err });
    CommonUtils.delay(1000).then(() => {
      connectRabbitMq();
    });
  }
};

export default connectRabbitMq;
export { channel };

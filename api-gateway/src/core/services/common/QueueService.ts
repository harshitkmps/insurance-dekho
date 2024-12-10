
import * as amqplib from "amqplib";
import * as amqp from "amqp-connection-manager";
import { C } from "../../../config/constants/constants";
export class QueueService {

    public static async producer(queueName: string, data: any) {
        try {
            await this.getConnection();
            await this.getChannel(queueName);
            const publishOptions: amqplib.Options.Publish = {
                persistent: true,
            };
            const routingKey: string = `${queueName}`;
            this.channel.publish("", routingKey, data, publishOptions);
        } catch (exception) {
            console.log("exception", exception);
        }
    }

    private static connection: any = null;
    private static channel: any = null;
    private static connectionOptions: any = {
        hostname: C.RABBITMQ.HOST,
        port: C.RABBITMQ.PORT,
        username: C.RABBITMQ.USER_NAME,
        password: C.RABBITMQ.PASSWORD,
        reconnectTime : C.RABBITMQ.RECONNECT_TIME_IN_SECONDS,
    };

    private static async getConnection() {
        try {
            if (!this.connection) {
                console.log("rmq connection not present, creating new connection");
                this.connection = await amqp.connect([this.getConnectionUrl()], {reconnectTimeInSeconds : this.connectionOptions.reconnectTime});
                console.log("new rmq connection created");
            }
            QueueService.connection.on(
                "connect",
                (_arg: { connection: amqplib.Connection; url: string }) => {
                  console.log("Rabbit MQ connected: %s", _arg.url);
                },
              );

            QueueService.connection.on("disconnect", (_arg: { err: Error }) => {
                console.log("Rabbit MQ disconnected: %s", _arg.err.message);
              });

            QueueService.connection.on("error", (err: any) => {
                console.log("Something went wrong with connection: %o", err);
              });

            QueueService.connection.on("reconnecting", () => {
                console.log("Rabbit MQ is reconnecting");
              });
            return Promise.resolve(this.connection);
        } catch (exception) {
            return Promise.reject(exception);
        }
    }

    private static getConnectionUrl() {
        return "amqp://" + this.connectionOptions.username + ":" + this.connectionOptions.password + "@" + this.connectionOptions.hostname + ":" + this.connectionOptions.port;
    }

    private static async getChannel(queueName: string) {
        try {
            if (!this.channel) {
                console.log("rmq channel not present, creating new channel");
                this.channel = await this.connection.createChannel({
                    json: true,
                    setup(channel: any) {
                        return channel.assertQueue(queueName, { durable: true });
                    },
                });
                console.log("new rmq channel created");
            }

            QueueService.channel.on("connect", () => {
                console.log("Rabbit MQ Channel connected");
            });

            QueueService.channel.on("close", () => {
                console.log("Rabbit MQ Channel closed");
            });

            QueueService.channel.on("error", (_arg: Error) => {
                console.log("Something went wrong with Rabbit MQ Channel : %o", _arg);
            });

            return Promise.resolve(this.channel);
        } catch (exception) {
            return Promise.reject(exception);
        }
    }

    constructor() {

    }
}

import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();    

export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.KAFKA_BROKER_URL || "localhost:9092"],
    });

    const consumer = kafka.consumer({ groupId: "mail-service-group" });
    await consumer.connect();

    const topicName = "send-mail";
    await consumer.subscribe({ topic: topicName, fromBeginning: false });
    console.log("✅ Mail service consumer started");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const { to, subject, html } = JSON.parse(
            message.value?.toString() || "{}",
          );
          console.log("Received mail data:", { to, subject});

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to,
            subject,
            html,
          });

          console.log(`Email sent to ${to}`);
        } catch (error: any) {
          console.error("Failed to sent mail: ", error.message);
        }
      },
    });
  } catch (error: any) {
    console.error("Failed to start kafka consumer:", error.message);
  }
};

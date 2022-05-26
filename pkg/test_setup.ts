import { Kafka } from "./kafka";
import { config } from "dotenv";
config();
const url = process.env["UPSTASH_KAFKA_REST_URL"];
if (!url) {
  throw new Error("UPSTASH_KAFKA_REST_URL env missing");
}

const username = process.env["UPSTASH_KAFKA_REST_USERNAME"];
if (!username) {
  throw new Error("UPSTASH_KAFKA_REST_USERNAME env missing");
}

const password = process.env["UPSTASH_KAFKA_REST_PASSWORD"];
if (!password) {
  throw new Error("UPSTASH_KAFKA_REST_PASSWORD env missing");
}

export const kafka = new Kafka({ url, username, password });

/* eslint-disable no-unused-vars */
export enum Topic {
  GREEN = "green",
  BLUE = "blue",
  RED = "red",
}
/* eslint-enable no-unused-vars */

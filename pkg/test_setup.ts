import { Kafka } from "./kafka.ts";
export const kafka = new Kafka({
  url: Deno.env.get("UPSTASH_KAFKA_REST_URL")!,
  username: Deno.env.get("UPSTASH_KAFKA_REST_USERNAME")!,
  password: Deno.env.get("UPSTASH_KAFKA_REST_PASSWORD")!,
});

export enum Topic {
  GREEN = "green",
  BLUE = "blue",
  RED = "red",
}

export const randomString = (prefix: string): string => {
  return `${prefix}_${(Math.random() * 1_000_000_000).toFixed(0)}`;
};

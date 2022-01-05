import { assertEquals } from "https://deno.land/std@0.120.0/testing/asserts.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

import { Kafka } from "./kafka.ts";
config({ export: true });

const url = Deno.env.get("UPSTASH_KAFKA_REST_URL");
if (!url) {
  throw new Error("Could not find url");
}
const username = Deno.env.get("UPSTASH_KAFKA_REST_USERNAME");
if (!username) {
  throw new Error("Could not find username");
}
const password = Deno.env.get("UPSTASH_KAFKA_REST_PASSWORD");
if (!password) {
  throw new Error("Could not find password");
}

const kafka = new Kafka({
  url,
  username,
  password,
});

enum Topic {
  TEST = "test.topic",
}

Deno.test("Publish a single message succesfully", async () => {
  const p = kafka.producer();
  const c = kafka.consumer();
  const message = { hello: "test" };

  const { partition, offset, topic } = await p.produce(Topic.TEST, message);

  const found = await c.fetch({
    topic,
    partition,
    offset,
  });
  assertEquals(JSON.parse(found[0].value), message);
});

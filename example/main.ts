import { Kafka } from "@chronark/upstash-kafka";

async function main() {
  const kafka = new Kafka({
    url: process.env.UPSTASH_KAFKA_REST_URL!,
    username: process.env.UPSTASH_KAFKA_REST_USERNAME!,
    password: process.env.UPSTASH_KAFKA_REST_PASSWORD!,
  });
  const p = await kafka.producer();
  const c = await kafka.consumer();

  await p.produce("test.topic", "Hello World");
  const messages = await c.consume({
    consumerGroupId: "group_1",
    instanceId: "instance_1",
    topics: ["test.topic"],
    autoOffsetReset: "earliest",
  });

  console.log(messages);
}

main();

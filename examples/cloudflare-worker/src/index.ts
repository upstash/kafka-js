import { Kafka } from "@upstash/kafka";
import type { Bindings } from "bindings";

export default {
  async fetch(_request: Request, env: Bindings) {
    const kafka = new Kafka({
      url: env.UPSTASH_KAFKA_REST_URL,
      username: env.UPSTASH_KAFKA_REST_USERNAME,
      password: env.UPSTASH_KAFKA_REST_PASSWORD,
    });

    const p = kafka.producer();
    const c = kafka.consumer();
    const topicA = "a";

    await p.produce(topicA, "Hello World");

    const messages = await c.consume({
      consumerGroupId: "group_1",
      instanceId: "instance_1",
      topics: [topicA],
      autoOffsetReset: "earliest",
    });

    return new Response(
      JSON.stringify(messages),
      { headers: { "content-type": "text/plain" } },
    );
  },
};

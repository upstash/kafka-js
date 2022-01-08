import { kafka, Topic } from "./test_setup.ts";
import { assert } from "https://deno.land/std@0.120.0/testing/asserts.ts";

const randomString = (prefix: string): string => {
  return `${prefix}_${(Math.random() * 1_000_000_000).toFixed(0)}`;
};

Deno.test({
  name: "Consume from a topic with no special config",
  fn: async () => {
    const p = kafka.producer();
    const c = kafka.consumer();
    const consumerGroupId = randomString("consumerGroup");
    const instanceId = randomString("instance");
    const topic = Topic.BLUE;

    const message = randomString("message");
    await p.produce(topic, message);

    let messageFound = false;
    for (let i = 0; i < 30; i++) {
      const messages = await c.consume({
        consumerGroupId,
        instanceId,
        topics: [topic],
        autoOffsetReset: "earliest",
      });
      if (messages.map((m) => m.value).includes(message)) {
        messageFound = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    await kafka.admin().removeConsumerInstance(consumerGroupId, instanceId);

    assert(messageFound);
  },
});

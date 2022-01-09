import { kafka, randomString, Topic } from "./test_setup.ts";
import {
  assert,
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std/testing/asserts.ts";

Deno.test({
  name: "consume()",
  fn: async (t) => {
    await t.step("Consume from a single topic", async () => {
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
          timeout: 3000,
        });
        if (messages.map((m) => m.value).includes(message)) {
          messageFound = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      await kafka.admin().removeConsumerInstance(consumerGroupId, instanceId);

      assert(messageFound);
    });

    await t.step("Consume from multiple topics", async () => {
      const p = kafka.producer();
      const c = kafka.consumer();
      const consumerGroupId = randomString("consumerGroup");
      const instanceId = randomString("instance");
      const topics = [Topic.BLUE, Topic.RED];

      const message = randomString("message");
      await p.produce(topics[0], message);

      let messageFound = false;
      for (let i = 0; i < 30; i++) {
        const messages = await c.consume({
          consumerGroupId,
          instanceId,
          topics,
          autoCommit: false,
          autoCommitInterval: 7000,
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
    });
  },
});
Deno.test({
  name: "commit()",
  fn: async (t) => {
    await t.step("Commit offset", async () => {
      const p = kafka.producer();
      const c = kafka.consumer();
      const consumerGroupId = randomString("consumerGroup");
      const instanceId = randomString("instance");

      const message = randomString("message");
      const { offset, partition, topic } = await p.produce(Topic.BLUE, message);

      await c.consume({
        consumerGroupId,
        instanceId,
        topics: [Topic.BLUE],
        autoCommit: false,
      });

      const preCommit = await c.committed({
        consumerGroupId,
        instanceId,
        topicPartitions: [{ topic, partition }],
      });

      await c.commit({
        consumerGroupId,
        instanceId,
        offset: {
          partition,
          topic,
          offset,
        },
      });

      const postCommit = await c.committed({
        consumerGroupId,
        instanceId,
        topicPartitions: [{ topic, partition }],
      });
      assertNotEquals(postCommit, preCommit);
      assertEquals(postCommit[0].offset, offset);
      await kafka.admin().removeConsumerInstance(consumerGroupId, instanceId);
    });
  },
});

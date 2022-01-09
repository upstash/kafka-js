import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.120.0/testing/asserts.ts";
import { kafka, Topic } from "./test_setup.ts";

Deno.test({
  name: "produce()",
  fn: async (t) => {
    await t.step("Publish a single message succesfully", async () => {
      const p = kafka.producer();
      const c = kafka.consumer();
      const message = { hello: "test" };
      const header = { key: "signature", value: "abcd" };

      const { partition, offset, topic } = await p.produce(Topic.RED, message, {
        headers: [header],
      });

      const found = await c.fetch({
        topic,
        partition,
        offset,
      });
      assertEquals(JSON.parse(found[0].value), message);
      assertEquals(found[0].headers[0], header);
    });
    await t.step("Publish a serialized succesfully", async () => {
      const p = kafka.producer();
      const c = kafka.consumer();
      const message = "hello world";
      const header = { key: "signature", value: "abcd" };

      const { partition, offset, topic } = await p.produce(Topic.RED, message, {
        headers: [header],
      });

      const found = await c.fetch({
        topic,
        partition,
        offset,
      });
      assertEquals(found[0].value, message);
      assertEquals(found[0].headers[0], header);
    });

    await t.step({
      name: "Publish multiple messages to different topics succesfully",

      fn: async () => {
        const p = kafka.producer();
        const c = kafka.consumer();
        const message0 = { hello: "test" };
        const message1 = { hello: "world" };

        const res = await p.produceMany([
          {
            topic: Topic.RED,
            value: JSON.stringify(message0),
          },
          {
            topic: Topic.GREEN,
            value: JSON.stringify(message1),
          },
        ]);

        const found = await c.fetch({
          topicPartitionOffsets: res.map((r) => ({
            topic: r.topic,
            partition: r.partition,
            offset: r.offset,
          })),
        });

        assertArrayIncludes(
          found.map((f) => JSON.parse(f.value)),
          [message0, message1],
        );
      },
    });
  },
});

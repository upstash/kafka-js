import { kafka, randomString, Topic } from "./test_setup.ts";
import { Kafka } from "./kafka.ts";
import { UpstashError } from "./error.ts";
import {
  assertArrayIncludes,
  assertRejects,
} from "https://deno.land/std/testing/asserts.ts";

Deno.test({
  name: "admin()",
  fn: async (t) => {
    await t.step("fails with wrong auth", async () => {
      const admin = new Kafka({
        url: Deno.env.get("UPSTASH_KAFKA_REST_URL")!,
        username: "username",
        password: "password",
      }).admin();

      await assertRejects(() => admin.topics(), UpstashError);
    });

    await t.step("returns all topics", async () => {
      const topics = await kafka.admin().topics();

      assertArrayIncludes(Object.keys(topics), ["green", "blue", "red"]);
    });
  },
});

Deno.test({
  name: "consumers()",
  fn: async (t) => {
    await t.step("returns all topics", async () => {
      const consumerGroupId = randomString("group");
      const instanceId = randomString("instance");
      const c = kafka.consumer();
      await c.consume({
        consumerGroupId,
        instanceId,
        topics: [Topic.BLUE],
      });
      const admin = kafka.admin();
      const consumers = await admin.consumers();
      await admin.removeConsumerInstance(consumerGroupId, instanceId);

      assertArrayIncludes(
        consumers.map((c) => c.name),
        [consumerGroupId],
      );
      assertArrayIncludes(
        consumers
          .find((c) => c.name === consumerGroupId)!
          .instances.map((i) => i.name),
        [instanceId],
      );
    });
    await t.step(
      "fails if the consumerGroup or instanceId does not exist",
      async () => {
        const consumerGroupId = randomString("group");
        const instanceId = randomString("instance");

        const admin = kafka.admin();
        await assertRejects(
          () => admin.removeConsumerInstance(consumerGroupId, instanceId),
          UpstashError,
        );
      },
    );
  },
});

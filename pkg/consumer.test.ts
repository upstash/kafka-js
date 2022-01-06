import { kafka, Topic } from "./test_setup.ts";
import { assertArrayIncludes } from "https://deno.land/std@0.120.0/testing/asserts.ts";

Deno.test({
  name: "Consume from a topic with no special config",
  fn: async () => {
    const p = kafka.producer();
    const c = kafka.consumer();

    console.log(JSON.stringify(await kafka.admin().consumers(), null, 2));

    const consumerGroupId = "consume_test_basic"; // crypto.randomUUID();
    const instanceId = "consume_test_basic"; // crypto.randomUUID()
    const message = crypto.randomUUID();
    await p.produce(Topic.RED, message);

    const messages = await c.consume({
      consumerGroupId,
      instanceId,
      topics: [Topic.RED],
    });

    assertArrayIncludes(
      messages.map((m) => m.value),
      [message],
    );
  },
});

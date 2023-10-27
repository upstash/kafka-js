import { kafka, Topic } from "./test_setup";
import { expect, it } from "bun:test";

it("publishes a single message succesfully", async () => {
  const p = kafka.producer();
  const c = kafka.consumer();
  const message = { hello: "test" };
  const header = { key: "signature", value: "abcd" };

  const { partition, offset, topic } = await p.produce(Topic.RED, message, { headers: [header] });

  const found = await c.fetch({ topic, partition, offset });
  expect(JSON.parse(found[0].value)).toEqual(message);
  expect(found[0].headers[0]).toEqual(header);
});
it("Publish a serialized succesfully", async () => {
  const p = kafka.producer();
  const c = kafka.consumer();
  const message = "hello world";
  const header = { key: "signature", value: "abcd" };

  const { partition, offset, topic } = await p.produce(Topic.RED, message, { headers: [header] });

  const found = await c.fetch({ topic, partition, offset });
  expect(found[0].value).toEqual(message);
  expect(found[0].headers[0]).toEqual(header);
});

it("publishes multiple messages to different topics succesfully", async () => {
  const p = kafka.producer();
  const c = kafka.consumer();
  const message0 = "test";
  const message1 = "world";

  const res = await p.produceMany([
    { topic: Topic.RED, value: message0 },
    { topic: Topic.GREEN, value: message1 },
  ]);

  const found = await c.fetch({
    topicPartitionOffsets: res.map((r) => ({
      topic: r.topic,
      partition: r.partition,
      offset: r.offset,
    })),
  });

  expect(found[0].value).toEqual(message0);
  expect(found[1].value).toEqual(message1);
});
it("publishes multiple serialized messages to different topics succesfully", async () => {
  const p = kafka.producer();
  const c = kafka.consumer();
  const key0 = "k0";
  const key1 = "k1";
  const message0 = { hello: "test" };
  const message1 = { hello: "world" };

  const res = await p.produceMany([
    { topic: Topic.RED, key: key0, value: message0 },
    { topic: Topic.GREEN, key: key1, value: message1 },
  ]);

  const found = await c.fetch({
    topicPartitionOffsets: res.map((r) => ({
      topic: r.topic,
      partition: r.partition,
      offset: r.offset,
    })),
  });

  expect(JSON.parse(found[0].value)).toStrictEqual(message0);
  expect(found[0].key).toEqual(key0);

  expect(JSON.parse(found[1].value)).toEqual(message1);
  expect(found[1].key).toEqual(key1);
});

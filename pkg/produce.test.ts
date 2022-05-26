import { kafka, Topic } from "./test_setup";
import { expect, it } from "@jest/globals";

it(
  "publishes a single message succesfully",
  async () => {
    const p = kafka.producer();
    const c = kafka.consumer();
    const message = { hello: "test" };
    const header = { key: "signature", value: "abcd" };

    const { partition, offset, topic } = await p.produce(
      Topic.RED,
      message,
      { headers: [header] },
    );

    const found = await c.fetch({ topic, partition, offset });
    expect(JSON.parse(found[0].value)).toEqual(message);
    expect(found[0].headers[0]).toEqual(header);
  },
);
it(
  "Publish a serialized succesfully",
  async () => {
    const p = kafka.producer();
    const c = kafka.consumer();
    const message = "hello world";
    const header = { key: "signature", value: "abcd" };

    const { partition, offset, topic } = await p.produce(
      Topic.RED,
      message,
      { headers: [header] },
    );

    const found = await c.fetch({ topic, partition, offset });
    expect(found[0].value).toEqual(message);
    expect(found[0].headers[0]).toEqual(header);
  },
);

it(
  "publishes multiple messages to different topics succesfully",
  async () => {
    const p = kafka.producer();
    const c = kafka.consumer();
    const message0 = { hello: "test" };
    const message1 = { hello: "world" };

    const res = await p.produceMany([
      { topic: Topic.RED, value: JSON.stringify(message0) },
      { topic: Topic.GREEN, value: JSON.stringify(message1) },
    ]);

    const found = await c.fetch({
      topicPartitionOffsets: res.map(
        (r) => ({ topic: r.topic, partition: r.partition, offset: r.offset }),
      ),
    });

    expect(found.map((f) => JSON.parse(f.value))).toContainEqual(message0);
    expect(found.map((f) => JSON.parse(f.value))).toContainEqual(message1);
  },
);

# upstash-kafka

Serverless kafka client for upstash

[![codecov](https://codecov.io/gh/chronark/upstash-kafka/branch/main/graph/badge.svg?token=BBJ1FCHPF0)](https://codecov.io/gh/chronark/upstash-kafka)

This project is written using the [deno](https://deno.land/) runtime and then
transpiled to node and published as a package on npm.

# Requirements

Either deno 1.x or node 14.x and higher

# Installation

## Deno

```
import { Kafka } from "https://deno.land/x/upstash_kafka/mod.ts"
```

## Node

```bash
npm install @chronark/upstash-kafka
```

```bash
yarn add @chronark/upstash-kafka
```

```bash
pnpm add @chronark/upstash-kafka
```

You get the idea.

# Quickstart

## Auth

1. Go to [upstash](https://console.upstash.com/kafka) and select your database.
2. Copy the `REST API` secrets at the bottom of the page

```typescript
import { Kafka } from "@chronark/upstash-kafka";

const kafka = new Kafka({
  url: "<UPSTASH_KAFKA_REST_URL>",
  username: "<UPSTASH_KAFKA_REST_USERNAME>",
  password: "<UPSTASH_KAFKA_REST_PASSWORD>",
});
```

## Produce a single message

```typescript
const p = kafka.producer();
const message = { hello: "world" }; // Objects will get serialized using `JSON.stringify`
const res = await p.produce("<my.topic>", message);
const res = await p.produce("<my.topic>", message, {
  partition: 1,
  timestamp: 12345,
  key: "<custom key>",
  headers: [{ key: "traceId", value: "85a9f12" }],
});
```

## Produce multiple messages.

The same options from the example above can be set for every message.

```typescript
const p = kafka.producer();
const res = await p.produceMany([
  {
    topic: "my.topic",
    value: "my message",
    // ...options
  },
  {
    topic: "another.topic",
    value: "another message",
    // ...options
  },
]);
```

## Consume

The first time a consumer is created, it needs to figure out the group
coordinator by asking the Kafka brokers and joins the consumer group. This
process takes some time to complete. That's why when a consumer instance is
created first time, it may return empty messages until consumer group
coordination is completed.

```typescript
const c = kafka.consumer();
const messages = await c.consume({
  consumerGroupId: "group_1",
  instanceId: "instance_1",
  topics: ["test.topic"],
  autoOffsetReset: "earliest",
});
```

More examples can be found in the
[docstring](https://github.com/chronark/upstash-kafka/blob/main/pkg/consumer.ts#L265)

## Commit manually

While `consume` can handle committing automatically, you can also use
`Consumer.commit` to manually commit.

```typescript
const consumerGroupId = "mygroup";
const instanceId = "myinstance";
const topic = "my.topic";

const c = kafka.consumer();
const messages = await c.consume({
  consumerGroupId,
  instanceId,
  topics: [topic],
  autoCommit: false,
});

for (const message of messages) {
  // message handling logic

  await c.commit({
    consumerGroupId,
    instanceId,
    offset: {
      topic: message.topic,
      partition: message.partition,
      offset: message.offset,
    },
  });
}
```

## Fetch

You can also manage offsets manually by using `Consumer.fetch`

```typescript
const c = kafka.consumer();
const messages = await c.fetch({
  topic: "greeting",
  partition: 3,
  offset: 42,
  timeout: 1000,
});
```

## Examples

There is a minimal working example application available in
[/example](https://github.com/chronark/upstash-kafka/tree/main/example) as well
as various examples in the docstrings of each method.

# Contributing

## Setup

1. Create a kafka instance on kafka
2. Create the following topics: `blue`, `red`, `green`
3. Create `.env` file with your kafka secrets

## Running tests

```bash
make test
```

## Building for node

```bash
make build
```

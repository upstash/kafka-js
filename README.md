# upstash-kafka

An HTTP/REST based Kafka client built on top of
[Upstash REST API](https://docs.upstash.com/kafka/rest).

[![codecov](https://codecov.io/gh/chronark/upstash-kafka/branch/main/graph/badge.svg?token=BBJ1FCHPF0)](https://codecov.io/gh/chronark/upstash-kafka)
![npm (scoped)](https://img.shields.io/npm/v/@upstash/kafka)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@upstash/kafka)

# Installation

## Node

```bash
npm install @upstash/kafka
```

## Deno

```
import { Kafka } from "https://deno.land/x/upstash_kafka/mod.ts"
```

# Quickstart

## Auth

1. Go to [upstash](https://console.upstash.com/kafka) and select your database.
2. Copy the `REST API` secrets at the bottom of the page

```typescript
import { Kafka } from "@upstash/kafka"

const kafka = new Kafka({
  url: "<UPSTASH_KAFKA_REST_URL>",
  username: "<UPSTASH_KAFKA_REST_USERNAME>",
  password: "<UPSTASH_KAFKA_REST_PASSWORD>",
})
```

## Produce a single message

```typescript
const p = kafka.producer()
const message = { hello: "world" } // Objects will get serialized using `JSON.stringify`
const res = await p.produce("<my.topic>", message)
const res = await p.produce("<my.topic>", message, {
  partition: 1,
  timestamp: 12345,
  key: "<custom key>",
  headers: [{ key: "traceId", value: "85a9f12" }],
})
```

## Produce multiple messages.

The same options from the example above can be set for every message.

```typescript
const p = kafka.producer()
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
])
```

## Consume

The first time a consumer is created, it needs to figure out the group
coordinator by asking the Kafka brokers and joins the consumer group. This
process takes some time to complete. That's why when a consumer instance is
created first time, it may return empty messages until consumer group
coordination is completed.

```typescript
const c = kafka.consumer()
const messages = await c.consume({
  consumerGroupId: "group_1",
  instanceId: "instance_1",
  topics: ["test.topic"],
  autoOffsetReset: "earliest",
})
```

More examples can be found in the
[docstring](https://github.com/upstash/upstash-kafka/blob/main/pkg/consumer.ts#L265)

## Commit manually

While `consume` can handle committing automatically, you can also use
`Consumer.commit` to manually commit.

```typescript
const consumerGroupId = "mygroup"
const instanceId = "myinstance"
const topic = "my.topic"

const c = kafka.consumer()
const messages = await c.consume({
  consumerGroupId,
  instanceId,
  topics: [topic],
  autoCommit: false,
})

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
  })
}
```

## Fetch

You can also manage offsets manually by using `Consumer.fetch`

```typescript
const c = kafka.consumer()
const messages = await c.fetch({
  topic: "greeting",
  partition: 3,
  offset: 42,
  timeout: 1000,
})
```

## Examples

There is a minimal working example application available in
[/example](https://github.com/upstash/upstash-kafka/tree/main/example) as well
as various examples in the docstrings of each method.

# Contributing

This project is written using the [deno](https://deno.land/) runtime and then
transpiled to node and published as a package on npm.

# Requirements

Either deno 1.x or node 14.x and higher

## Setup

0. [Install Deno](https://deno.land/#installation)

1. Create a kafka instance on upstash.
   [docs](https://docs.upstash.com/kafka#create-a-kafka-cluster)
2. Create the following topics: `blue`, `red`, `green`.
   [docs](https://docs.upstash.com/kafka#create-a-topic)

   The partitions or retention settings don't matter at this time.

3. Create `.env` file with your kafka secrets `cp .env.example .env`

## Running tests

```bash
make test
```

## Building for node

Following command builds the node package with the specified version:

```bash
make build version=1.x.y
```

Alternatively, if `version` argument is omitted, the most recent git tag is used
as the package version.

```bash
make build
```

A `/npm` folder will be created with the built node module. As part of the build
process the tests are run against your installed node version. To disable this,
you can configure the build pipeline in `/cmd/build.ts`

```typescript
// ...
await build({
  test: false, // <-- add this
  // ... remaining config
})
```

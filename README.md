# upstash-kafka

Serverless kafka client for upstash

# Installation

```bash
npm install @chronark/upstash-kafka
```

Or

```bash
yarn add @chronark/upstash-kafka
```

Or

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
const message = { hello: "world" };
const res = await kafka.produce("<my.topic>", message);
const res = await kafka.produce("<my.topic>", message, {
    partition: 1,
    timestamp: 12345,
    key: "<custom key>",
    headers: [{key: "traceId", value: "85a9f12"}]
});

```

## Produce multiple messages.
The same options from the example above can be set for every message.
```typescript
const res = await kafka.produceMany([
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


# Roadmap

The producer has the most to gain from a serverless approach in my opinion. So right now this is the only thing I implemented. I'll add the other features soon, but if it's urgent for you, then please open an issue and we can discuss what you need. Thank you.
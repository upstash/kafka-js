# Deploying to Cloudflare Workers

You can use @upstash/kafka in Cloudflare Workers as it accesses the Kafka using REST calls.

## 1. Installing wrangler CLI

Workers requires wrangler, a tool to deploy your function. Run the
following command:

```bash
npm install -g @cloudflare/wrangler
```

## 2. Initialize the Project

Create your wrangler project:

```bash
wrangler generate workers-with-kafka
```

You’ll notice your project structure should now look something like:

```
  ├── wrangler.toml
  ├── index.js
  ├── package.json
```

## 3. Add Upstash Kafka to project

Install the @upstash/redis

```bash
cd workers-with-kafka
npm install @upstash/kafka
```

Create a cluster in [Upstash Console](https://console.upstash.com/)

Copy following variable from Upstash console and paste them to `wrangler.toml`

```toml
# wrangler.toml
[vars]
UPSTASH_KAFKA_REST_URL=""
UPSTASH_KAFKA_REST_USERNAME=""
UPSTASH_KAFKA_REST_PASSWORD=""
```

Update type to `webpack`

```toml
type = "webpack"
```

Edit `index.js`

```js
// index.js
import { Kafka } from '@upstash/kafka'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


async function handleRequest(request) {
  const kafka = new Kafka({
    url: UPSTASH_KAFKA_REST_URL,
    username: UPSTASH_KAFKA_REST_USERNAME,
    password: UPSTASH_KAFKA_REST_PASSWORD
  })

  const p = kafka.producer()
  const c = kafka.consumer()

  await p.produce('test.topic', 'Hello World')

  const messages = await c.consume({
    consumerGroupId: 'group_1',
    instanceId: 'instance_1',
    topics: ['test.topic'],
    autoOffsetReset: 'earliest'
  })

  return new Response(JSON.stringify(messages), {
    headers: { 'content-type': 'text/plain' }
  })
}
```

## 4. Configure

To authenticate into your Cloudflare account and copy `account_id`

> Follow the [Quick Start](https://developers.cloudflare.com/workers/get-started/guide#configure) for steps on gathering the correct account ID and API token to link wrangler to your Cloudflare account.

```toml
# wrangler.toml
account_id = "a123..."
```

## 5. Build and Publish the project

Test your worker locally

```bash
wrangler dev
```

Build your worker

```bash
wrangler build
```

Deploy your worker

```bash
wrangler publish
```

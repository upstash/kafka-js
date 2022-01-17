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

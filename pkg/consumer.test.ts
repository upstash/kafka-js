import { kafka, Topic } from "./test_setup"
import { randomUUID } from "crypto"
import { describe, expect, test } from "@jest/globals"
describe("consume()", () => {
  test("Consume from a single topic", async () => {
    const p = kafka.producer()
    const c = kafka.consumer()
    const consumerGroupId = randomUUID()
    const instanceId = randomUUID()
    const topic = Topic.BLUE

    const message = randomUUID()
    await p.produce(topic, message)

    let messageFound = false
    for (let i = 0; i < 30; i++) {
      const messages = await c.consume({
        consumerGroupId,
        instanceId,
        topics: [topic],
        autoOffsetReset: "earliest",
        timeout: 3000,
      })
      if (messages.map((m) => m.value).includes(message)) {
        messageFound = true
        break
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
    await kafka.admin().removeConsumerInstance(consumerGroupId, instanceId)

    expect(messageFound).toBe(true)
  })

  test("Consume from multiple topics", async () => {
    const p = kafka.producer()
    const c = kafka.consumer()
    const consumerGroupId = randomUUID()
    const instanceId = randomUUID()
    const topics = [Topic.BLUE, Topic.RED]

    const message = randomUUID()
    await p.produce(topics[0], message)

    let messageFound = false
    for (let i = 0; i < 30; i++) {
      const messages = await c.consume({
        consumerGroupId,
        instanceId,
        topics,
        autoCommit: false,
        autoCommitInterval: 7000,
        autoOffsetReset: "earliest",
      })
      if (messages.map((m) => m.value).includes(message)) {
        messageFound = true
        break
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
    await kafka.admin().removeConsumerInstance(consumerGroupId, instanceId)

    expect(messageFound).toBe(true)
  })
})
describe("commit()", () => {
  test("Commit offset", async () => {
    const p = kafka.producer()
    const c = kafka.consumer()
    const consumerGroupId = randomUUID()
    const instanceId = randomUUID()

    const message = randomUUID()
    const { offset, partition, topic } = await p.produce(Topic.BLUE, message)

    await c.consume({
      consumerGroupId,
      instanceId,
      topics: [Topic.BLUE],
      autoCommit: false,
    })

    const preCommit = await c.committed({
      consumerGroupId,
      instanceId,
      topicPartitions: [{ topic, partition }],
    })

    await c.commit({
      consumerGroupId,
      instanceId,
      offset: {
        partition,
        topic,
        offset,
      },
    })

    const postCommit = await c.committed({
      consumerGroupId,
      instanceId,
      topicPartitions: [{ topic, partition }],
    })
    expect(postCommit).not.toEqual(preCommit)
    expect(postCommit[0].offset).toEqual(offset)
    await kafka.admin().removeConsumerInstance(consumerGroupId, instanceId)
  })
})

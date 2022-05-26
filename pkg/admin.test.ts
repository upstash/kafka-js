import { kafka, Topic } from "./test_setup"
import { Kafka } from "./kafka"
import { UpstashError } from "./error"
import { describe, expect, test } from "@jest/globals"
import { randomUUID } from "crypto"

test("fails with wrong auth", async () => {
  const url = process.env["UPSTASH_KAFKA_REST_URL"]
  if (!url) {
    throw new Error("TEST SETUP FAILED")
  }
  const admin = new Kafka({ url, username: "username", password: "password" }).admin()

  await expect(() => admin.topics()).rejects.toThrowError(UpstashError)
})

test("returns all topics", async () => {
  const topics = await kafka.admin().topics()

  const expectedTopics = ["green", "blue", "red"]
  expectedTopics.forEach((topic) => {
    expect(Object.keys(topics)).toContain(topic)
  })
})

describe("consumers()", () => {
  test("returns all topics", async () => {
    const consumerGroupId = randomUUID()
    const instanceId = randomUUID()
    const c = kafka.consumer()
    await c.consume({ consumerGroupId, instanceId, topics: [Topic.BLUE] })
    const admin = kafka.admin()
    const consumers = await admin.consumers()
    await admin.removeConsumerInstance(consumerGroupId, instanceId)

    expect(consumers.map((c) => c.name)).toContain(consumerGroupId)
    expect(
      consumers.find((c) => c.name === consumerGroupId)!.instances.map((i) => i.name),
    ).toContain(instanceId)
  })
  test("fails if the consumerGroup or instanceId does not exist", async () => {
    const consumerGroupId = randomUUID()
    const instanceId = randomUUID()

    const admin = kafka.admin()
    await expect(() =>
      admin.removeConsumerInstance(consumerGroupId, instanceId),
    ).rejects.toThrowError(UpstashError)
  })
})

describe("committedOffsets()", () => {
  test("returns the latest offsets for one topicPartition", async () => {
    const consumerGroupId = randomUUID()
    const instanceId = randomUUID()

    const admin = kafka.admin()
    const p = kafka.producer()
    const c = kafka.consumer()

    await p.produce(Topic.BLUE, randomUUID())

    /**
     * Try consuming until the consumergroup is set up. This can take a few seconds.
     */
    let ready = false
    while (!ready) {
      const consumerGroups = await admin.consumers()
      const consumer = consumerGroups.find((c) => c.name === consumerGroupId)
      if (consumer) {
        const instance = consumer.instances.find((i) => i.name === instanceId)
        if (instance) {
          if (instance.topics.find((t) => t.topic === Topic.BLUE)) {
            ready = true
          }
        }
      }

      await c.consume({
        consumerGroupId,
        instanceId,
        topics: [Topic.BLUE],
      })

      await new Promise((res) => setTimeout(res, 1000))
    }

    const offsets = await admin.committedOffsets({
      consumerGroupId,
      instanceId,
      topicPartition: { topic: Topic.BLUE, partition: 0 },
    })

    expect(offsets.length).toBe(1)
    const offset = offsets[0]!
    expect(offset.topic).toEqual(Topic.BLUE)
    expect(typeof offset.offset).toBe("number")

    await admin.removeConsumerInstance(consumerGroupId, instanceId)
  })
  test("returns the latest offsets for multiple topicPartitions", async () => {
    const consumerGroupId = randomUUID()
    const instanceId = randomUUID()

    const admin = kafka.admin()
    const p = kafka.producer()
    const c = kafka.consumer()

    await p.produce(Topic.BLUE, randomUUID())
    await p.produce(Topic.RED, randomUUID())

    /**
     * Try consuming until the consumergroup is set up. This can take a few seconds.
     */
    let ready = false
    while (!ready) {
      const consumerGroups = await admin.consumers()
      const consumer = consumerGroups.find((c) => c.name === consumerGroupId)
      if (consumer) {
        const instance = consumer.instances.find((i) => i.name === instanceId)
        if (instance) {
          if (instance.topics.find((t) => t.topic === Topic.BLUE)) {
            ready = true
          }
        }
      }

      await c.consume({
        consumerGroupId,
        instanceId,
        topics: [Topic.BLUE, Topic.RED],
      })

      await new Promise((res) => setTimeout(res, 1000))
    }

    const offsets = await admin.committedOffsets({
      consumerGroupId,
      instanceId,
      topicPartitions: [
        { topic: Topic.BLUE, partition: 0 },
        { topic: Topic.RED, partition: 0 },
      ],
    })

    expect(offsets.length).toBe(2)
    for (const offset of offsets) {
      expect(typeof offset.offset).toBe("number")
    }
    await admin.removeConsumerInstance(consumerGroupId, instanceId)
  })
})

describe("topicPartitionOffsets()", () => {
  test("returns the offsets of a single partition and topic", async () => {
    const admin = kafka.admin()
    const p = kafka.producer()

    const { topic, partition } = await p.produce(Topic.RED, randomUUID(), { partition: 0 })

    const partitionOffsets = await admin.topicPartitionOffsets({
      timestamp: Math.floor(Date.now() / 1000),
      topicPartition: { topic, partition },
    })

    expect(partitionOffsets.length).toBe(1)
    const partitionOffset = partitionOffsets[0]!
    expect(partitionOffset.topic).toEqual(topic)
    expect(typeof partitionOffset.offset).toBe("number")
  })
  test("returns the offsets of multiple partition and topic", async () => {
    const admin = kafka.admin()
    const p = kafka.producer()

    await p.produce(Topic.RED, randomUUID(), { partition: 0 })
    await p.produce(Topic.BLUE, randomUUID(), { partition: 0 })

    const partitionOffsets = await admin.topicPartitionOffsets({
      timestamp: Math.floor(Date.now() / 1000),
      topicPartitions: [
        { topic: Topic.BLUE, partition: 0 },
        { topic: Topic.RED, partition: 0 },
      ],
    })

    expect(partitionOffsets.length).toBe(2)
    for (const partitionOffset of partitionOffsets) {
      expect(typeof partitionOffset.offset).toBe("number")
    }
  })
})

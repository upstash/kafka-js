import { kafka, Topic } from "./test_setup"
import { Kafka } from "./kafka"
import { UpstashError } from "./error"
import { test, expect, describe } from "@jest/globals"
import { randomUUID } from "crypto"

test("fails with wrong auth", async () => {
  const url = process.env["UPSTASH_KAFKA_REST_URL"]
  if (!url) {
    throw new Error("TEST SETUP FAILED")
  }
  const admin = new Kafka({
    url,
    username: "username",
    password: "password",
  }).admin()

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
    await c.consume({
      consumerGroupId,
      instanceId,
      topics: [Topic.BLUE],
    })
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

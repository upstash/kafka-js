import { Kafka } from "../pkg/kafka"
import { config } from "dotenv"
config()

async function main() {
  const url = process.env["UPSTASH_KAFKA_REST_URL"]
  if (!url) {
    throw new Error("Could not find url")
  }
  const username = process.env["UPSTASH_KAFKA_REST_USERNAME"]
  if (!username) {
    throw new Error("Could not find username")
  }
  const password = process.env["UPSTASH_KAFKA_REST_PASSWORD"]
  if (!password) {
    throw new Error("Could not find password")
  }

  const kafka = new Kafka({
    url,
    username,
    password,
  })

  const a = kafka.admin()
  const existingConsumers = await a.consumers()
  await Promise.all(
    existingConsumers.flatMap((group) =>
      group.instances.map((instance) => a.removeConsumerInstance(group.name, instance.name)),
    ),
  )
}

main()

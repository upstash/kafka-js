import { kafka } from "./test_setup";
export default async function teardown(): Promise<void> {
  const a = kafka.admin();
  const existingConsumers = await a.consumers();
  await Promise.all(
    existingConsumers.flatMap(
      (group) =>
        group.instances.map(
          (instance) => a.removeConsumerInstance(group.name, instance.name),
        ),
    ),
  );
}

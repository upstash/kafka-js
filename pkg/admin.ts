import { TopicPartition, TopicPartitionOffset } from "./consumer";
import { HttpClient } from "./http";

export type OffsetsRequest =
  & { consumerGroupId: string; instanceId: string }
  & (
    | { topicPartition?: never; topicPartitions: TopicPartition[] }
    | { topicPartition: TopicPartition; topicPartitions?: never }
  );

export type TopicPartitionOffsetsRequest =
  & {
    /**
     * Unix timestamp in milliseconds or `earliest` or `latest`
     */
    timestamp: number | "earliest" | "latest";
  }
  & (
    | { topicPartition?: never; topicPartitions: TopicPartition[] }
    | { topicPartition: TopicPartition; topicPartitions?: never }
  );

/**
 * Topic names and their partitions
 */
export type GetTopicsResponse = { [topic: string]: number };

type TopicAssignments = { topic: string; partitions: number[] };

type InstanceAssignments = { name: string; topics: TopicAssignments[] };

type GroupAssignments = { name: string; instances: InstanceAssignments[] };
export class Admin {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }
  /**
   * List all topics belonging to the user
   */
  public async topics(): Promise<GetTopicsResponse> {
    return await this.client.get<GetTopicsResponse>({ path: ["topics"] });
  }

  /**
   * Lists consumers belonging to the user known by the REST server.
   */
  public async consumers(): Promise<GroupAssignments[]> {
    return await this.client.get<GroupAssignments[]>({ path: ["consumers"] });
  }

  /**
   * Stops and removes a previously created consumer group instance.
   */
  public async removeConsumerInstance(
    consumerGroup: string,
    instanceId: string,
  ): Promise<
    void
  > {
    await this.client.post({
      path: ["delete-consumer", consumerGroup, instanceId],
    });
  }
  /**
   * Returns the last committed offsets for the topic partitions inside the group. Can be used
   * alongside Commit Consumer API.
   */
  public async committedOffsets(req: OffsetsRequest): Promise<
    TopicPartitionOffset[]
  > {
    return await this.client.post<TopicPartitionOffset[]>({
      path: ["committed", req.consumerGroupId, req.instanceId],
      body: req.topicPartition ? [req.topicPartition] : req.topicPartitions,
    });
  }
  /**
   * Returns the offsets for the given partitions by timestamp. The returned offset for each
   * partition is the earliest offset whose timestamp is greater than or equal to the given
   * timestamp in the corresponding partition.
   */
  public async topicPartitionOffsets(
    req: TopicPartitionOffsetsRequest,
  ): Promise<
    TopicPartitionOffset[]
  > {
    return await this.client.post<TopicPartitionOffset[]>({
      path: ["offsets", req.timestamp.toString()],
      body: req.topicPartition ? [req.topicPartition] : req.topicPartitions,
    });
  }
}

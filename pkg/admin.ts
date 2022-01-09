import { HttpClient } from "./http.ts";

/**
 * Topic names and their partitions
 */
export type GetTopicsResponse = {
  [topic: string]: number;
};

type TopicAssignments = {
  topic: string;
  partitions: number[];
};

type InstanceAssignments = {
  name: string;
  topics: TopicAssignments[];
};

type GroupAssignments = {
  name: string;
  instances: InstanceAssignments[];
};
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
    return await this.client.get<GroupAssignments[]>({
      path: ["consumers"],
    });
  }

  /**
   * Stops and removes a previously created consumer group instance.
   */
  public async removeConsumerInstance(
    consumerGroup: string,
    instanceId: string,
  ): Promise<void> {
    await this.client.post({
      path: ["delete-consumer", consumerGroup, instanceId],
    });
  }
}

import { UpstashError } from "./error.ts";
import { ErrorResponse } from "./types.ts";

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
  private readonly url: string;
  private readonly authorization: string;

  constructor(url: string, authoriztation: string) {
    this.url = url;
    this.authorization = authoriztation;
  }
  /**
   * List all topics belonging to the user
   */
  public async topics(): Promise<GetTopicsResponse> {
    const res = await fetch(`${this.url}/topics`, {
      method: "GET",
      headers: {
        Authorization: this.authorization,
      },
    });
    if (!res.ok) {
      throw new UpstashError((await res.json()) as ErrorResponse);
    }
    return (await res.json()) as GetTopicsResponse;
  }

  /**
   * Lists consumers belonging to the user known by the REST server.
   */
  public async consumers(): Promise<GroupAssignments[]> {
    const res = await fetch(`${this.url}/consumers`, {
      method: "GET",
      headers: {
        Authorization: this.authorization,
      },
    });
    if (!res.ok) {
      throw new UpstashError((await res.json()) as ErrorResponse);
    }
    return (await res.json()) as GroupAssignments[];
  }

  /**
   * Stops and removes a previously created consumer group instance.
   */
  public async removeConsumerInstance(
    consumerGroup: string,
    instanceId: string,
  ): Promise<void> {
    const res = await fetch(
      `${this.url}/delete-consumer/${consumerGroup}/${instanceId}`,
      {
        method: "POST",
        headers: {
          Authorization: this.authorization,
        },
      },
    );
    await res.body?.cancel();

    if (!res.ok) {
      throw new UpstashError((await res.json()) as ErrorResponse);
    }
  }
}

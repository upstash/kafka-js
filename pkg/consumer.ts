import { UpstashError } from "./error.ts";
import { ErrorResponse, Message } from "./types.ts";

export type TopicPartition = {
  topic: string;
  partition: number;
};
export type TopicPartitionOffset = TopicPartition & {
  offset: number;
};

export type FetchRequest =
  & {
    timeout?: number;
    topicPartitionOffsets?: TopicPartitionOffset[];
  }
  & (
    | {
      topic: string;
      partition: number;
      offset: number;
    }
    | {
      topic?: never;
      partition?: never;
      offset?: never;
    }
  );

type BaseConsumerRequest = {
  /**
   * The name of the consumer group which is used as Kafka consumer group id
   * @see https://kafka.apache.org/documentation/#consumerconfigs_group.id
   */
  consumerGroupId: string;

  /**
   * Used to identify kafka consumer instances in the same consumer group.
   * Each consumer instance id is handled by a separate consumer client.
   * @see https://kafka.apache.org/documentation/#consumerconfigs_group.instance.id
   */
  instanceId: string;
};
export type ConsumeRequest = BaseConsumerRequest & {
  topics: string[];

  /**
   * Defines the time to wait at most for the fetch request in milliseconds.
   * It's optional and its default value 1000.
   */
  timeout?: number;

  /**
   * If true, the consumer's offset will be periodically committed in the background.
   */
  autoCommit?: boolean;

  /**
   * The frequency in milliseconds that the consumer offsets are auto-committed to Kafka if auto commit is enabled.
   * Default is 5000.
   */
  autoCommitInterval?: number;

  /**
   * What to do when there is no initial offset in Kafka or if the current
   * offset does not exist any more on the server. Default value is `latest`.
   *
   * `earliest`: Automatically reset the offset to the earliest offset
   *
   * `latest`: Automatically reset the offset to the latest offset
   *
   * `none`: Throw exception to the consumer if no previous offset is found for the consumer's group.
   */
  autoOffsetReset?: "earliest" | "latest" | "none";
};

export type CommitRequest = BaseConsumerRequest & {
  /**
   * Commits the last consumed messages if left empty
   */
  offset?: TopicPartitionOffset | TopicPartitionOffset[];
};

export type CommittedRequest = BaseConsumerRequest & {
  topicPartitions: TopicPartition[];
};

/**
 * Consumer APIs are used to fetch/consume messages from Kafka topics. Similar
 * to Kafka clients there are two mechanisms to consume messages; one is
 * seeking offsets manually and the other is to use consumer groups which
 * manage offsets automatically inside a special Kafka topic.
 *
 * We call the first one as Fetch API and the second one as Consume API.
 * Consume API has some additional methods if you wish to commit offsets manually.
 */
export class Consumer {
  private readonly url: string;
  private readonly authorization: string;

  constructor(url: string, authoriztation: string) {
    this.url = url;
    this.authorization = authoriztation;
  }
  /**
   * Fetches the message(s) starting with a given offset inside the partition.
   * This API doesn't use consumer groups.
   *
   * Fetch from a single <topic, partition, offset>:
   * ```ts
   *   fetch({
   *        topic: "greeting",
   *        partition: 3,
   *        timeout: 1000
   *    })
   * ```
   *
   * Fetch from multiple <topic, partition, offset> triples:
   * ```ts
   *    fetch({
   *       topicPartitionOffsets": [
   *            {"topic": "greetings", "partition": 1, "offset": 1},
   *            {"topic": "greetings", "partition": 2, "offset": 1},
   *            {"topic": "greetings", "partition": 3, "offset": 1},
   *            {"topic": "cities", "partition": 1, "offset": 10},
   *            {"topic": "cities", "partition": 2, "offset": 20}
   *        ],
   *        timeout: 1000
   *    })
   * ```
   *
   * You can even combine both:
   * ```ts
   *    fetch({
   *        topic: "words",
   *        partition: 0,
   *        offset: 0,
   *        topicPartitionOffsets: [
   *            { topic: "cities", partition: 1, offset: 10},
   *            { topic: "cities", partition: 2, offset: 20}
   *        ],
   *        timeout: 5000
   *    })
   * ```
   */
  public async fetch(req: FetchRequest): Promise<Message[]> {
    const res = await fetch(`${this.url}/fetch`, {
      method: "POST",
      headers: {
        Authorization: this.authorization,
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      throw new UpstashError((await res.json()) as ErrorResponse);
    }
    return (await res.json()) as Message[];
  }

  /**
   * Fetches the message(s) using Kafka consumer group mechanism and may commit
   * the offsets automatically.
   *
   * The first time a consumer is created, it needs to figure out the group
   * coordinator by asking the Kafka brokers and joins the consumer group.
   * This process takes some time to complete. That's why when a consumer
   * instance is created first time, it may return empty messages until consumer
   * group coordination is completed.
   *
   * Consume from a single topic with timeout:
   * ```ts
   *  consume({
   *    consumerGroupId: "mygroup",
   *    instanceId: "myconsumer",
   *    topics: ["greetings"]
   *  })
   * ```
   *
   * Consume from multiple topics:
   * ```ts
   *  consume({
   *    consumerGroupId: "mygroup",
   *    instanceId: "myconsumer",
   *    topics: ["greetings", "cities", "world"],
   *    timeout: 1000
   *  })
   * ```
   *
   *  Consume from topics without auto commit:
   * ```ts
   *  consume({
   *    consumerGroupId: "mygroup",
   *    instanceId: "myconsumer",
   *    topics: ["greetings", "cities", "world"],
   *    timeout: 1000,
   *    autoCommit: false
   *  })
   * ```
   *
   *  Consume from topics starting from the earliest message:
   * ```ts
   *  consume({
   *    consumerGroupId: "mygroup",
   *    instanceId: "myconsumer",
   *    topics: ["greetings", "cities", "world"],
   *    timeout: 1000,
   *    autoOffsetReset: "earliest"
   *  })
   * ```
   *
   *  Consume from topics with custom auto commit interval:
   * ```ts
   *  consume({
   *    consumerGroupId: "mygroup",
   *    instanceId: "myconsumer",
   *    topics: ["greetings", "cities", "world"],
   *    timeout: 1000,
   *    autoCommit: true,
   *    autoCommitInterval: 3000
   *  })
   * ```
   */
  public async consume(req: ConsumeRequest): Promise<Message[]> {
    const body: Record<string, unknown> = {};
    if (req.topics.length === 1) {
      body.topic = req.topics[0];
    } else {
      body.topics = req.topics;
    }

    if (typeof req.timeout === "number") {
      body.timeout = req.timeout;
    }
    const headers: HeadersInit = {
      authorization: this.authorization,
    };
    if (typeof req.autoCommit === "boolean") {
      headers["Kafka-Enable-Auto-Commit"] = req.autoCommit.toString();
    }
    if (typeof req.autoCommitInterval === "number") {
      headers["Kafka-Auto-Commit-Interval"] = req.autoCommitInterval.toString();
    }
    if (typeof req.autoOffsetReset === "string") {
      headers["Kafka-Auto-Offset-Reset"] = req.autoOffsetReset;
    }

    const res = await fetch(
      `${this.url}/consume/${req.consumerGroupId}/${req.instanceId}`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers,
      },
    );
    if (!res.ok) {
      throw new UpstashError((await res.json()) as ErrorResponse);
    }
    return (await res.json()) as Message[];
  }

  /**
   * Commits the fetched message offsets. `commit` should be used alongside
   * `consume`, especially when auto commit is disabled.
   *
   *  Commit single topic partition offset:
   *  ```ts
   *    commit({
   *      consumerGroupId: "mygroup",
   *      instanceId: "myconsumer",
   *      offset: {
   *        topic: "cities",
   *        partition: 1,
   *        offset: 10,
   *      }
   *    })
   *  ```
   *
   *  Commit multiple topic partition offsets:
   *  ```ts
   *    commit({
   *      consumerGroupId: "mygroup",
   *      instanceId: "myconsumer",
   *      offset: [
   *        { topic: "cities", partition: 0, offset: 13 },
   *        { topic: "cities", partition: 1, offset: 37 },
   *        { topic: "greetings", partition: 0, offset: 19 },
   *      ]
   *    })
   *  ```
   *
   *  Commit all latest consumed message offsets:
   *  ```ts
   *    commit({
   *      consumerGroupId: "mygroup",
   *      instanceId: "myconsumer",
   *    })
   *  ```
   */
  public async commit(req: CommitRequest): Promise<void> {
    const res = await fetch(
      `${this.url}/commit/${req.consumerGroupId}/${req.instanceId}`,
      {
        method: "POST",
        headers: {
          Authorization: this.authorization,
        },
        body: JSON.stringify(req.offset),
      },
    );
    if (!res.ok) {
      throw new UpstashError((await res.json()) as ErrorResponse);
    }
  }

  /**
   *  Returns the last committed offsets for the topic partitions inside the group.
   *
   * List committed offsets for multiple topic partitions:
   *  ```ts
   *    committed({
   *      consumerGroupId: "mygroup",
   *      instanceId: "myconsumer",
   *      topicPartitions: [
   *        { topic: "cities", partition: 0 },
   *        { topic: "cities", partition: 1 },
   *        { topic: "greetings", partition: 0},
   *      ]
   *    })
   *  ```
   */
  public async commited(
    req: CommittedRequest,
  ): Promise<TopicPartitionOffset[]> {
    const res = await fetch(
      `${this.url}/committed/${req.consumerGroupId}/${req.instanceId}`,
      {
        method: "POST",
        headers: {
          Authorization: this.authorization,
        },
        body: JSON.stringify(req.topicPartitions),
      },
    );
    if (!res.ok) {
      throw new UpstashError((await res.json()) as ErrorResponse);
    }
    return (await res.json()) as TopicPartitionOffset[];
  }
}

/**
 * Connection credentials for upstash kafka.
 * Get them from https://console.upstash.com/kafka/<uuid>
 */
export type KafkaConfig = {
  /**
   * UPSTASH_KAFKA_REST_URL
   */
  url: string;

  /**
   * UPSTASH_KAFKA_REST_USERNAME
   */
  username: string;

  /**
   * UPSTASH_KAFKA_REST_PASSWORD
   */
  password: string;
};

/**
 * Optional parameters for each produced message
 */
export type ProduceOptions = {
  /**
   * The partition to produce to.
   * Will be assigned by kafka if left empty.
   */
  partition?: number;

  /**
   * The unix timestamp in seconds.
   * Will be assigned by kafka if left empty.
   */
  timestamp?: number;

  /**
   * Events with the same event key (e.g., a customer or vehicle ID) are written
   * to the same partition, and Kafka guarantees that any consumer of a given
   * topic-partition will always read that partition's events in exactly the
   * same order as they were written.
   */
  key?: string;

  headers?: { key: string; value: string }[];
};

/**
 * Request payload to produce a message to a topic.
 */
export type ProduceRequest = ProduceOptions & {
  /**
   * The topic where the message gets publish.
   * Make sure this exists in upstash before. Otherwise it will throw an error.
   */
  topic: string;
  /**
   * The message itself. This will be serialized using `JSON.stringify`
   */
  value: unknown;
};

/**
 * Response for each successfull message produced
 */
export type ProduceResponse = {
  topic: string;
  partition: number;
  offset: number;
  timestamp: number;
};

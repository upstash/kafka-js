import { Admin } from "./admin.ts";
import { Producer } from "./producer.ts";
import { Consumer } from "./consumer.ts";
import { HttpClient } from "./http.ts";
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
 * Serverless Kafka client for upstash.
 */
export class Kafka {
  private readonly client: HttpClient;

  /**
   * Create a new kafka client
   *
   * @example
   * ```typescript
   * const kafka = new Kafka({
   *  url: "<UPSTASH_KAFKA_REST_URL>",
   *  username: "<UPSTASH_KAFKA_REST_USERNAME>",
   *  password: "<UPSTASH_KAFKA_REST_PASSWORD>",
   * });
   * ```
   */
  constructor(config: KafkaConfig) {
    this.client = new HttpClient({
      baseUrl: config.url,
      headers: new Headers({
        authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`,
      }),
    });
  }
  /**
   * Create a new producer client
   */
  public producer(): Producer {
    return new Producer(this.client);
  }

  /**
   * Create a new consumer client
   */
  public consumer(): Consumer {
    return new Consumer(this.client);
  }

  /**
   * Create a new admin client
   */
  public admin(): Admin {
    return new Admin(this.client);
  }
}

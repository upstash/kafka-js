import { HttpClient } from "./http"
import superjson from "superjson"

/**
 * Optional parameters for each produced message
 */
export type ProduceOptions = {
  /**
   * The partition to produce to.
   * Will be assigned by kafka if left empty.
   */
  partition?: number
  /**
   * The unix timestamp in seconds.
   * Will be assigned by kafka if left empty.
   */
  timestamp?: number
  /**
   * Events with the same event key (e.g., a customer or vehicle ID) are written
   * to the same partition, and Kafka guarantees that any consumer of a given
   * topic-partition will always read that partition's events in exactly the
   * same order as they were written.
   */
  key?: string
  headers?: { key: string; value: string }[]
}

/**
 * Request payload to produce a message to a topic.
 */
export type ProduceRequest = ProduceOptions & {
  /**
   * The topic where the message gets publish.
   * Make sure this exists in upstash before. Otherwise it will throw an error.
   */
  topic: string
  /**
   * The message itself. This will be serialized using `JSON.stringify`
   */
  value: unknown
}

/**
 * Response for each successfull message produced
 */
export type ProduceResponse = {
  topic: string
  partition: number
  offset: number
  timestamp: number
}

export class Producer {
  private readonly client: HttpClient

  constructor(client: HttpClient) {
    this.client = client
  }
  /**
   * Produce a single message to a single topic
   */
  public async produce<TMessage>(
    topic: string,
    message: TMessage,
    opts?: ProduceOptions,
  ): Promise<ProduceResponse> {
    const request: ProduceRequest = {
      topic,
      value: typeof message === "string" ? message : superjson.stringify(message),
      ...opts,
    }

    const res = await this.client.post<ProduceResponse[]>({
      path: ["produce"],
      body: request,
    })

    return res[0]
  }

  /**
   * Produce multiple messages to different topics at the same time
   *
   * Each entry in the response array belongs to the request with the same order in the requests.
   */
  public async produceMany(requests: ProduceRequest[]): Promise<ProduceResponse[]> {
    requests = requests.map(({ value, ...rest }) => ({
      ...rest,
      value: typeof value === "string" ? value : JSON.stringify(value),
    }))

    return await this.client.post<ProduceResponse[]>({
      path: ["produce"],
      body: requests,
    })
  }
}

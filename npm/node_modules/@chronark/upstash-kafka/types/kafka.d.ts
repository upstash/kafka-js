import { KafkaConfig, ProduceOptions, ProduceRequest, ProduceResponse } from "./types.js";
export declare class Kafka {
    private readonly url;
    private readonly authorization;
    constructor(config: KafkaConfig);
    /**
     * Produce a single message to a single topic
     */
    produce<TMessage>(topic: string, message: TMessage, opts?: ProduceOptions): Promise<ProduceResponse>;
    /**
     * Produce multiple messages to different topics at the same time
     *
     * Each entry in the response array belongs to the request with the same order in the requests.
     */
    produceMany(requests: ProduceRequest[]): Promise<ProduceResponse[]>;
}

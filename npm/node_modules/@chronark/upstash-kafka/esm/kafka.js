import * as dntShim from "./_dnt.shims.js";
import { UpstashError } from "./error.js";
export class Kafka {
    constructor(config) {
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "authorization", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.url = config.url;
        this.authorization = `Basic ${btoa(`${config.username}:${config.password}`)}`;
    }
    /**
     * Produce a single message to a single topic
     */
    async produce(topic, message, opts) {
        const request = {
            topic,
            value: JSON.stringify(message),
            ...opts,
        };
        const res = await dntShim.fetch(`${this.url}/produce`, {
            method: "POST",
            headers: {
                Authorization: this.authorization,
            },
            body: JSON.stringify(request),
        });
        if (!res.ok) {
            throw new UpstashError(await res.json());
        }
        const json = await res.json();
        return json[0];
    }
    /**
     * Produce multiple messages to different topics at the same time
     *
     * Each entry in the response array belongs to the request with the same order in the requests.
     */
    async produceMany(requests) {
        const res = await dntShim.fetch(`${this.url}/produce`, {
            method: "POST",
            headers: {
                Authorization: this.authorization,
            },
            body: JSON.stringify(requests),
        });
        if (!res.ok) {
            throw new UpstashError(await res.json());
        }
        return await res.json();
    }
}

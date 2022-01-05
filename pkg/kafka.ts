import { KafkaConfig } from "./types.ts";
import { Admin } from "./admin.ts";
import { Producer } from "./producer.ts";
import { Consumer } from "./consumer.ts";

export class Kafka {
  private readonly url: string;
  private readonly authorization: string;

  constructor(config: KafkaConfig) {
    this.url = config.url;
    this.authorization = `Basic ${
      btoa(`${config.username}:${config.password}`)
    }`;
  }

  public producer(): Producer {
    return new Producer(this.url, this.authorization);
  }

  public consumer(): Consumer {
    return new Consumer(this.url, this.authorization);
  }

  public admin(): Admin {
    return new Admin(this.url, this.authorization);
  }
}

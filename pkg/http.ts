import { UpstashError } from "./error.ts";

export type Request = {
  path: string[];
  /**
   * Request body will be serialized to json
   */
  body?: unknown;

  headers?: Record<string, string>;

  retries?: number;
};

export type HttpClientConfig = {
  headers: Headers;
  baseUrl: string;
};
type ErrorResponse = { result: string; error: string; status: number };

export class HttpClient {
  public readonly baseUrl: string;
  public readonly headers: Headers;

  public constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");

    this.headers = new Headers(config.headers);
  }

  private async request<TResponse>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    req: Request,
  ): Promise<TResponse> {
    const headers = new Headers({ "Content-Type": "application/json" });
    for (const [k, v] of this.headers) {
      headers.set(k, v);
    }
    for (const [k, v] of Object.entries(req.headers ?? {})) {
      headers.set(k, v);
    }

    let err = new Error();
    for (let attempt = 0; attempt <= (req.retries ?? 5); attempt++) {
      if (attempt > 0) {
        // 0.25s up to 8s timeouts
        await new Promise((r) => setTimeout(r, 2 ** attempt * 250));
      }

      try {
        const res = await fetch([this.baseUrl, ...req.path].join("/"), {
          method,
          headers,
          body: JSON.stringify(req.body),
        });

        const body = await res.json();
        if (!res.ok || body["error"]) {
          throw new UpstashError(body as ErrorResponse);
        }

        return body as TResponse;
      } catch (e) {
        err = e;
      }
    }
    throw err;
  }

  public async get<TResponse>(req: Request): Promise<TResponse> {
    return await this.request<TResponse>("GET", req);
  }

  public async post<TResponse>(req: Request): Promise<TResponse> {
    return await this.request<TResponse>("POST", req);
  }
}
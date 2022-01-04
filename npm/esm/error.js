/**
 * Result of a bad request to upstash
 */
export class UpstashError extends Error {
    constructor(res) {
        super(res.error);
        Object.defineProperty(this, "result", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "error", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "UpstashError",
            this.result = res.result,
            this.error = res.error,
            this.status = res.status;
    }
}

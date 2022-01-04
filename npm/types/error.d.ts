/**
 * Result of a bad request to upstash
 */
export declare class UpstashError extends Error {
    readonly result: string;
    readonly error: string;
    readonly status: number;
    constructor(res: {
        result: string;
        error: string;
        status: number;
    });
}

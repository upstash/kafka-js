import { Deno } from "@deno/shim-deno";
export { Deno } from "@deno/shim-deno";
import { fetch, File, FormData, Headers, Request, Response } from "undici";
export { fetch, File, FormData, Headers, Request, Response } from "undici";
export declare const dntGlobalThis: Omit<typeof globalThis, "fetch" | "File" | "FormData" | "Headers" | "Request" | "Response" | "Deno"> & {
    Deno: typeof Deno;
    fetch: typeof fetch;
    File: typeof File;
    FormData: typeof FormData;
    Headers: typeof Headers;
    Request: typeof Request;
    Response: typeof Response;
};

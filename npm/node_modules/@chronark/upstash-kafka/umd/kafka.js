var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./_dnt.shims.js", "./error.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Kafka = void 0;
    const dntShim = __importStar(require("./_dnt.shims.js"));
    const error_js_1 = require("./error.js");
    class Kafka {
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
                throw new error_js_1.UpstashError(await res.json());
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
                throw new error_js_1.UpstashError(await res.json());
            }
            return await res.json();
        }
    }
    exports.Kafka = Kafka;
});

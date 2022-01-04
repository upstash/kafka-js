(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UpstashError = void 0;
    /**
     * Result of a bad request to upstash
     */
    class UpstashError extends Error {
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
    exports.UpstashError = UpstashError;
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncLocalStorage = void 0;
class AsyncLocalStorage {
    current;
    getStore() { return this.current; }
    run(store, callback) {
        const previous = this.current;
        this.current = store;
        try {
            const result = callback();
            if (result && typeof result.then === "function") {
                return result.finally(() => { this.current = previous; });
            }
            this.current = previous;
            return result;
        }
        catch (error) {
            this.current = previous;
            throw error;
        }
    }
}
exports.AsyncLocalStorage = AsyncLocalStorage;
//# sourceMappingURL=async_hooks.js.map
export declare class AsyncLocalStorage<T> {
    private current?;
    getStore(): T | undefined;
    run<R>(store: T, callback: () => R): R;
}
//# sourceMappingURL=async_hooks.d.ts.map
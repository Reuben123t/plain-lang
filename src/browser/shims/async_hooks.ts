export class AsyncLocalStorage<T> {
  private current?: T;
  getStore(): T | undefined { return this.current; }
  run<R>(store: T, callback: () => R): R {
    const previous = this.current;
    this.current = store;
    try {
      const result = callback();
      if (result && typeof (result as any).then === "function") {
        return (result as any).finally(() => { this.current = previous; }) as R;
      }
      this.current = previous;
      return result;
    } catch (error) { this.current = previous; throw error; }
  }
}

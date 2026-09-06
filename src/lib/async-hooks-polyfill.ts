// Browser polyfill for node:async_hooks
// This prevents the AsyncLocalStorage error in @tanstack/start-storage-context
if (typeof globalThis !== "undefined") {
  if (!globalThis.AsyncLocalStorage) {
    globalThis.AsyncLocalStorage = class AsyncLocalStoragePolyfill {
      static instances = new WeakMap();
      private store: unknown = null;

      getStore() {
        return this.store;
      }

      enterWith(value: unknown) {
        this.store = value;
      }

      run(store: unknown, callback: (...args: unknown[]) => unknown, ...args: unknown[]) {
        const oldStore = this.store;
        this.store = store;
        try {
          return callback(...args);
        } finally {
          this.store = oldStore;
        }
      }
    };
  }
}

export {};

declare module 'vitest' {
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const test: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: (val: any) => any;
  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const afterEach: (fn: () => void | Promise<void>) => void;
  export const beforeAll: (fn: () => void | Promise<void>) => void;
  export const afterAll: (fn: () => void | Promise<void>) => void;
  export const vi: {
    fn: (impl?: any) => any;
    spyOn: (obj: any, method: string) => any;
    mock: (path: string, factory?: any) => void;
    clearAllMocks: () => void;
    resetAllMocks: () => void;
  };
}

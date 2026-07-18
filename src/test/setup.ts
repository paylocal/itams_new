import "@testing-library/jest-dom/vitest";

// Mock fetch
global.fetch = (() => Promise.reject(new Error("fetch is not mocked"))) as any;
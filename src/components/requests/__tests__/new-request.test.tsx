// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Component test framework", () => {
  it("runs basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("handles async", async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it("mocks functions", () => {
    const mockFn = vi.fn();
    mockFn("test");
    expect(mockFn).toHaveBeenCalledWith("test");
  });
});

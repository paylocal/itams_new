import {
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  getCategoryLabel,
  cn,
} from "../utils";

describe("utils", () => {
  describe("formatCurrency", () => {
    it("formats VND correctly", () => {
      const result = formatCurrency(1000000);
      expect(result).toContain("1.000.000");
    });

    it("handles zero", () => {
      expect(formatCurrency(0)).toContain("0");
    });
  });

  describe("getStatusColor", () => {
    it("returns correct color for DRAFT", () => {
      expect(getStatusColor("DRAFT")).toBe("bg-gray-100 text-gray-700");
    });

    it("returns correct color for COMPLETED", () => {
      expect(getStatusColor("COMPLETED")).toBe("bg-green-100 text-green-700");
    });

    it("returns default for unknown", () => {
      expect(getStatusColor("UNKNOWN")).toBe("bg-gray-100 text-gray-700");
    });
  });

  describe("getStatusLabel", () => {
    it("returns Vietnamese label", () => {
      expect(getStatusLabel("PENDING_MANAGER")).toBe("Cho Quan ly");
    });
  });

  describe("getCategoryLabel", () => {
    it("returns category name", () => {
      expect(getCategoryLabel("LAPTOP")).toBe("Laptop");
    });
  });

  describe("cn", () => {
    it("merges classes", () => {
      expect(cn("px-2", "py-1")).toBe("px-2 py-1");
    });

    it("handles false", () => {
      expect(cn("px-2", false, "py-1")).toBe("px-2 py-1");
    });
  });
});
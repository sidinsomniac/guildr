import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AllocationChart } from "../allocation-chart";

// Mock recharts to avoid canvas/rendering issues
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data }: { data: Array<{ name: string; value: number }> }) => (
    <div data-testid="pie" data-chart-data={JSON.stringify(data)} />
  ),
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe("AllocationChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the chart container", () => {
    const allocation = {
      EQUITY: 33.96855882049938,
      DEBT: 66.03144117950063,
      CASH: 0,
    };

    render(<AllocationChart allocation={allocation} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("maps allocation data correctly with fixed decimal places", () => {
    const allocation = {
      EQUITY: 33.96855882049938,
      DEBT: 66.03144117950063,
      CASH: 0,
    };

    render(<AllocationChart allocation={allocation} />);

    const pie = screen.getByTestId("pie");
    const chartData = JSON.parse(pie.getAttribute("data-chart-data") || "[]");

    // Check that data is mapped correctly
    expect(chartData).toHaveLength(2); // CASH filtered out because it's 0
    expect(chartData[0]).toEqual({ name: "Equity", value: 34 });
    expect(chartData[1]).toEqual({ name: "Debt", value: 66 });
  });

  it("filters out zero-value allocations", () => {
    const allocation = {
      EQUITY: 50,
      DEBT: 50,
      CASH: 0,
    };

    render(<AllocationChart allocation={allocation} />);

    const pie = screen.getByTestId("pie");
    const chartData = JSON.parse(pie.getAttribute("data-chart-data") || "[]");

    // CASH should be filtered out
    expect(chartData).toHaveLength(2);
    expect(chartData.every((item: any) => item.value > 0)).toBe(true);
  });

  it("renders tooltip with percentage format", () => {
    const allocation = {
      EQUITY: 33.96855882049938,
      DEBT: 66.03144117950063,
      CASH: 0,
    };

    render(<AllocationChart allocation={allocation} />);

    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("renders legend", () => {
    const allocation = {
      EQUITY: 33.96855882049938,
      DEBT: 66.03144117950063,
      CASH: 0,
    };

    render(<AllocationChart allocation={allocation} />);

    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("handles all-cash portfolio", () => {
    const allocation = {
      EQUITY: 0,
      DEBT: 0,
      CASH: 100,
    };

    render(<AllocationChart allocation={allocation} />);

    const pie = screen.getByTestId("pie");
    const chartData = JSON.parse(pie.getAttribute("data-chart-data") || "[]");

    expect(chartData).toHaveLength(1);
    expect(chartData[0]).toEqual({ name: "Cash", value: 100 });
  });

  it("logs allocation and data during render", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const allocation = {
      EQUITY: 33.96855882049938,
      DEBT: 66.03144117950063,
      CASH: 0,
    };

    render(<AllocationChart allocation={allocation} />);

    expect(consoleSpy).toHaveBeenCalledWith(
      "AllocationChart - allocation:",
      allocation
    );
    expect(consoleSpy).toHaveBeenCalledWith("AllocationChart - mapped data:", [
      { name: "Equity", value: 34 },
      { name: "Debt", value: 66 },
    ]);

    consoleSpy.mockRestore();
  });

  it("converts values to numbers correctly", () => {
    const allocation = {
      EQUITY: 33.96855882049938,
      DEBT: 66.03144117950063,
      CASH: 0,
    };

    render(<AllocationChart allocation={allocation} />);

    const pie = screen.getByTestId("pie");
    const chartData = JSON.parse(pie.getAttribute("data-chart-data") || "[]");

    chartData.forEach((item: any) => {
      expect(typeof item.value).toBe("number");
    });
  });

  it("handles edge case with very small decimal values", () => {
    const allocation = {
      EQUITY: 0.001,
      DEBT: 99.999,
      CASH: 0,
    };

    render(<AllocationChart allocation={allocation} />);

    const pie = screen.getByTestId("pie");
    const chartData = JSON.parse(pie.getAttribute("data-chart-data") || "[]");

    // 0.001 rounds to 0, so it gets filtered out (only Debt remains)
    expect(chartData).toHaveLength(1);
    expect(chartData[0]).toEqual({ name: "Debt", value: 100 });
  });
});

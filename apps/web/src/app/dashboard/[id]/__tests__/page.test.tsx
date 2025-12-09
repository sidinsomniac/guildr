import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardPage from "../page";

// Mock the API client
jest.mock("@guildr/lib/api", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

// Mock the AllocationChart component
jest.mock("../allocation-chart", () => ({
  AllocationChart: ({ allocation }: { allocation: Record<string, number> }) => (
    <div data-testid="allocation-chart">
      Equity: {allocation.EQUITY}% Debt: {allocation.DEBT}%
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowUpRight: () => <div data-testid="arrow-up-right">📈</div>,
  IndianRupee: () => <div data-testid="indian-rupee">₹</div>,
  PieChart: () => <div data-testid="pie-chart-icon">📊</div>,
}));

import { apiClient } from "@guildr/lib/api";

describe("DashboardPage", () => {
  const mockPortfolioData = {
    totalValue: 18734.03,
    totalGainLoss: 17966.03,
    totalGainLossPct: 2339.33,
    allocation: {
      EQUITY: 33.96855882049938,
      DEBT: 66.03144117950063,
      CASH: 0,
    },
    target: null,
  };

  const mockMarketData = {
    indices: {
      NIFTY_50: {
        value: 22500,
        change: "+2.5%",
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders error message when API fails", async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(
      new Error("API Error")
    );

    const params = Promise.resolve({ id: "test-123" });

    const result = await DashboardPage({ params });

    expect(result.props.children).toContain("Error loading dashboard");
  });

  it("renders page title", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    expect(screen.getByText("My Portfolio")).toBeInTheDocument();
  });

  it("renders total net worth card with formatted money", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    expect(screen.getByText("Total Net Worth")).toBeInTheDocument();
    // Check that the value is formatted (should have ₹ symbol and no decimals)
    const netWorthText = screen.getByText(/18,734/);
    expect(netWorthText).toBeInTheDocument();
  });

  it("renders total gain/loss card with correct color based on value", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    const { container } = render(await DashboardPage({ params }));

    expect(screen.getByText("Total Gain/Loss")).toBeInTheDocument();
    // Positive gain should be green
    const gainLossElement = container.querySelector(".text-green-600");
    expect(gainLossElement).toBeInTheDocument();
  });

  it("renders NIFTY 50 index in header", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    expect(screen.getByText("NIFTY 50")).toBeInTheDocument();
    expect(screen.getByText("+2.5%")).toBeInTheDocument();
  });

  it("renders allocation status with off-track indicator", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: {
          ...mockPortfolioData,
          target: { EQUITY: 60 },
        },
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    expect(screen.getByText("Allocation Status")).toBeInTheDocument();
    // Equity is 33.96% vs target 60%, difference is 26% > 5%, so should be Off Track
    expect(screen.getByText(/⚠️ Off Track/)).toBeInTheDocument();
  });

  it("renders allocation status with on-track when within threshold", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: {
          ...mockPortfolioData,
          allocation: {
            EQUITY: 35,
            DEBT: 65,
            CASH: 0,
          },
          target: { EQUITY: 40 },
        },
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    // Difference is 5%, which is exactly at threshold, should be On Track
    expect(screen.getByText(/✅ On Track/)).toBeInTheDocument();
  });

  it("renders asset allocation chart", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    expect(screen.getByText("Asset Allocation")).toBeInTheDocument();
    expect(screen.getByTestId("allocation-chart")).toBeInTheDocument();
  });

  it("renders AI copilot insights section", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    expect(screen.getByText("AI Copilot Insights")).toBeInTheDocument();
    expect(screen.getByText(/Consider shifting to Debt/)).toBeInTheDocument();
  });

  it("displays equity percentage in AI insights", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    expect(screen.getByText(/34%/)).toBeInTheDocument();
  });

  it("handles missing market data gracefully", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: {
          indices: {},
        },
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    // Should render with default value of 0
    expect(screen.getByText("₹0")).toBeInTheDocument();
  });

  it("displays 'Last updated: Just now' text", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    expect(screen.getByText("Last updated: Just now")).toBeInTheDocument();
  });

  it("handles negative gain/loss with red color", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: {
          ...mockPortfolioData,
          totalGainLoss: -5000,
        },
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    const { container } = render(await DashboardPage({ params }));

    const gainLossElement = container.querySelector(".text-red-600");
    expect(gainLossElement).toBeInTheDocument();
  });

  it("formats gain/loss percentage correctly", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    expect(screen.getByText("2339.33% all time")).toBeInTheDocument();
  });

  it("passes correct allocation data to AllocationChart", async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        portfolio: mockPortfolioData,
        market: mockMarketData,
      },
    });

    const params = Promise.resolve({ id: "test-123" });
    render(await DashboardPage({ params }));

    const chart = screen.getByTestId("allocation-chart");
    expect(chart).toHaveTextContent("Equity: 33.96855882049938%");
    expect(chart).toHaveTextContent("Debt: 66.03144117950063%");
  });
});

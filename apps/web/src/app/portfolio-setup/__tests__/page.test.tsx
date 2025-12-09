import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PortfolioSetupPage from "../page";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: jest.fn((key) => {
      if (key === "userId") return "user-123";
      if (key === "profile") return "MODERATE";
      return null;
    }),
  }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the API client
jest.mock("@guildr/lib/api", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Plus: () => <div data-testid="plus-icon">+</div>,
  Trash2: () => <div data-testid="trash-icon">🗑</div>,
  Save: () => <div data-testid="save-icon">💾</div>,
}));

import { apiClient } from "@guildr/lib/api";

describe("PortfolioSetupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.post as jest.Mock).mockImplementation((endpoint) => {
      if (endpoint === "/portfolios") {
        return Promise.resolve({
          data: { id: "portfolio-123" },
        });
      }
      if (endpoint === "/holdings/bulk") {
        return Promise.resolve({
          data: { success: true },
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });
  });

  it("renders the portfolio setup page", () => {
    render(<PortfolioSetupPage />);

    expect(screen.getByText("Build Your Portfolio")).toBeInTheDocument();
  });

  it("displays the user profile from query params", () => {
    render(<PortfolioSetupPage />);

    expect(screen.getByText(/MODERATE/)).toBeInTheDocument();
  });

  it("initializes portfolio on component mount", async () => {
    render(<PortfolioSetupPage />);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/portfolios", {
        userId: "user-123",
        name: "My First Portfolio",
        currency: "INR",
      });
    });
  });

  it("renders the form with input fields", () => {
    render(<PortfolioSetupPage />);

    // Check for form labels
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Symbol / Name")).toBeInTheDocument();
    expect(screen.getByText("Quantity")).toBeInTheDocument();
    expect(screen.getByText("Buy Price (₹)")).toBeInTheDocument();
    expect(screen.getByText("Class")).toBeInTheDocument();
  });

  it("allows adding new holding rows", () => {
    render(<PortfolioSetupPage />);

    const addButton = screen.getByText("Add Another Holding");
    fireEvent.click(addButton);

    // Should have multiple Type labels after adding a row
    const typeLabels = screen.getAllByText("Type");
    expect(typeLabels.length).toBe(2);
  });

  it("allows removing holding rows", () => {
    render(<PortfolioSetupPage />);

    // Add a row first
    const addButton = screen.getByText("Add Another Holding");
    fireEvent.click(addButton);

    // Should have 2 type labels
    let typeLabels = screen.getAllByText("Type");
    expect(typeLabels.length).toBe(2);

    // Remove the second row
    const trashButtons = screen.getAllByTestId("trash-icon");
    fireEvent.click(trashButtons[1]);

    // Should be back to 1 type label
    typeLabels = screen.getAllByText("Type");
    expect(typeLabels.length).toBe(1);
  });

  it("updates symbol field", () => {
    render(<PortfolioSetupPage />);

    const symbolInputs = screen.getAllByPlaceholderText(
      "Search..."
    ) as HTMLInputElement[];
    fireEvent.change(symbolInputs[0], { target: { value: "RELIANCE" } });

    expect(symbolInputs[0]).toHaveValue("RELIANCE");
  });

  it("updates quantity field", () => {
    render(<PortfolioSetupPage />);

    const inputs = screen.getAllByPlaceholderText("0") as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: "10" } });

    expect(inputs[0]).toHaveValue(10);
  });

  it("updates buy price field", () => {
    render(<PortfolioSetupPage />);

    const inputs = screen.getAllByPlaceholderText("0") as HTMLInputElement[];
    fireEvent.change(inputs[1], { target: { value: "2500" } });

    expect(inputs[1]).toHaveValue(2500);
  });

  it("handles successful portfolio submission", async () => {
    render(<PortfolioSetupPage />);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/portfolios", expect.any(Object));
    });

    const finishButton = screen.getByText("Finish Setup");
    fireEvent.click(finishButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        "/holdings/bulk",
        expect.objectContaining({
          portfolioId: "portfolio-123",
        })
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard/portfolio-123");
    });
  });

  it("filters empty holdings on submission", async () => {
    render(<PortfolioSetupPage />);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/portfolios", expect.any(Object));
    });

    // Add a row but don't fill it
    const addButton = screen.getByText("Add Another Holding");
    fireEvent.click(addButton);

    // Fill only the first row
    const symbolInputs = screen.getAllByPlaceholderText(
      "Search..."
    ) as HTMLInputElement[];
    const inputs = screen.getAllByPlaceholderText("0") as HTMLInputElement[];

    fireEvent.change(symbolInputs[0], { target: { value: "RELIANCE" } });
    fireEvent.change(inputs[0], { target: { value: "10" } });
    fireEvent.change(inputs[1], { target: { value: "2500" } });

    const finishButton = screen.getByText("Finish Setup");
    fireEvent.click(finishButton);

    await waitFor(() => {
      const holdingsCall = (apiClient.post as jest.Mock).mock.calls.find(
        (call) => call[0] === "/holdings/bulk"
      );
      expect(holdingsCall[1].holdings).toHaveLength(1);
    });
  });

  it("converts quantity and buyPrice to numbers on submission", async () => {
    render(<PortfolioSetupPage />);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/portfolios", expect.any(Object));
    });

    const symbolInputs = screen.getAllByPlaceholderText(
      "Search..."
    ) as HTMLInputElement[];
    const inputs = screen.getAllByPlaceholderText("0") as HTMLInputElement[];

    fireEvent.change(symbolInputs[0], { target: { value: "TCS" } });
    fireEvent.change(inputs[0], { target: { value: "5" } });
    fireEvent.change(inputs[1], { target: { value: "3500" } });

    const finishButton = screen.getByText("Finish Setup");
    fireEvent.click(finishButton);

    await waitFor(() => {
      const holdingsCall = (apiClient.post as jest.Mock).mock.calls.find(
        (call) => call[0] === "/holdings/bulk"
      );
      const holding = holdingsCall[1].holdings[0];
      expect(typeof holding.quantity).toBe("number");
      expect(typeof holding.buyPrice).toBe("number");
      expect(holding.quantity).toBe(5);
      expect(holding.buyPrice).toBe(3500);
    });
  });

  it("converts symbol to uppercase on submission", async () => {
    render(<PortfolioSetupPage />);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/portfolios", expect.any(Object));
    });

    const symbolInputs = screen.getAllByPlaceholderText(
      "Search..."
    ) as HTMLInputElement[];
    const inputs = screen.getAllByPlaceholderText("0") as HTMLInputElement[];

    fireEvent.change(symbolInputs[0], { target: { value: "reliance" } });
    fireEvent.change(inputs[0], { target: { value: "5" } });
    fireEvent.change(inputs[1], { target: { value: "3500" } });

    const finishButton = screen.getByText("Finish Setup");
    fireEvent.click(finishButton);

    await waitFor(() => {
      const holdingsCall = (apiClient.post as jest.Mock).mock.calls.find(
        (call) => call[0] === "/holdings/bulk"
      );
      expect(holdingsCall[1].holdings[0].symbol).toBe("RELIANCE");
    });
  });

  it("alerts on portfolio initialization failure", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation();
    (apiClient.post as jest.Mock).mockRejectedValueOnce(
      new Error("API Error")
    );

    render(<PortfolioSetupPage />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Failed to initialize portfolio. See console."
      );
    });

    alertSpy.mockRestore();
  });

  it("alerts on holdings submission failure", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation();

    (apiClient.post as jest.Mock).mockImplementation((endpoint) => {
      if (endpoint === "/portfolios") {
        return Promise.resolve({ data: { id: "portfolio-123" } });
      }
      return Promise.reject(new Error("Holdings save failed"));
    });

    render(<PortfolioSetupPage />);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/portfolios", expect.any(Object));
    });

    const symbolInputs = screen.getAllByPlaceholderText(
      "Search..."
    ) as HTMLInputElement[];
    const inputs = screen.getAllByPlaceholderText("0") as HTMLInputElement[];

    fireEvent.change(symbolInputs[0], { target: { value: "RELIANCE" } });
    fireEvent.change(inputs[0], { target: { value: "5" } });
    fireEvent.change(inputs[1], { target: { value: "3500" } });

    const finishButton = screen.getByText("Finish Setup");
    fireEvent.click(finishButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Failed to save holdings.");
    });

    alertSpy.mockRestore();
  });

  it("renders Add Another Holding button", () => {
    render(<PortfolioSetupPage />);

    expect(screen.getByText("Add Another Holding")).toBeInTheDocument();
  });

  it("renders Finish Setup button", () => {
    render(<PortfolioSetupPage />);

    expect(screen.getByText("Finish Setup")).toBeInTheDocument();
  });
});

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@guildr/lib/api";
import { Plus, Trash2, Save } from "lucide-react";

interface HoldingRow {
  assetType: "STOCK" | "MF" | "FD" | "CASH";
  symbol: string;
  quantity: string;
  buyPrice: string;
  assetClass: "EQUITY" | "DEBT" | "CASH";
}

export default function PortfolioSetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = searchParams.get("userId");
  const profile = searchParams.get("profile");

  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<HoldingRow[]>([
    {
      assetType: "STOCK",
      symbol: "",
      quantity: "",
      buyPrice: "",
      assetClass: "EQUITY",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const initPortfolio = async () => {
      try {
        const res = await apiClient.post("/portfolios", {
          userId,
          name: "My First Portfolio",
          currency: "INR",
        });
        setPortfolioId(res.data.id);
        console.log("Portfolio Initialized:", res.data.id);
      } catch (err) {
        console.error("Failed to create portfolio", err);
        alert("Failed to initialize portfolio. See console.");
      }
    };

    initPortfolio();
  }, [userId]);

  const addRow = () => {
    setHoldings([
      ...holdings,
      {
        assetType: "STOCK",
        symbol: "",
        quantity: "",
        buyPrice: "",
        assetClass: "EQUITY",
      },
    ]);
  };

  const MOCK_SYMBOLS = [
    "RELIANCE",
    "TCS",
    "HDFCBANK",
    "INFY",
    "ICICIBANK",
    "SBIN",
    "BHARTIARTL",
    "ITC",
    "KOTAKBANK",
    "LICI",
    "SBI_FD_1YR",
    "SBI_FD_5YR",
    "HDFC_FD_1YR",
  ];

  const removeRow = (index: number) => {
    const newHoldings = [...holdings];
    newHoldings.splice(index, 1);
    setHoldings(newHoldings);
  };

  const updateRow = (index: number, field: keyof HoldingRow, value: string) => {
    const newHoldings = [...holdings];
    newHoldings[index][field] = value as never;
    setHoldings(newHoldings);
  };

  const handleSubmit = async () => {
    if (!portfolioId) return alert("Portfolio not initialized yet.");
    setLoading(true);

    try {
      const formattedHoldings = holdings
        .map((h) => ({
          ...h,
          symbol: h.symbol.toUpperCase(),
          quantity: parseFloat(h.quantity),
          buyPrice: parseFloat(h.buyPrice),
        }))
        .filter((h) => h.symbol && h.quantity > 0);

      await apiClient.post("/holdings/bulk", {
        portfolioId,
        holdings: formattedHoldings,
      });

      router.push(`/dashboard/${portfolioId}`);
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save holdings.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2">Build Your Portfolio</h1>
        <p className="text-gray-500 mb-8">
          Based on your quiz, your target profile is{" "}
          <span className="font-bold text-blue-600">{profile}</span>. Let&apos;s
          add your current investments.
        </p>

        <div className="space-y-4 mb-8">
          {holdings.map((row, index) => (
            <div
              key={index}
              className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Type
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={row.assetType}
                  onChange={(e) => {
                    updateRow(index, "assetType", e.target.value);
                    if (e.target.value === "FD") {
                      updateRow(index, "assetClass", "DEBT");
                    }
                  }}
                >
                  <option value="STOCK">Stock</option>
                  <option value="MF">Mutual Fund</option>
                  <option value="FD">Fixed Deposit</option>
                </select>
              </div>

              <div className="flex-[2]">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Symbol / Name
                </label>
                <input
                  type="text"
                  list="ticker-suggestions"
                  className="w-full p-2 border rounded uppercase"
                  placeholder="Search..."
                  value={row.symbol}
                  onChange={(e) => updateRow(index, "symbol", e.target.value)}
                  required
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  placeholder="0"
                  value={row.quantity}
                  onChange={(e) => updateRow(index, "quantity", e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Buy Price (₹)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  placeholder="0"
                  value={row.buyPrice}
                  onChange={(e) => updateRow(index, "buyPrice", e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Class
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={row.assetClass}
                  onChange={(e) =>
                    updateRow(index, "assetClass", e.target.value)
                  }
                >
                  <option value="EQUITY">Equity</option>
                  <option value="DEBT">Debt</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <button
                onClick={() => removeRow(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={addRow}
            className="flex items-center gap-2 text-blue-600 font-medium px-4 py-2 hover:bg-blue-50 rounded"
          >
            <Plus size={20} /> Add Another Holding
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} /> {loading ? "Saving..." : "Finish Setup"}
          </button>
        </div>
      </div>
      <datalist id="ticker-suggestions">
        {MOCK_SYMBOLS.map((sym) => (
          <option key={sym} value={sym} />
        ))}
      </datalist>
    </div>
  );
}

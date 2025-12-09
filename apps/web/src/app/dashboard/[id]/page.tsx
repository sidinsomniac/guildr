import { apiClient } from "@guildr/lib/api";
import { AllocationChart } from "./allocation-chart";
import { ArrowUpRight, IndianRupee, PieChart } from "lucide-react";

export default async function DashboardPage({
  params,
}: {
  params: { id: string };
}) {
  let data = null;
  try {
    const { id } = await params;
    const res = await apiClient.get(`/dashboard/${id}`);
    data = res.data;
  } catch (error) {
    console.error("Dashboard Page Error:", error);
    return (
      <div className="p-10 text-red-500">
        Error loading dashboard. Is the Gateway running?
      </div>
    );
  }

  const { portfolio, market } = data;

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Portfolio</h1>
            <p className="text-sm text-gray-500">Last updated: Just now</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">
              NIFTY 50
            </span>
            <span className="font-bold text-gray-800">
              {formatMoney(market.indices?.NIFTY_50?.value || 0)}
            </span>
            <span className="text-xs text-green-600 bg-green-50 px-1 rounded">
              {market.indices?.NIFTY_50?.change}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <IndianRupee size={18} />{" "}
              <span className="text-sm font-medium">Total Net Worth</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatMoney(portfolio.totalValue)}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <ArrowUpRight size={18} />{" "}
              <span className="text-sm font-medium">Total Gain/Loss</span>
            </div>
            <div
              className={`text-3xl font-bold ${portfolio.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {portfolio.totalGainLoss >= 0 ? "+" : ""}
              {formatMoney(portfolio.totalGainLoss)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {portfolio.totalGainLossPct}% all time
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <PieChart size={18} />{" "}
              <span className="text-sm font-medium">Allocation Status</span>
            </div>
            <div className="text-xl font-bold text-gray-800">
              {Math.abs(
                portfolio.allocation.EQUITY - (portfolio.target?.EQUITY || 60)
              ) > 5
                ? "⚠️ Off Track"
                : "✅ On Track"}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Equity is {portfolio.allocation.EQUITY.toFixed(1)}% (Target:{" "}
              {portfolio.target?.EQUITY || 60}%)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Asset Allocation</h3>
            <div style={{ height: "400px", width: "100%" }}>
              <AllocationChart allocation={portfolio.allocation} />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-4">
              AI Copilot Insights
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100 text-sm text-gray-600">
                🤖 <strong>Analysis:</strong> Your portfolio is heavy on Equity
                ({portfolio.allocation.EQUITY.toFixed(0)}%). Consider shifting
                to Debt to lock in recent gains.
              </div>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                View 3 Rebalancing Strategies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

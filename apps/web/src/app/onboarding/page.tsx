"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@guildr/lib/api";
import { ArrowRight } from "lucide-react";

const QUESTIONS = [
  {
    id: 1,
    text: "What is your primary goal for this portfolio?",
    options: [
      { label: "Protect my capital (I hate losing money)", score: 1 },
      { label: "Beat FD returns with some safety", score: 2 },
      { label: "Maximize wealth (Aggressive Growth)", score: 3 },
    ],
  },
  {
    id: 2,
    text: "If the market crashes 20% tomorrow, what do you do?",
    options: [
      { label: "Panic and sell everything", score: 1 },
      { label: "Wait it out (Do nothing)", score: 2 },
      { label: "Buy more! (It's a sale)", score: 3 },
    ],
  },
  {
    id: 3,
    text: "How long do you plan to stay invested?",
    options: [
      { label: "Less than 3 years", score: 1 },
      { label: "3 to 7 years", score: 2 },
      { label: "More than 7 years", score: 3 },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateProfile = (totalScore: number) => {
    if (totalScore <= 4) return "CONSERVATIVE";
    if (totalScore <= 7) return "BALANCED";
    return "GROWTH";
  };

  const handleOptionSelect = async (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const totalScore = newScores.reduce((a, b) => a + b, 0);
      const profile = calculateProfile(totalScore);

      try {
        const userRes = await apiClient.post("/users", {
          email: `demo_${new Date().getTime()}@example.com`,
          name: "New Investor",
        });

        console.log(`User Profile Determined: ${profile}`);

        router.push(
          `/portfolio-setup?profile=${profile}&userId=${userRes.data.id}`
        );
      } catch (err) {
        console.error("Onboarding failed", err);
        alert("Sorry, something went wrong while setting up your profile. Please try again later.");
        setLoading(false);
      }
    }
  };

  const currentQuestion = QUESTIONS[step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {currentQuestion.text}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.label}
              disabled={loading}
              onClick={() => handleOptionSelect(option.score)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center group"
            >
              <div className="flex-1 font-medium text-gray-700 group-hover:text-blue-700">
                {option.label}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-center text-gray-500 mt-4 animate-pulse">
            Analyzing your profile...
          </p>
        )}
      </div>
    </div>
  );
}

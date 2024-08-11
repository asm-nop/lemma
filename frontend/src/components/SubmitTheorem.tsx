import React, { useState } from "react";
import { useTheorems } from "../providers/TheoremProvider";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert.tsx";

const SubmitTheorem = () => {
  const { createChallenge } = useTheorems();
  const [theoremCode, setTheoremCode] = useState("");
  const [bountyAmount, setBountyAmount] = useState("");
  const [theoremName, setTheoremName] = useState("");
  const [expirationDays, setExpirationDays] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      // Convert bounty amount to wei (1 ETH = 10^18 wei)
      const bountyWei = BigInt(Math.floor(parseFloat(bountyAmount) * 1e18));

      // Convert expiration days to a timestamp (in seconds)
      const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
      const expirationTimestamp =
        currentTimestamp + BigInt(parseInt(expirationDays) * 24 * 60 * 60);

      await createChallenge(theoremName, theoremCode, bountyWei, expirationTimestamp);
      setFeedback({
        type: "success",
        message: "Theorem submitted successfully!",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Error submitting theorem. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold mb-4">Submit Theorem Bounty</h1>

        {feedback.message && (
          <Alert
            className={`mb-4 ${
              feedback.type === "success" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <AlertTitle>
              {feedback.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields remain the same */}
          <div>
            <label
              htmlFor="theoremName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Theorem Name:
            </label>
            <input
              id="theoremName"
              type="text"
              value={theoremName}
              onChange={(e) => setTheoremName(e.target.value)}
              placeholder="Enter the name of the theorem"
              required
              className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            />
          </div>

          <div>
            <label
              htmlFor="theoremCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Madelaine (Proost) Theorem (incomplete):
            </label>
            <textarea
              id="theoremCode"
              value={theoremCode}
              onChange={(e) => setTheoremCode(e.target.value)}
              placeholder="Paste your incomplete Lean4 theorem here"
              required
              rows={5}
              className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            />
          </div>

          <div>
            <label
              htmlFor="bountyAmount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bounty Amount (ETH):
            </label>
            <input
              id="bountyAmount"
              type="number"
              step="0.000000000000000001" // Smallest unit of ETH
              min="0"
              value={bountyAmount}
              onChange={(e) => setBountyAmount(e.target.value)}
              placeholder="Enter bounty amount in ETH"
              required
              className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            />
          </div>

          <div>
            <label
              htmlFor="expirationDays"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Expiration Time (days):
            </label>
            <input
              id="expirationDays"
              type="number"
              step="1"
              min="1"
              value={expirationDays}
              onChange={(e) => setExpirationDays(e.target.value)}
              placeholder="Enter number of days until expiration"
              required
              className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:bg-orange-600 disabled:bg-orange-300 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Theorem Bounty"
            )}
          </button>
        </form>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t">
        <span className="mb-2">For more information checkout</span>{" "}
        <a
          href="https://github.com/proost-assistant/proost"
          className="font-semibold text-orange-500 hover:underline"
        >
          proost
        </a>
      </div>
    </div>
  );
};

export default SubmitTheorem;

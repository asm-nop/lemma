import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTheorems } from "../providers/TheoremProvider";
import { ethers } from "ethers";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert.tsx";

const TheoremDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [proofCode, setProofCode] = useState("");
  const [proofResult, setProofResult] = useState<{
    valid: boolean;
    proof?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!slug) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid theorem ID. Please check the URL and try again.
        </AlertDescription>
      </Alert>
    );
  }

  const theoremId = BigInt(slug);
  const { theorems } = useTheorems();
  const theorem = theorems.get(theoremId);

  if (theorem === undefined) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Theorem not found. Please check the theorem ID and try again.
        </AlertDescription>
      </Alert>
    );
  }

  const title = theorem.challengeName;
  let prompt = theorem.theorem;
  prompt = prompt.replace(/\\n/g, "\n");

  const bounty = ethers.formatEther(theorem.bounty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Send the proof to the remote prover
      const response = await fetch("https://api.example.com/prover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theorem: theorem.theorem, proof: proofCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify proof");
      }

      const result = await response.json();
      setProofResult(result);
    } catch (error) {
      console.error("Error verifying proof:", error);
      setProofResult({ valid: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>

        <div className="mb-6">
          <span className="text-lg">Bounty:</span>{" "}
          <span className="text-lg font-bold">{bounty} ETH</span>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Theorem:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <code className="text-sm">{prompt}</code>
          </pre>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <textarea
              id="proofCode"
              value={proofCode}
              onChange={(e) => setProofCode(e.target.value)}
              placeholder="Enter your proof code here"
              required
              className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
              rows={10}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:bg-orange-600 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Submit Proof"}
          </button>
        </form>

        {proofResult && (
          <div
            className={`p-4 mb-4 rounded-md ${
              proofResult.valid
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <p className="font-bold">
              {proofResult.valid ? "Proof Valid!" : "Proof Invalid"}
            </p>
            {proofResult.valid && proofResult.proof && (
              <div className="mt-2">
                <p className="font-semibold">ZK Proof:</p>
                <pre className="bg-white p-2 rounded-md mt-1 overflow-x-auto">
                  <code className="text-xs">{proofResult.proof}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t">
        <h4 className="font-semibold mb-2">How to submit a proof:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Write your proof in the code input above</li>
          <li>Click "Submit Proof" to send it to our remote prover</li>
          <li>If valid, you'll receive a ZK proof to submit on-chain</li>
        </ol>
        <p className="mt-2 text-sm text-gray-600">
          For more information, visit{" "}
          <a
            href="https://github.com/asm-nop/lemma"
            className="text-orange-500 hover:underline"
          >
            asm-nop/lemma
          </a>
        </p>
      </div>
    </div>
  );
};

export default TheoremDetail;

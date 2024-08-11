import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTheorems } from "../providers/TheoremProvider";
import { ethers } from "ethers";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert.tsx";
import { BonsaiProver } from "../bonsai.ts";
import { useSDK } from "@metamask/sdk-react";
import ProofProgress, { Step } from "./ProofProgress";

const TheoremDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [solution, setSolution] = useState("");
  const [proofResult, setProofResult] = useState<{
    valid: boolean;
    proof?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useSDK();
  const { theorems, submitSolution, claimBounty } = useTheorems();

  // State for progress tracking
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

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
  const prompt = theorem.theorem;
  const bounty = ethers.formatEther(theorem.bounty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowProgress(true);
    setCurrentStep(1);
    setIsComplete(false);
    setIsError(false);

    try {
      const bonsaiProver = new BonsaiProver("https://lemma-relay-vaqzy.ondigitalocean.app");

      if (!account) {
        throw new Error("Metamask SDK not found");
      }

      // Step 1: Send proof to prover
      setCurrentStep(1);
      let proof = await bonsaiProver.prove(account, theorem.theorem, solution);

      if (proof) {
        console.log(proof);

        setProofResult({ valid: true, proof: "Ok" });

        const groth16Selector = "310fe598";

        const sealHex =
          "0x" +
          groth16Selector +
          toHexString(proof.receipt.inner.Groth16.seal);
        const journalHex = "0x" + toHexString(proof.receipt.journal.bytes);

        console.log("Seal:", sealHex);
        console.log("Journal:", journalHex);

        const coder = new ethers.AbiCoder();
        let [sender, solutionHash] = coder.decode(
          ["address", "bytes32"],
          journalHex
        );

        if (sender !== account) {
          throw new Error("Invalid sender");
        }

        console.log(sender);
        console.log(solutionHash);

        // Step 3: Submit solution on-chain
        setCurrentStep(2);
        console.log("Submitting solution...");
        await submitSolution(theoremId, solutionHash, sealHex);

        // Step 4: Claim bounty
        setCurrentStep(3);
        console.log("Claiming bounty...");
        await claimBounty(theoremId, solution);

        setIsComplete(true);
      } else {
        throw new Error("Invalid proof");
      }
    } catch (error) {
      console.error("Error in proof submission process:", error);
      setProofResult({ valid: false });
      setIsError(true);
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
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
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
            {isLoading ? "Processing..." : "Submit Proof"}
          </button>
        </form>

        {showProgress && (
          <div className="flex justify-center mb-6">
            <ProofProgress
              currentStep={currentStep}
              isComplete={isComplete}
              isError={isError}
            />
          </div>
        )}

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
          <li>Click "Submit Proof" to start the process</li>
          <li>Monitor the progress in the card that appears</li>
          <li>If successful, your bounty will be automatically claimed</li>
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

function toHexString(arr: number[]) {
  return arr.map((num) => num.toString(16).padStart(2, "0")).join("");
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default TheoremDetail;

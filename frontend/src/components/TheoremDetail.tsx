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
      const bonsaiProver = new BonsaiProver("http://64.227.105.217:3000");

      if (!account) {
        throw new Error("Metamask SDK not found");
      }

      // Step 1: Send proof to prover
      setCurrentStep(1);
      await sleep(1000);
      let proof = await bonsaiProver.prove(account, theorem.theorem, solution);

      if (true) {
        console.log(proof);

        setProofResult({ valid: true, proof: "Ok" });

        const sealHex = toHexString(proof.receipt.inner.Groth16.seal);
        const journalHex = toHexString(proof.receipt.journal.bytes);

        // const sealHex = "0x0afd391f44e6fe0383217ab12924cc261052cb255f9bb3b236c74c451c9c01603036138762689d2f5f9d85d8d11d510514450521fa2543936bab8829a929f5b80eecb067eff4ba569267b0fd866a633f7e3e6a52e7bb61330029ba0b953f35900206b233bd165c52cd291b63ad2e9d88fd6f7f1afdc63be64e0d0a653682f97e29706443d909e6d84075fe3a9e832b0a9dd6ea5db715bd5de1341c4d6c3714ee1c2f594478e1d2c78ec4e8ea6708b19832aa4e21d13251a87f4858b49a3089332f36965941ef654544a6f216090bbaa87f279b8ca2993378fc1d30aaf34325bc1f56e51262b5363f3450593f9d14017a0739677ec35be4aa064be478961d9e88";
        // const journalHex = "0x0000000000000000000000005b5d0637fd86ecb92a41939c04c5eb27b72c61283f127c843850a26addf73cda9335446d59192297cce8f978b34e4b4d7f78c998";

        console.log("Seal:", sealHex);
        console.log("Journal:", journalHex);

        const coder = new ethers.AbiCoder();
        let [sender, solutionHash] = coder.decode(["address", "bytes32"], journalHex);
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
  return '0x' + arr.map(num => num.toString(16).padStart(2, '0')).join('');
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default TheoremDetail;
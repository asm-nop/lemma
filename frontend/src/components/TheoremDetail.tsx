import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTheorems } from "../providers/TheoremProvider";
import { ethers } from "ethers";
import { AlertCircle } from "lucide-react";

const TheoremDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [zkProof, setZkProof] = useState("");

  if (!slug) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
        role="alert"
      >
        <div className="flex">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-bold">Error</p>
            <p>Invalid theorem ID. Please check the URL and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const theoremId = BigInt(slug);
  const { theorems } = useTheorems();
  const theorem = theorems.get(theoremId);

  if (theorem === undefined) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
        role="alert"
      >
        <div className="flex">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-bold">Error</p>
            <p>Theorem not found. Please check the theorem ID and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const title = "Logical AND Commutativity";
  let prompt = theorem.theorem;
  prompt = prompt.replace(/\\n/g, "\n");

  const bounty = ethers.formatEther(theorem.bounty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the proof submission here
    console.log("Submitted ZK Proof:", zkProof);
    // Reset the form
    setZkProof("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 mb-4">Theorem #{slug}</p>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Prompt:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <code className="text-sm">{prompt}</code>
          </pre>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Bounty:</h3>
          <p className="text-xl font-bold">{bounty} ETH</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label
              htmlFor="zkProof"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ZK Proof:
            </label>
            <input
              id="zkProof"
              type="text"
              value={zkProof}
              onChange={(e) => setZkProof(e.target.value)}
              placeholder="Enter your ZK proof here"
              required
              className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:bg-orange-600"
          >
            Submit Proof
          </button>
        </form>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t">
        <h4 className="font-semibold mb-2">How to generate a ZK proof:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>TODO</li>
          <li>TODO</li>
          <li>TODO</li>
        </ol>
        <p className="mt-2 text-sm text-gray-600">
          Follow the instructions at{" "}
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

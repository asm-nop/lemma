import { useState } from "react";
import { useTheorems } from "../providers/TheoremProvider";

const SubmitTheorem = () => {
  const { submit } = useTheorems();
  const [theoremCode, setTheoremCode] = useState("");
  const [bountyAmount, setBountyAmount] = useState("");
  const [theoremName, setTheoremName] = useState("");
  const [expirationDays, setExpirationDays] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    // Convert expiration days to a timestamp
    const expirationTimestamp =
      Math.floor(Date.now() / 1000) + parseInt(expirationDays) * 24 * 60 * 60;

    // submit(theoremName, theoremCode, bountyAmount, expirationTimestamp);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold mb-4">Submit Theorem Bounty</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Lean4 Theorem (incomplete):
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
              step="0.01"
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
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:bg-orange-600"
          >
            Submit Theorem Bounty
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitTheorem;

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheorems } from "../providers/TheoremProvider";
import { ethers } from "ethers";
import { Clock, User, CreditCard, ArrowUpDown } from "lucide-react";

const TheoremList: React.FC = () => {
  const ctx = useTheorems();
  const [sortAscending, setSortAscending] = useState(true);

  const sortedTheorems = useMemo(() => {
    const theorems = Array.from(ctx.theorems.entries());
    return theorems.sort(([, a], [, b]) => {
      const timeA = Number(a.expirationTimestamp);
      const timeB = Number(b.expirationTimestamp);
      return sortAscending ? timeA - timeB : timeB - timeA;
    });
  }, [ctx.theorems, sortAscending]);

  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleSort}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort by Expiration: {sortAscending ? "Earliest First" : "Latest First"}
        </button>
      </div>
      {sortedTheorems.map(([challengeId, theorem]) => {
        const bounty = ethers.formatEther(theorem.bounty);
        const expirationDate = new Date(Number(theorem.expirationTimestamp) * 1000);

        return (
          <Link
            to={`/theorem/${theorem.challengeId}`}
            key={theorem.challengeId}
            className="block bg-white hover:bg-orange-200 p-6 rounded-lg shadow transition duration-300 ease-in-out"
          >
            <h2 className="text-2xl font-semibold mb-3">{theorem.challengeName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Creator: {theorem.creator.slice(0, 6)}...{theorem.creator.slice(-4)}</span>
              </div>
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Reward: {bounty} ETH</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Expires: {expirationDate.toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default TheoremList;
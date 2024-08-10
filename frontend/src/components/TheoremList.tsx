import React from "react";
import { Link } from "react-router-dom";
import { useTheorems } from "../providers/TheoremProvider";
import { ethers } from "ethers";

const TheoremList: React.FC = () => {
  const ctx = useTheorems();

  let theorems = Array.from(ctx.theorems.entries());

  return (
    <div className="space-y-4">
      {theorems.map(([challengeId, theorem]) => {
        let cid = challengeId.toString();

        let bounty = ethers.formatEther(theorem.bounty);

        return (
          <Link
            to={`/theorem/${theorem.challengeId}`}
            key={theorem.challengeId}
            className="block bg-white hover:bg-orange-300 p-4 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold">Theorem #{cid}</h2>
            <p className="text-gray-600">Reward: {bounty} ETH</p>
          </Link>
        );
      })}
    </div>
  );
};

export default TheoremList;

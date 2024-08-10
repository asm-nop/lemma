import React from "react";
import { Link } from "react-router-dom";

const TheoremList: React.FC = () => {
  const theorems = [
    { id: 1, title: "Pythagorean Theorem", reward: "0.1 ETH" },
    { id: 2, title: "Fermat's Last Theorem", reward: "1 ETH" },
    { id: 3, title: "Goldbach's Conjecture", reward: "0.5 ETH" },
  ];

  return (
    <div className="space-y-4">
      {theorems.map((theorem) => (
        <div key={theorem.id} className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">{theorem.title}</h2>
          <p className="text-gray-600">Reward: {theorem.reward}</p>
          <Link
            to={`/theorem/${theorem.id}`}
            className="inline-block p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Open
          </Link>
        </div>
      ))}
    </div>
  );
};

export default TheoremList;

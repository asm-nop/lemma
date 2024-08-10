import { useSDK } from "@metamask/sdk-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const [account, setAccount] = useState<string>();
  const { sdk } = useSDK();

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      setAccount(accounts?.[0]);
    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };

  const disconnect = async () => {
    try {
      await sdk?.disconnect();
      setAccount(undefined);
    } catch (err) {
      console.warn("failed to disconnect..", err);
    }
  };

  const connected = account !== undefined;

  return (
    <header className="bg-orange-300 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lemma</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:text-blue-200">
                Home
              </Link>
            </li>
            <li>
              <Link to="/theorems" className="hover:text-blue-200">
                Theorems
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-blue-200">
                Submit Proof
              </a>
            </li>

            {connected ? (
              <li>
                <a
                  href="#"
                  onClick={disconnect}
                  className="hover:text-blue-200"
                >
                  Connected as {account}
                </a>
              </li>
            ) : (
              <li>
                <a href="#" onClick={connect} className="hover:text-blue-200">
                  Connect Wallet
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

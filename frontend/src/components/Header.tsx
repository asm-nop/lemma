import { useSDK } from "@metamask/sdk-react";
import { ChevronLeft, ChevronRight, Dot, Power, PowerOff } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  // const [account, setAccount] = useState<string>();
  const { sdk, account } = useSDK();

  const connect = async () => {
    try {
      await sdk?.connect();
      // setAccount(accounts?.[0]);
    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };

  const disconnect = async () => {
    try {
      await sdk?.disconnect();
      // setAccount(undefined);
    } catch (err) {
      console.warn("failed to disconnect..", err);
    }
  };

  const connected = account !== undefined;

  return (
    <header className="bg-orange-400 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link className="hover:underline" to="/">
            <ChevronLeft className="inline" /> lemma <Dot className="inline" />{" "}
            market <ChevronRight className="inline" />
          </Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link className="font-semibold hover:underline" to="/submit">
                Submit Theorem
              </Link>
            </li>
            {connected ? (
              <li>
                <a href="#" onClick={disconnect} className="hover:text-orange-400">
                  <PowerOff className="inline" />
                </a>
              </li>
            ) : (
              <li>
                <a href="#" onClick={connect} className="hover:text-orange-400">
                  <Power className="inline" />
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

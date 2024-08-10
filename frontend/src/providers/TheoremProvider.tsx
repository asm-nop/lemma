import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useSDK } from "@metamask/sdk-react";

// Define the shape of a theorem
interface Theorem {
  challengeId: string;
  prompt: string;
  bounty: string;
}

// Define the shape of our context
interface TheoremContextType {
  theorems: Theorem[];
  fetchTheorem: (id: string) => Promise<Theorem | null>;
  account: string | null;
  connectWallet: () => Promise<void>;
}

// Create the context
const TheoremContext = createContext<TheoremContextType | undefined>(undefined);

// ABI of your smart contract (replace with your actual ABI)
const ABI: string[] = [
  // Add your contract ABI here
  "function challengeNonce() public view returns (uint256)",
  "function challenges(uint256 nonce) public view returns (address, uint256, string, uint256, uint256)",
];

// Address of your deployed contract
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with your contract address

export const TheoremProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theorems, setTheorems] = useState<Theorem[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const { sdk, connected } = useSDK();

  useEffect(() => {
    const checkConnection = async () => {
      if (!connected) {
        const accounts = await sdk?.connect();
        setAccount(accounts[0]);
      }
    };

    checkConnection();
  }, [sdk]);

  const connectWallet = async () => {
    try {
      const accounts = await sdk?.connect();
      if (accounts && accounts[0]) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const getContract = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    // TODO: Switch comments once using a real chain and not Anvil
    // const provider = new ethers.BrowserProvider(window.ethereum);
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");

    const signer = await provider.getSigner();

    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  };

  const fetchTheorem = async (id: string): Promise<Theorem | null> => {
    try {
      const contract = await getContract();
      return await contract.getChallenge(id);
    } catch (error) {
      console.error("Error fetching theorem:", error);
      return null;
    }
  };

  const updateTheorems = async () => {
    try {
      const contract = await getContract();
      const lastChallengeNonce = await contract.challengeNonce();
      if (lastChallengeNonce === 0) {
        console.warn("No theorems found");
        return;
      }

      let fetchedTheorems = [];
      for (let n = 0; n < lastChallengeNonce; n++) {
        const challenge = await contract.challenges(n);

        console.log(challenge);
        fetchedTheorems.push({
          challengeId: n.toString(),
          prompt: challenge[2],
          bounty: ethers.formatEther(challenge[3]),
        });
      }

      setTheorems(fetchedTheorems.filter((t): t is Theorem => t !== null));
    } catch (error) {
      console.error("Error fetching all theorems:", error);
    }
  };

  useEffect(() => {
    if (account) {
      updateTheorems();
    }
  }, [account]);

  const contextValue: TheoremContextType = {
    theorems,
    fetchTheorem,
    account,
    connectWallet,
  };

  return (
    <TheoremContext.Provider value={contextValue}>
      {children}
    </TheoremContext.Provider>
  );
};

export const useTheorems = () => {
  const context = useContext(TheoremContext);
  if (context === undefined) {
    throw new Error("useTheorem must be used within a TheoremProvider");
  }
  return context;
};

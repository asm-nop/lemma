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
  creator: string;
  challengeId: bigint;
  challengeName: string;
  theorem: string;
  bounty: bigint;
  expirationTimestamp: bigint;
}

// Define the shape of our context
interface TheoremContextType {
  theorems: Map<bigint, Theorem>;
  account: string | null;
  connectWallet: () => Promise<void>;
  createChallenge: (
    challengeName: string,
    theorem: string,
    bounty: bigint,
    expirationTimestamp: bigint
  ) => Promise<void>;

  submitSolution: (
    challengeId: bigint,
    solutionHash: string,
    seal: string
  ) => Promise<void>;

  claimBounty: (challengeId: bigint, solution: string) => Promise<void>;
}

// Create the context
const TheoremContext = createContext<TheoremContextType | undefined>(undefined);

// ABI of your smart contract (replace with your actual ABI)
const ABI: string[] = [
  // Add your contract ABI here
  "function challengeNonce() public view returns (uint256)",
  "function challenges(uint256 nonce) public view returns (address,uint256,string,string,uint256,uint256)",
  "function createChallenge(string,string,uint256) public payable returns (uint256)",
  "function submitSolution(uint256,bytes32,bytes) public",
  "function claimBounty(uint256,string) public",
];

// Address of your deployed contract
const CONTRACT_ADDRESS = "0xfC4e19a87C59Cf362cfE7225Dd985a367427BAC2"; // Replace with your contract address

export const TheoremProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theorems, setTheorems] = useState<Map<bigint, Theorem>>(new Map());
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
    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  };

  const updateTheorems = async () => {
    try {
      const contract = await getContract();

      const lastChallengeNonce = await contract.challengeNonce();
      if (lastChallengeNonce === BigInt(0)) {
        console.warn("No theorems found");
        return;
      }

      let fetchedTheorems = new Map<bigint, Theorem>();
      for (let n = BigInt(0); n < lastChallengeNonce; n++) {
        const challenge = await contract.challenges(n);

        console.log(challenge);

        fetchedTheorems.set(n, {
          creator: challenge[0],
          challengeId: challenge[1],
          theorem: challenge[2],
          challengeName: challenge[3],
          bounty: challenge[4],
          expirationTimestamp: challenge[5],
        });
      }

      setTheorems(fetchedTheorems);
    } catch (error) {
      console.error("Error fetching all theorems:", error);
    }
  };

  const createChallenge = async (
    challengeName: string,
    theorem: string,
    bounty: bigint,
    expirationTimestamp: bigint
  ) => {
    const contract = await getContract();

    await contract.createChallenge(
      challengeName,
      theorem,
      expirationTimestamp,
      {
        value: bounty,
      }
    );
  };

  const submitSolution = async (
    challengeId: bigint,
    solutionHash: string,
    seal: string
  ) => {
    const contract = await getContract();

    await contract.submitSolution(challengeId, solutionHash, seal);
  };

  const claimBounty = async (challengeId: bigint, solution: string) => {
    const contract = await getContract();

    await contract.claimBounty(challengeId, solution);
  };

  useEffect(() => {
    if (account) {
      updateTheorems();
    }
  }, [account]);

  const contextValue: TheoremContextType = {
    theorems,
    account,
    connectWallet,
    createChallenge,
    submitSolution,
    claimBounty,
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

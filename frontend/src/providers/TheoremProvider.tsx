import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useSDK } from '@metamask/sdk-react';

// Define the shape of a theorem
interface Theorem {
  id: string;
  content: string;
  reward: string;
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
];

// Address of your deployed contract
const CONTRACT_ADDRESS = '0x...'; // Replace with your contract address

export const TheoremProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
      console.error('Failed to connect wallet:', error);
    }
  };


  const getContract = async () => {
    if (!window.ethereum) throw new Error('No crypto wallet found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  };

  const fetchTheorem = async (id: string): Promise<Theorem | null> => {
    try {
      const contract = await getContract();
      const result = await contract.getTheorem(id);
      return {
        id,
        content: result.content,
        reward: ethers.formatEther(result.reward)
      };
    } catch (error) {
      console.error('Error fetching theorem:', error);
      return null;
    }
  };

  const fetchAllTheorems = async () => {
    try {
      const contract = await getContract();
      const ids = await contract.getAllTheoremIds();
      const fetchedTheorems = await Promise.all(ids.map(fetchTheorem));
      setTheorems(fetchedTheorems.filter((t): t is Theorem => t !== null));
    } catch (error) {
      console.error('Error fetching all theorems:', error);
    }
  };

  useEffect(() => {
    if (account) {
      fetchAllTheorems();
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

export const useTheorem = () => {
  const context = useContext(TheoremContext);
  if (context === undefined) {
    throw new Error('useTheorem must be used within a TheoremProvider');
  }
  return context;
};
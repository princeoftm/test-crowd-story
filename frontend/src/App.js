import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

// --- ABIs & ADDRESSES ---
const CAMPAIGN_FACTORY_ADDRESS = "0x152FC0Ce1C8314d1285201D549263B0c9283Aee6"; // <-- IMPORTANT: REPLACE THIS
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyMDAyZTUxYS0yMjdmLTRlOTctOTcxZC0xODg1ODc4MDM4NWYiLCJlbWFpbCI6InJhb2FuaXJ1ZGRoOTJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6Ijk4N2NmMGNmMTgwN2QyNzE3Y2QyIiwic2NvcGVkS2V5U2VjcmV0IjoiMzU1YmZhMDM2NTc4ZjNmNjQzNzQ4YjQ3NjE1N2M0ZmJiMDU5YTJmOTg5ZGYyZDNjYWYzNmE4ZDA2OGEzYmQ3MCIsImV4cCI6MTc4MTI2MzQxM30.WyarzkprhVPy2xVElpEWYk0un1HRDiqxtJlL8RGKb2Q"; // <-- IMPORTANT: REPLACE WITH YOUR PINATA API KEY (JWT)


// --- ABIs ---
const CAMPAIGN_FACTORY_ABI = [
  // --- PASTE THE UPDATED CAMPAIGN_FACTORY_ABI HERE ---
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "campaignAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "goal",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      }
    ],
    "name": "CampaignCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_goal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_metadataURI",
        "type": "string"
      }
    ],
    "name": "createCampaign",
    "outputs": [
      {
        "internalType": "address",
        "name": "campaignAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDeployedCampaigns",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
const CROWDFUND_ABI = [
  // --- PASTE THE UPDATED CROWDFUND_ABI HERE ---
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_goal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_metadataURI",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalContributions",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "succeeded",
        "type": "bool"
      }
    ],
    "name": "CampaignFinished",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "contributor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Contribution",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "campaignGoal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deadline",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "finishCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "metadataURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "state",
    "outputs": [
      {
        "internalType": "enum Crowdfund.CampaignState",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalContributions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// --- Contexts ---
const Web3Context = createContext();
const ThemeContext = createContext();

// --- Theme Provider ---
const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// --- Web3 Provider ---
const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [factoryContract, setFactoryContract] = useState(null);
    const [error, setError] = useState(null);

    const connectWallet = async () => {
        setError(null);
        if (typeof window.ethereum !== 'undefined') {
            try {
                const web3Provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await web3Provider.send("eth_requestAccounts", []);
                const web3Signer = await web3Provider.getSigner();
                
                setProvider(web3Provider);
                setSigner(web3Signer);
                setAccount(accounts[0]);

                const factory = new ethers.Contract(CAMPAIGN_FACTORY_ADDRESS, CAMPAIGN_FACTORY_ABI, web3Signer);
                setFactoryContract(factory);

            } catch (err) {
                console.error("Connection Error:", err);
                setError("Failed to connect wallet.");
            }
        } else {
            setError("MetaMask is not installed.");
        }
    };
    
    useEffect(() => {
        if(window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    connectWallet();
                } else {
                    setAccount(null);
                    setSigner(null);
                }
            });
        }
    }, []);

    const value = { account, provider, signer, factoryContract, connectWallet, error, axiosInstance: axios };

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// --- Custom Hooks ---
export const useWeb3 = () => useContext(Web3Context);
export const useTheme = () => useContext(ThemeContext);


// --- Helper Components ---
const Spinner = ({ text }) => (
    <div className="flex flex-col items-center justify-center space-x-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      {text && <span className="text-sm mt-2 text-slate-300 dark:text-gray-300">{text}</span>}
    </div>
);

const ProgressBar = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const isComplete = value >= max && max > 0;
    return (
        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-2.5 shadow-inner">
            <div
                className={`h-2.5 rounded-full transition-all duration-500 shadow-lg ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-sky-500 to-indigo-500'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
        </div>
    );
};

const Header = () => {
    const { account, connectWallet } = useWeb3();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700/50">
            <div className="container mx-auto flex justify-between items-center p-4">
                <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">StoryFund</h1>
                <div className="flex items-center space-x-4">
                    {account ? (
                        <div className="bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm rounded-full px-4 py-2 font-mono shadow-sm text-slate-700 dark:text-slate-300">
                            {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                        </div>
                    ) : (
                        <button
                            onClick={connectWallet}
                            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 active:scale-95"
                        >
                            Connect
                        </button>
                    )}
                    <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                        {theme === 'light' ? 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" /></svg>
                        }
                    </button>
                </div>
            </div>
        </header>
    );
};

const Message = ({ text, type = 'error' }) => {
    if (!text) return null;
    const baseClasses = 'p-4 rounded-xl text-center my-4 font-semibold backdrop-blur-sm border';
    const typeClasses = {
        error: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
        success: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
        info: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    };
    return <div className={`${baseClasses} ${typeClasses[type]}`}>{text}</div>;
};

// --- Skeleton Loading Component ---
const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-lg flex flex-col overflow-hidden">
        <div className="h-56 w-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
        <div className="p-6 flex flex-col flex-grow">
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mb-3"></div>
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6"></div>
            <div className="mt-auto h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        </div>
    </div>
);


// --- Core Components ---

const CreateCampaignForm = ({ onCampaignCreated }) => {
    const { factoryContract, axiosInstance } = useWeb3();
    const [title, setTitle] = useState('');
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const uploadToIPFS = async (file) => {
        if (!file) return null;
        if (!PINATA_JWT || PINATA_JWT.includes("YOUR_PINATA")) {
            throw new Error("Pinata API Key (JWT) is not configured.");
        }
        
        const formData = new FormData();
        formData.append('file', file);
        const metadata = JSON.stringify({ name: file.name });
        formData.append('pinataMetadata', metadata);
        const options = JSON.stringify({ cidVersion: 0 });
        formData.append('pinataOptions', options);

        try {
            const res = await axiosInstance.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                maxBodyLength: "Infinity",
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'Authorization': `Bearer ${PINATA_JWT}`
                }
            });
            return res.data.IpfsHash;
        } catch (error) {
            console.error("IPFS file upload error:", error);
            throw new Error("Failed to upload image to IPFS.");
        }
    };

    const uploadMetadataToIPFS = async (imageCID, title) => {
        if (!imageCID || !title) return null;

        const metadata = {
            name: title,
            description: "An NFT representing a successfully funded StoryFund campaign.",
            image: `ipfs://${imageCID}`
        };

        try {
            const res = await axiosInstance.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
                headers: { 'Authorization': `Bearer ${PINATA_JWT}` }
            });
            return res.data.IpfsHash;
        } catch (error) {
            console.error("IPFS metadata upload error:", error);
            throw new Error("Failed to upload metadata to IPFS.");
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!factoryContract) {
            setError("Wallet not connected or contract not loaded.");
            return;
        }
        if (!title || !goal || !duration || !imageFile) {
            setError("Please fill out all fields, including the image.");
            return;
        }

        setIsLoading(true);
        try {
            setLoadingMessage('Uploading image...');
            const imageCID = await uploadToIPFS(imageFile);

            setLoadingMessage('Uploading metadata...');
            const metadataCID = await uploadMetadataToIPFS(imageCID, title);
            const metadataURI = `ipfs://${metadataCID}`;
            
            setLoadingMessage('Confirm in wallet...');
            const goalInWei = ethers.parseEther(goal);
            const durationInSeconds = parseInt(duration) * 24 * 60 * 60;

            const tx = await factoryContract.createCampaign(goalInWei, durationInSeconds, metadataURI);
            setLoadingMessage('Waiting for confirmation...');
            await tx.wait();

            setSuccess("Campaign created successfully!");
            setTitle(''); setGoal(''); setDuration(''); setImageFile(null);
            if (document.getElementById('image-upload')) {
                document.getElementById('image-upload').value = null; 
            }
            if (onCampaignCreated) {
                onCampaignCreated();
            }
        } catch (err) {
            console.error("Creation Error:", err);
            setError(err.reason || err.message || "An error occurred.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-8 rounded-2xl shadow-2xl mb-12 backdrop-blur-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-sky-400 dark:to-indigo-400">Launch a New Campaign</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Campaign Title</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" placeholder="e.g., My Sci-Fi Novel"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="goal" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Funding Goal (ETH)</label>
                        <input id="goal" type="number" step="0.01" min="0" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" placeholder="e.g., 1.5"/>
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Duration (Days)</label>
                        <input id="duration" type="number" min="1" step="1" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" placeholder="e.g., 30"/>
                    </div>
                </div>
                 <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Campaign Image</label>
                    <input id="image-upload" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 cursor-pointer"/>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/50 min-h-[52px] active:scale-95"
                >
                    {isLoading ? <Spinner text={loadingMessage} /> : '🚀 Launch Campaign'}
                </button>
            </form>
            <Message text={error} type="error" />
            <Message text={success} type="success" />
        </div>
    );
};

const CampaignCard = ({ address, onSelectCampaign }) => {
    const { provider, axiosInstance } = useWeb3();
    const [campaignData, setCampaignData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const ipfsGateway = "https://gateway.pinata.cloud/ipfs/";

    useEffect(() => {
        const fetchCampaignData = async () => {
            if (!provider || !address || !axiosInstance) return;
            
            try {
                const contract = new ethers.Contract(address, CROWDFUND_ABI, provider);
                const metadataURI = await contract.metadataURI();
                const metadataResponse = await axiosInstance.get(metadataURI.replace("ipfs://", ipfsGateway));
                const metadata = metadataResponse.data;

                const [goal, totalContributions] = await Promise.all([
                    contract.campaignGoal(),
                    contract.totalContributions(),
                ]);

                setCampaignData({
                    title: metadata.name,
                    image: metadata.image.replace("ipfs://", ipfsGateway),
                    goal: ethers.formatEther(goal),
                    raised: ethers.formatEther(totalContributions),
                });
            } catch (err) {
                console.error(`Failed to fetch data for ${address}:`, err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaignData();
    }, [address, provider, axiosInstance]);

    if (isLoading) {
        return <SkeletonCard />;
    }

    if (!campaignData) return null;

    const isCompleted = campaignData && parseFloat(campaignData.raised) >= parseFloat(campaignData.goal);

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
             <div className="h-56 w-full overflow-hidden">
                <img src={campaignData.image} alt={campaignData.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
             </div>
             <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-4 truncate text-slate-800 dark:text-white">{campaignData.title}</h3>

                <ProgressBar value={parseFloat(campaignData.raised)} max={parseFloat(campaignData.goal)} />

                <div className="text-sm text-slate-500 dark:text-slate-300 mt-3">
                    <span className="font-bold text-sky-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-sky-400 dark:to-indigo-400">{parseFloat(campaignData.raised).toFixed(4)} ETH</span> raised of {campaignData.goal} ETH
                </div>
                
                {isCompleted && (
                    <div className="text-center mt-2 text-green-600 dark:text-green-400 font-bold">
                        🎉 Goal Reached!
                    </div>
                )}

                <div className="flex-grow"></div>

                <button
                    onClick={() => onSelectCampaign(address)}
                    className="mt-6 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-full w-full transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 active:scale-95"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

const CampaignList = ({ onSelectCampaign }) => {
    const { factoryContract } = useWeb3();
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCampaigns = async () => {
        if (!factoryContract) return;
        setIsLoading(true);
        try {
            const deployedCampaigns = await factoryContract.getDeployedCampaigns();
            setCampaigns([...deployedCampaigns].reverse());
        } catch (err) {
            console.error("Fetch Campaigns Error:", err);
        } finally {
            setTimeout(() => setIsLoading(false), 500); 
        }
    };

    useEffect(() => {
        if (factoryContract) {
            fetchCampaigns();
        } else {
            setTimeout(() => setIsLoading(false), 1500);
        }
    }, [factoryContract]);

    return (
        <div>
            <CreateCampaignForm onCampaignCreated={fetchCampaigns} />
            <div className="mt-12 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-lg">
                <h2 className="text-4xl font-bold mb-8 text-center text-slate-800 dark:text-white">
                    Explore Campaigns
                </h2>
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-500 dark:text-slate-400">No campaigns found. Be the first to create one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {campaigns.map(address => (
                            <CampaignCard 
                                key={address} 
                                address={address} 
                                onSelectCampaign={onSelectCampaign}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CampaignDetail = ({ address, onBack }) => {
    const { provider, signer, axiosInstance } = useWeb3();
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [contributionAmount, setContributionAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const campaignState = ["Funding", "Succeeded", "Failed"];
    const ipfsGateway = "https://gateway.pinata.cloud/ipfs/";

    const fetchDetails = async () => {
        if (!provider || !address || !axiosInstance) return;
        
        setIsLoading(true);
        setError('');
        try {
            const contract = new ethers.Contract(address, CROWDFUND_ABI, provider);

            const metadataURI = await contract.metadataURI();
            const metadataResponse = await axiosInstance.get(metadataURI.replace("ipfs://", ipfsGateway));
            const metadata = metadataResponse.data;

            const [owner, goal, deadline, totalContributions, state] = await Promise.all([
                contract.owner(),
                contract.campaignGoal(),
                contract.deadline(),
                contract.totalContributions(),
                contract.state()
            ]);
            
            const deadlineDate = new Date(Number(deadline) * 1000);
            const signerAddress = signer ? await signer.getAddress() : null;

            setDetails({
                title: metadata.name,
                image: metadata.image.replace("ipfs://", ipfsGateway),
                owner,
                goal: ethers.formatEther(goal),
                deadline: deadlineDate,
                isExpired: deadlineDate.getTime() < Date.now(),
                raised: ethers.formatEther(totalContributions),
                state: Number(state),
                isOwner: signerAddress && owner.toLowerCase() === signerAddress.toLowerCase()
            });
        } catch (err) {
            console.error("Detail Fetch Error:", err);
            setError("Failed to load campaign details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [address, provider, signer, axiosInstance]);

    const handleAction = async (actionFn, successMsg) => {
        setError('');
        setSuccess('');
        setIsProcessing(true);

        try {
            const contract = new ethers.Contract(address, CROWDFUND_ABI, signer);
            const tx = await actionFn(contract);
            setSuccess("Transaction sent! Waiting for confirmation...");
            await tx.wait();
            setSuccess(successMsg || "Action completed successfully!");
            fetchDetails();
        } catch (err) {
            console.error("Action Error:", err);
            const errorMessage = err.reason || err.data?.message || err.message || "An error occurred during the transaction.";
            setError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleContribute = () => handleAction(
        contract => contract.contribute({ value: ethers.parseEther(contributionAmount) }),
        "Contribution successful! Thank you for your support."
    );
    const handleFinish = () => handleAction(contract => contract.finishCampaign(), "Campaign finalized!");
    const handleRefund = () => handleAction(contract => contract.claimRefund(), "Refund claimed successfully.");


    if (isLoading) {
        return (
            <div className="text-center p-20">
                <Spinner text="Summoning campaign details..." />
            </div>
        );
    }
    
    if (!details) {
        return <Message text={error || "Could not load campaign."} />;
    }

    const renderActionPanel = () => {
        if (details.state === 0 && !details.isExpired) {
            return (
                <div className="bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold mb-4 text-center text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-sky-400 dark:to-indigo-400">Make a Contribution</h3>
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <input type="number" step="0.01" min="0" value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)} className="w-full flex-grow bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" placeholder="Amount in ETH"/>
                         <button onClick={handleContribute} disabled={isProcessing || !contributionAmount} className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/50 min-w-[150px] active:scale-95">
                            {isProcessing ? <Spinner /> : 'Contribute'}
                        </button>
                    </div>
                </div>
            );
        }
        if (details.state === 0 && details.isExpired) {
            return (
                <div className="bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Finalize Campaign</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">The funding deadline has passed. The campaign owner can now finalize it.</p>
                    {details.isOwner && (
                         <button onClick={handleFinish} disabled={isProcessing} className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/50 w-full max-w-xs mx-auto active:scale-95">
                            {isProcessing ? <Spinner /> : 'Finish Campaign'}
                        </button>
                    )}
                </div>
            );
        }
        if (details.state === 2) {
            return (
                 <div className="bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <h3 className="text-xl font-bold mb-4 text-red-700 dark:text-red-400">Campaign Failed</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">This campaign did not meet its goal. Contributors can now claim a refund.</p>
                     <button onClick={handleRefund} disabled={isProcessing} className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-rose-500/50 w-full max-w-xs mx-auto active:scale-95">
                        {isProcessing ? <Spinner /> : 'Claim Refund'}
                    </button>
                </div>
            );
        }
        if (details.state === 1) {
            return <Message text="🎉 This campaign was a success! Funds have been transferred to the owner." type="success" />;
        }
        return null;
    };


    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-5xl mx-auto backdrop-blur-lg">
            <button onClick={onBack} className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 mb-6 transition-colors">&larr; Back to all campaigns</button>
            <div className="md:grid md:grid-cols-2 md:gap-8">
                 <div className="mb-6 md:mb-0">
                    <img src={details.image} alt={details.title} className="w-full h-auto object-cover rounded-xl shadow-lg"/>
                 </div>
                 <div className="flex flex-col justify-center">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-3 break-words text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-sky-400 dark:to-indigo-400">{details.title}</h2>
                     <div className="flex items-center justify-between mb-6">
                        <span className="font-bold text-slate-500 dark:text-slate-400">Status:</span> 
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${details.state === 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : details.state === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                            {campaignState[details.state]}
                        </span>
                    </div>

                     <div className="space-y-4 text-sm mb-8">
                        <div className="bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg"><span className="font-bold text-slate-500 dark:text-slate-400 block">Owner Address</span> <span className="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{details.owner}</span></div>
                        <div className="bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg"><span className="font-bold text-slate-500 dark:text-slate-400 block">Funding Deadline</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{details.deadline.toLocaleString()}</span></div>
                    </div>

                     <div className="mb-4">
                        <div className="flex justify-between items-end mb-2 text-lg text-slate-800 dark:text-white">
                            <span><span className="font-bold text-sky-600 dark:text-sky-400">{parseFloat(details.raised).toFixed(4)} ETH</span> Raised</span>
                            <span><span className="font-bold">{details.goal} ETH</span> Goal</span>
                        </div>
                        <ProgressBar value={parseFloat(details.raised)} max={parseFloat(details.goal)} />
                    </div>
                </div>
            </div>

            <div className="mt-8 border-t-2 border-slate-200 dark:border-slate-700/50 pt-8">
                {renderActionPanel()}
                <Message text={error} type="error" />
                <Message text={success} type="success" />
            </div>
        </div>
    );
};


// --- App Main Component ---

export default function App() {
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    return (
        <ThemeProvider>
            <Web3Provider>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-sans transition-colors duration-300">
                    <Header />
                    <main className="container mx-auto p-4 md:p-8">
                         <MainContent
                            selectedCampaign={selectedCampaign}
                            setSelectedCampaign={setSelectedCampaign}
                         />
                    </main>
                    <footer className="text-center p-4 text-slate-500 dark:text-slate-500 text-sm">
                        Powered by Story Protocol & Ethereum
                    </footer>
                </div>
            </Web3Provider>
        </ThemeProvider>
    );
}

const MainContent = ({selectedCampaign, setSelectedCampaign}) => {
    const { account, error, connectWallet } = useWeb3();
    
    if (!account) {
        return (
            <div className="text-center mt-20 flex flex-col items-center">
                <h2 className="text-5xl font-bold mb-4 text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-sky-400 dark:to-indigo-400">Welcome to StoryFund</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-xl">A decentralized crowdfunding platform to bring your creative projects to life, secured on the blockchain.</p>
                <button
                    onClick={connectWallet}
                    className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 text-lg active:scale-95"
                >
                    Connect Wallet to Begin
                </button>
                <Message text={error} type="error" />
            </div>
        );
    }
    
    if (selectedCampaign) {
        return (
            <CampaignDetail
                address={selectedCampaign}
                onBack={() => setSelectedCampaign(null)}
            />
        );
    }
    
    return <CampaignList onSelectCampaign={setSelectedCampaign} />;
};
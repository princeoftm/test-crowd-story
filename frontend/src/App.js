import React, { useState, useEffect, createContext, useContext } from 'react';
// FIX: Changed the import to use a CDN-hosted ES module version of ethers.js 
// to resolve the dependency issue in the browser environment.
import axios from "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";


// --- ABIs & ADDRESSES (Replace with your actual deployed addresses) ---
// --- IMPORTANT: Update these with the ABIs from the NEWLY compiled contracts ---

const CAMPAIGN_FACTORY_ADDRESS = "0x152FC0Ce1C8314d1285201D549263B0c9283Aee6"; // <-- IMPORTANT: REPLACE THIS
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyMDAyZTUxYS0yMjdmLTRlOTctOTcxZC0xODg1ODc4MDM4NWYiLCJlbWFpbCI6InJhb2FuaXJ1ZGRoOTJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6Ijk4N2NmMGNmMTgwN2QyNzE3Y2QyIiwic2NvcGVkS2V5U2VjcmV0IjoiMzU1YmZhMDM2NTc4ZjNmNjQzNzQ4YjQ3NjE1N2M0ZmJiMDU5YTJmOTg5ZGYyZDNjYWYzNmE4ZDA2OGEzYmQ3MCIsImV4cCI6MTc4MTI2MzQxM30.WyarzkprhVPy2xVElpEWYk0un1HRDiqxtJlL8RGKb2Q"; // <-- IMPORTANT: REPLACE WITH YOUR PINATA API KEY (JWT)
const { ethers } = require("ethers");

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

// --- Context for Web3 ---
const Web3Context = createContext();

const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [factoryContract, setFactoryContract] = useState(null);
    const [error, setError] = useState(null);
    // NEW: State to hold the axios instance once it's loaded
    const [axiosInstance, setAxiosInstance] = useState(null);

    // NEW: useEffect to wait for the axios CDN script to load
    useEffect(() => {
        // Check if axios is already there
        if (window.axios) {
            setAxiosInstance(() => window.axios);
        } else {
            // If not, wait for it
            const interval = setInterval(() => {
                if (window.axios) {
                    setAxiosInstance(() => window.axios);
                    clearInterval(interval);
                }
            }, 100); // Check every 100ms
            
            // Cleanup on component unmount
            return () => clearInterval(interval);
        }
    }, []);

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
                setError("Failed to connect wallet. Please make sure MetaMask is installed and unlocked.");
            }
        } else {
            setError("MetaMask is not installed. Please install it to use this dApp.");
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

    // MODIFIED: Add axiosInstance to the context value
    const value = { account, provider, signer, factoryContract, connectWallet, error, axiosInstance };

    // We only render the children once axios is ready to prevent errors
    return <Web3Context.Provider value={value}>{axiosInstance && children}</Web3Context.Provider>;
};

export const useWeb3 = () => useContext(Web3Context);


// --- Helper Components ---

const Spinner = ({ text }) => (
    <div className="flex flex-col items-center justify-center space-x-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      {text && <span className="text-sm mt-2 text-gray-300">{text}</span>}
    </div>
);

const ProgressBar = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const isComplete = value >= max && max > 0;
    return (
        <div className="w-full bg-slate-700/50 rounded-full h-2.5 shadow-inner">
            <div
                className={`h-2.5 rounded-full transition-all duration-500 shadow-lg ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-sky-500 to-indigo-500'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
        </div>
    );
};

const Header = () => {
    const { account, connectWallet } = useWeb3();

    return (
        <header className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-lg border-b border-slate-700/50">
            <div className="container mx-auto flex justify-between items-center p-4">
                <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">StoryFund</h1>
                {account ? (
                    <div className="bg-slate-800/70 border border-slate-700 text-sm rounded-full px-4 py-2 font-mono shadow-md">
                        {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                    </div>
                ) : (
                    <button
                        onClick={connectWallet}
                        className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
                    >
                        Connect
                    </button>
                )}
            </div>
        </header>
    );
};

const Message = ({ text, type = 'error' }) => {
    if (!text) return null;
    const baseClasses = 'p-4 rounded-xl text-center my-4 font-semibold backdrop-blur-sm border';
    const typeClasses = {
        error: 'bg-red-900/30 text-red-300 border-red-700/50',
        success: 'bg-green-900/30 text-green-300 border-green-700/50',
        info: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
    };
    return <div className={`${baseClasses} ${typeClasses[type]}`}>{text}</div>;
};


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
        if (!PINATA_JWT || PINATA_JWT === "YOUR_PINATA_JWT") {
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
                headers: {
                    'Authorization': `Bearer ${PINATA_JWT}`
                }
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
            setTitle('');
            setGoal('');
            setDuration('');
            setImageFile(null);
            document.getElementById('image-upload').value = null; 
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
        <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-2xl shadow-2xl mb-12 backdrop-blur-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Launch a New Campaign</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Campaign Title</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-700/50 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="e.g., My Sci-Fi Novel"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="goal" className="block text-sm font-medium text-slate-300 mb-2">Funding Goal (ETH)</label>
                        <input id="goal" type="number" step="0.01" min="0" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-slate-700/50 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="e.g., 1.5"/>
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-slate-300 mb-2">Duration (Days)</label>
                        <input id="duration" type="number" min="1" step="1" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-700/50 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="e.g., 30"/>
                    </div>
                </div>
                 <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-slate-300 mb-2">Campaign Image</label>
                    <input id="image-upload" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"/>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-teal-500/50 min-h-[52px]"
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
            
            setIsLoading(true);
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

    const isCompleted = campaignData && parseFloat(campaignData.raised) >= parseFloat(campaignData.goal);

    if (isLoading) {
        return <div className="bg-slate-800/50 p-4 rounded-xl shadow-lg animate-pulse h-96"></div>;
    }

    if (!campaignData) return null;

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-2 transition-all duration-300 flex flex-col group overflow-hidden">
             <div className="h-56 w-full overflow-hidden">
                <img src={campaignData.image} alt={campaignData.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
             </div>
             <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-4 truncate">{campaignData.title}</h3>
                
                <ProgressBar value={parseFloat(campaignData.raised)} max={parseFloat(campaignData.goal)} />
                
                {isCompleted ? (
                    <div className="text-center mt-3 text-green-400 font-bold">
                        🎉 Goal Reached!
                    </div>
                ) : (
                    <div className="text-sm text-slate-300 mt-3">
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">{parseFloat(campaignData.raised).toFixed(4)} ETH</span> raised of {campaignData.goal} ETH
                    </div>
                )}

                <div className="flex-grow"></div> 
                
                <button 
                    onClick={() => onSelectCampaign(address)}
                    className="mt-6 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-full w-full transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
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
    const [isLoading, setIsLoading] = useState(false);

    const fetchCampaigns = async () => {
        if (!factoryContract) return;
        setIsLoading(true);
        try {
            const deployedCampaigns = await factoryContract.getDeployedCampaigns();
            setCampaigns([...deployedCampaigns].reverse());
        } catch (err) {
            console.error("Fetch Campaigns Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (factoryContract) fetchCampaigns();
    }, [factoryContract]);

    return (
        <div>
            <CreateCampaignForm onCampaignCreated={fetchCampaigns} />
            <div className="mt-12 bg-slate-800/50 border border-slate-700/50 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-lg">
                <h2 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
                    Explore Campaigns
                </h2>
                {isLoading ? (
                    <div className="text-center py-10"><Spinner text="Loading campaigns..."/></div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-400">No campaigns found. Be the first to create one!</p>
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
    const { provider, signer, account, axiosInstance } = useWeb3();
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [contributionAmount, setContributionAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const campaignState = ["Funding", "Succeeded", "Failed"];
    const ipfsGateway = "https://gateway.pinata.cloud/ipfs/";

    const fetchDetails = async () => {
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
            
            setDetails({
                title: metadata.name,
                image: metadata.image.replace("ipfs://", ipfsGateway),
                owner,
                goal: ethers.formatEther(goal),
                deadline: deadlineDate,
                isExpired: deadlineDate.getTime() < Date.now(),
                raised: ethers.formatEther(totalContributions),
                state: Number(state),
                isOwner: signer && owner.toLowerCase() === (await signer.getAddress()).toLowerCase()
            });
        } catch (err) {
            console.error("Detail Fetch Error:", err);
            setError("Failed to load campaign details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (address && provider && axiosInstance) {
            fetchDetails();
        }
    }, [address, provider, account, axiosInstance]);

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
        return <div className="text-center p-20"><Spinner text="Summoning campaign details..." /></div>;
    }
    if (error && !details) {
        return <Message text={error} />;
    }
    if (!details) return null;


    const renderActionPanel = () => {
        if (details.state === 0 && !details.isExpired) {
            return (
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Make a Contribution</h3>
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <input type="number" step="0.01" min="0" value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)} className="w-full flex-grow bg-slate-700/50 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Amount in ETH"/>
                         <button onClick={handleContribute} disabled={isProcessing || !contributionAmount} className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/50 min-w-[150px]">
                            {isProcessing ? <Spinner /> : 'Contribute'}
                        </button>
                    </div>
                </div>
            );
        }
        if (details.state === 0 && details.isExpired) {
            return (
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 text-center">
                    <h3 className="text-xl font-bold mb-4">Finalize Campaign</h3>
                    <p className="text-slate-400 mb-4">The funding deadline has passed. The campaign owner can now finalize it.</p>
                    {details.isOwner && (
                         <button onClick={handleFinish} disabled={isProcessing} className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/50 w-full max-w-xs mx-auto">
                            {isProcessing ? <Spinner /> : 'Finish Campaign'}
                        </button>
                    )}
                </div>
            );
        }
        if (details.state === 2) {
            return (
                 <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 text-center">
                    <h3 className="text-xl font-bold mb-4 text-red-400">Campaign Failed</h3>
                    <p className="text-slate-400 mb-4">This campaign did not meet its goal. Contributors can now claim a refund.</p>
                     <button onClick={handleRefund} disabled={isProcessing} className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-rose-500/50 w-full max-w-xs mx-auto">
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
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-5xl mx-auto backdrop-blur-lg">
            <button onClick={onBack} className="text-sky-400 hover:text-sky-300 mb-6 transition-colors">&larr; Back to all campaigns</button>
            <div className="md:grid md:grid-cols-2 md:gap-8">
                 <div className="mb-6 md:mb-0">
                    <img src={details.image} alt={details.title} className="w-full h-auto object-cover rounded-xl shadow-2xl"/>
                 </div>
                 <div className="flex flex-col justify-center">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-3 break-words text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">{details.title}</h2>
                     <div className="flex items-center justify-between mb-6">
                        <span className="font-bold text-slate-400">Status:</span> 
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${details.state === 0 ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : details.state === 1 ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}>
                            {campaignState[details.state]}
                        </span>
                    </div>

                     <div className="space-y-4 text-sm mb-8">
                        <div className="bg-slate-900/30 p-3 rounded-lg"><span className="font-bold text-slate-400 block">Owner Address</span> <span className="break-all font-mono text-xs">{details.owner}</span></div>
                        <div className="bg-slate-900/30 p-3 rounded-lg"><span className="font-bold text-slate-400 block">Funding Deadline</span> <span className="font-semibold">{details.deadline.toLocaleString()}</span></div>
                    </div>

                     <div className="mb-4">
                        <div className="flex justify-between items-end mb-2 text-lg">
                            <span><span className="font-bold text-sky-400">{parseFloat(details.raised).toFixed(4)} ETH</span> Raised</span>
                            <span><span className="font-bold">{details.goal} ETH</span> Goal</span>
                        </div>
                        <ProgressBar value={parseFloat(details.raised)} max={parseFloat(details.goal)} />
                    </div>
                </div>
            </div>

            <div className="mt-8 border-t-2 border-slate-700/50 pt-8">
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
        <Web3Provider>
            <div className="min-h-screen bg-slate-900 text-white font-sans bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/50">
                <Header />
                <main className="container mx-auto p-4 md:p-8">
                     <MainContent
                        selectedCampaign={selectedCampaign}
                        setSelectedCampaign={setSelectedCampaign}
                     />
                </main>
                <footer className="text-center p-4 text-slate-500 text-sm">
                    Powered by Story Protocol & Ethereum
                </footer>
            </div>
        </Web3Provider>
    );
}

const MainContent = ({selectedCampaign, setSelectedCampaign}) => {
    const { account, error, connectWallet } = useWeb3();
    
    if (!account) {
        return (
            <div className="text-center mt-20 flex flex-col items-center">
                <h2 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Welcome to StoryFund</h2>
                <p className="text-slate-300 mb-8 max-w-xl">A decentralized crowdfunding platform to bring your creative projects to life, secured on the blockchain.</p>
                <button
                    onClick={connectWallet}
                    className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 text-lg"
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
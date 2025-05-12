import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface WalletManagerProps {
  isConnected: boolean;
  isNodeRunning: boolean;
  nodePassword: string;
}

// Note: These are imported from wailsjs/go/main/App in the parent component
interface WalletFunctions {
  fetchWalletInfo: () => Promise<string>;
  generateWalletKey: () => Promise<string>;
  importWalletKey: (secretKey: string) => Promise<string>;
  buyRolls: (
    address: string,
    rollCount: number,
    fee: number
  ) => Promise<string>;
  sellRolls: (
    address: string,
    rollCount: number,
    fee: number
  ) => Promise<string>;
  startStaking: (address: string) => Promise<string>;
}

type Props = WalletManagerProps & WalletFunctions;

interface WalletInfo {
  address: string;
  balance: string;
  candidateRolls: string;
  finalRolls: string;
}

const WalletManager: React.FC<Props> = ({
  isConnected,
  isNodeRunning,
  nodePassword,
  fetchWalletInfo,
  generateWalletKey,
  importWalletKey,
  buyRolls,
  sellRolls,
  startStaking,
}) => {
  const [walletInfo, setWalletInfo] = useState<string>("");
  const [parsedWallets, setParsedWallets] = useState<WalletInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [secretKey, setSecretKey] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [rollCount, setRollCount] = useState<number>(1);
  const [fee, setFee] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("info"); // 'info', 'buy', 'sell', 'stake'

  const handleFetchWalletInfo = async () => {
    if (!isConnected || !isNodeRunning) {
      toast.error("Cannot fetch wallet info: Node not running");
      return;
    }

    setIsLoading(true);
    try {
      const info = await fetchWalletInfo();
      setWalletInfo(info);

      // Parse wallet information
      const wallets: WalletInfo[] = [];
      const lines = info.split("\n");
      let currentWallet: Partial<WalletInfo> = {};

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("Address:")) {
          // If we already have a partial wallet being built, add it to the list
          if (currentWallet.address) {
            wallets.push(currentWallet as WalletInfo);
          }
          // Start a new wallet
          currentWallet = {
            address: trimmedLine.replace("Address:", "").trim(),
          };
        } else if (
          trimmedLine.startsWith("Balance: ") &&
          currentWallet.address
        ) {
          currentWallet.balance = trimmedLine.replace("Balance:", "").trim();
        } else if (
          trimmedLine.startsWith("Candidate rolls: ") &&
          currentWallet.address
        ) {
          currentWallet.candidateRolls = trimmedLine
            .replace("Candidate rolls:", "")
            .trim();
        } else if (
          trimmedLine.startsWith("Final rolls: ") &&
          currentWallet.address
        ) {
          currentWallet.finalRolls = trimmedLine
            .replace("Final rolls:", "")
            .trim();
        }
      }

      // Add the last wallet if it exists
      if (currentWallet.address) {
        wallets.push(currentWallet as WalletInfo);
      }

      setParsedWallets(wallets);

      // Set a default selected address if we have wallets and none is selected
      if (wallets.length > 0 && !selectedAddress) {
        setSelectedAddress(wallets[0].address);
      }

      toast.success("Wallet information refreshed");
    } catch (error: any) {
      console.error("Error fetching wallet info:", error);
      toast.error(
        `Error fetching wallet info: ${
          error?.message || error || "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!isConnected || !isNodeRunning) {
      toast.error("Cannot generate key: Node not running");
      return;
    }

    setIsLoading(true);
    const genToastId = toast.loading("Generating new wallet key...");

    try {
      const result = await generateWalletKey();
      toast.success("New wallet key generated successfully", {
        id: genToastId,
      });

      // Refresh wallet info to show the new key
      await handleFetchWalletInfo();
    } catch (error: any) {
      console.error("Error generating wallet key:", error);
      toast.error(
        `Error generating wallet key: ${
          error?.message || error || "Unknown error"
        }`,
        { id: genToastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportKey = async () => {
    if (!isConnected || !isNodeRunning) {
      toast.error("Cannot import key: Node not running");
      return;
    }

    if (!secretKey.trim()) {
      toast.error("Please enter a secret key to import");
      return;
    }

    setIsLoading(true);
    const importToastId = toast.loading("Importing wallet key...");

    try {
      const result = await importWalletKey(secretKey.trim());
      toast.success("Wallet key imported successfully", { id: importToastId });
      setSecretKey(""); // Clear the input field

      // Refresh wallet info to show the imported key
      await handleFetchWalletInfo();
    } catch (error: any) {
      console.error("Error importing wallet key:", error);
      toast.error(
        `Error importing wallet key: ${
          error?.message || error || "Unknown error"
        }`,
        { id: importToastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyRolls = async () => {
    if (!isConnected || !isNodeRunning) {
      toast.error("Cannot buy rolls: Node not running");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    if (rollCount < 1) {
      toast.error("Roll count must be at least 1");
      return;
    }

    setIsLoading(true);
    const buyToastId = toast.loading(`Buying ${rollCount} rolls...`);

    try {
      const result = await buyRolls(selectedAddress, rollCount, fee);
      toast.success(`Successfully bought ${rollCount} rolls`, {
        id: buyToastId,
      });

      // Refresh wallet info to show updated roll count
      await handleFetchWalletInfo();
    } catch (error: any) {
      console.error("Error buying rolls:", error);
      toast.error(
        `Error buying rolls: ${error?.message || error || "Unknown error"}`,
        { id: buyToastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellRolls = async () => {
    if (!isConnected || !isNodeRunning) {
      toast.error("Cannot sell rolls: Node not running");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    if (rollCount < 1) {
      toast.error("Roll count must be at least 1");
      return;
    }

    setIsLoading(true);
    const sellToastId = toast.loading(`Selling ${rollCount} rolls...`);

    try {
      const result = await sellRolls(selectedAddress, rollCount, fee);
      toast.success(`Successfully sold ${rollCount} rolls`, {
        id: sellToastId,
      });

      // Refresh wallet info to show updated roll count
      await handleFetchWalletInfo();
    } catch (error: any) {
      console.error("Error selling rolls:", error);
      toast.error(
        `Error selling rolls: ${error?.message || error || "Unknown error"}`,
        { id: sellToastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStaking = async () => {
    if (!isConnected || !isNodeRunning) {
      toast.error("Cannot start staking: Node not running");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    setIsLoading(true);
    const stakeToastId = toast.loading(
      `Starting staking with address: ${selectedAddress}`
    );

    try {
      const result = await startStaking(selectedAddress);
      toast.success(`Started staking with address: ${selectedAddress}`, {
        id: stakeToastId,
      });
    } catch (error: any) {
      console.error("Error starting staking:", error);
      toast.error(
        `Error starting staking: ${error?.message || error || "Unknown error"}`,
        { id: stakeToastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch wallet info when component mounts or when node status changes
  useEffect(() => {
    if (isConnected && isNodeRunning) {
      handleFetchWalletInfo();
    }
  }, [isConnected, isNodeRunning]);

  // Add better error handling for empty wallet info
  const handleEmptyWalletInfo = () => {
    // Check if the wallet might be new/empty
    if (
      walletInfo.toLowerCase().includes("no addresses") ||
      walletInfo.trim() === ""
    ) {
      return (
        <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-700">
          <h4 className="font-semibold text-yellow-300 mb-2">
            No Wallet Addresses Found
          </h4>
          <p className="text-sm text-yellow-200">
            Your wallet appears to be empty. Try generating a new wallet key
            using the "Generate New Key" button above.
          </p>
        </div>
      );
    }

    return (
      <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-64 text-sm text-gray-300 border border-gray-700">
        {walletInfo ||
          "No wallet information available. Click 'Refresh Wallet Info' to view your wallets."}
      </pre>
    );
  };

  // Determine if actions should be disabled
  const isDisabled = !isConnected || !isNodeRunning || isLoading;

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-blue-400 mb-4">
        Wallet & Staking Manager
      </h2>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/70 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-blue-400 mx-auto mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-blue-300 font-medium">
              Processing wallet operation...
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-700">
        <button
          className={`px-4 py-2 ${
            activeTab === "info"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("info")}
        >
          Wallet Info
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "buy"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("buy")}
        >
          Buy Rolls
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "sell"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("sell")}
        >
          Sell Rolls
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "stake"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("stake")}
        >
          Start Staking
        </button>
      </div>

      {/* Refresh and Generate Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:bg-gray-600 flex items-center"
          onClick={handleFetchWalletInfo}
          disabled={isDisabled}
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isLoading ? "Loading..." : "Refresh Wallet Info"}
        </button>
        <button
          className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white disabled:bg-gray-600 flex items-center"
          onClick={handleGenerateKey}
          disabled={isDisabled}
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Generate New Key
        </button>
      </div>

      {/* Wallet Actions - conditionally displayed based on active tab */}
      {activeTab === "info" && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            Import Secret Key
          </h3>
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Enter secret key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              disabled={isDisabled}
            />
            <button
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white disabled:bg-gray-600"
              onClick={handleImportKey}
              disabled={isDisabled || !secretKey.trim()}
            >
              Import Key
            </button>
          </div>
        </div>
      )}

      {/* Buy Rolls Form */}
      {activeTab === "buy" && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            Buy Rolls (Stake)
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-gray-300 mb-2">
                Select Address:
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                disabled={isDisabled || parsedWallets.length === 0}
              >
                {parsedWallets.length === 0 ? (
                  <option value="">No addresses available</option>
                ) : (
                  parsedWallets.map((wallet) => (
                    <option key={wallet.address} value={wallet.address}>
                      {wallet.address}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Balance:</label>
              <div className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700">
                {selectedAddress
                  ? parsedWallets.find((w) => w.address === selectedAddress)
                      ?.balance || "N/A"
                  : "No address selected"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-gray-300 mb-2">Roll Count:</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Number of rolls to buy"
                value={rollCount}
                onChange={(e) => setRollCount(parseInt(e.target.value) || 1)}
                min="1"
                disabled={isDisabled}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Fee (optional):
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Fee amount (can be 0)"
                value={fee}
                onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                disabled={isDisabled}
              />
            </div>
          </div>

          <button
            className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white font-medium disabled:bg-gray-600"
            onClick={handleBuyRolls}
            disabled={isDisabled || !selectedAddress || rollCount < 1}
          >
            Buy Rolls
          </button>

          <div className="mt-2 text-yellow-400 text-sm">
            <p>Note: You need at least 100 MAS coins per roll.</p>
          </div>
        </div>
      )}

      {/* Sell Rolls Form */}
      {activeTab === "sell" && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            Sell Rolls (Unstake)
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-gray-300 mb-2">
                Select Address:
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                disabled={isDisabled || parsedWallets.length === 0}
              >
                {parsedWallets.length === 0 ? (
                  <option value="">No addresses available</option>
                ) : (
                  parsedWallets.map((wallet) => (
                    <option key={wallet.address} value={wallet.address}>
                      {wallet.address}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Current Rolls:</label>
              <div className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700">
                {selectedAddress
                  ? `Final: ${
                      parsedWallets.find((w) => w.address === selectedAddress)
                        ?.finalRolls || "0"
                    }, Candidate: ${
                      parsedWallets.find((w) => w.address === selectedAddress)
                        ?.candidateRolls || "0"
                    }`
                  : "No address selected"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-gray-300 mb-2">Roll Count:</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Number of rolls to sell"
                value={rollCount}
                onChange={(e) => setRollCount(parseInt(e.target.value) || 1)}
                min="1"
                disabled={isDisabled}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Fee (optional):
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Fee amount (can be 0)"
                value={fee}
                onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                disabled={isDisabled}
              />
            </div>
          </div>

          <button
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium disabled:bg-gray-600"
            onClick={handleSellRolls}
            disabled={isDisabled || !selectedAddress || rollCount < 1}
          >
            Sell Rolls
          </button>

          <div className="mt-2 text-yellow-400 text-sm">
            <p>
              Note: It will take some time for your coins to be credited, and
              they will be frozen for 1 cycle before you can spend them.
            </p>
          </div>
        </div>
      )}

      {/* Start Staking Form */}
      {activeTab === "stake" && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            Start Staking
          </h3>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Select Address:</label>
            <select
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              disabled={isDisabled || parsedWallets.length === 0}
            >
              {parsedWallets.length === 0 ? (
                <option value="">No addresses available</option>
              ) : (
                parsedWallets.map((wallet) => (
                  <option key={wallet.address} value={wallet.address}>
                    {wallet.address}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white font-medium disabled:bg-gray-600"
            onClick={handleStartStaking}
            disabled={isDisabled || !selectedAddress}
          >
            Start Staking with Selected Address
          </button>

          <div className="mt-2 text-yellow-400 text-sm">
            <p>
              Note: You should wait some time for your rolls to become active: 3
              cycles of 128 periods (about 1 hour and 40 minutes).
            </p>
          </div>
        </div>
      )}

      {/* Wallet Information - always shown at the bottom */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-200 mb-2">
          Wallet Information
        </h3>
        {handleEmptyWalletInfo()}
      </div>
    </div>
  );
};

export default WalletManager;

import { useEffect, useRef, useState } from "react";

interface NodeLogsViewerProps {
  isConnected: boolean;
  fetchNodeLogs: () => Promise<string>;
  isNodeRunning: boolean;
}

const NodeLogsViewer: React.FC<NodeLogsViewerProps> = ({
  isConnected,
  fetchNodeLogs,
  isNodeRunning,
}) => {
  const [logs, setLogs] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const logsRef = useRef<HTMLPreElement>(null);
  const intervalRef = useRef<number | null>(null);

  const handleFetchLogs = async () => {
    if (!isConnected || !isNodeRunning) return;

    setIsLoading(true);
    setError("");

    try {
      const nodeLogs = await fetchNodeLogs();
      setLogs(nodeLogs);
    } catch (err) {
      setError("Failed to fetch node logs. Please try again.");
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch logs initially if connected and node is running
    if (isConnected && isNodeRunning) {
      handleFetchLogs();
    }

    return () => {
      // Clean up interval on unmount
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isConnected, isNodeRunning]);

  useEffect(() => {
    // Scroll to bottom when logs update
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    // Set up or clear auto-refresh interval
    if (autoRefresh && isConnected && isNodeRunning) {
      intervalRef.current = window.setInterval(handleFetchLogs, 5000); // Refresh every 5 seconds
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, isConnected, isNodeRunning]);

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-blue-400 mb-4">
          Massa Node Logs
        </h2>
        <div className="bg-gray-900 rounded-lg p-8 flex justify-center items-center border border-gray-700">
          <p className="text-gray-400">Connect to a server to view node logs</p>
        </div>
      </div>
    );
  }

  if (!isNodeRunning) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-blue-400 mb-4">
          Massa Node Logs
        </h2>
        <div className="bg-gray-900 rounded-lg p-8 flex justify-center items-center border border-gray-700">
          <p className="text-gray-400">
            Node is not running. Start the node to view logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-400">Massa Node Logs</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              id="autoRefresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-500 rounded focus:ring-blue-500 mr-2"
            />
            <label htmlFor="autoRefresh" className="text-gray-300 text-sm">
              Auto-refresh (5s)
            </label>
          </div>
          <button
            onClick={handleFetchLogs}
            className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
            disabled={isLoading}
          >
            <svg
              className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
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
            {isLoading ? "Fetching..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-700 text-red-400">
          {error}
        </div>
      )}

      <div className="relative">
        {isLoading && logs === "" && (
          <div className="absolute inset-0 flex justify-center items-center bg-gray-900/70 rounded-lg z-10">
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-500 mb-2"
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
              <p className="text-blue-300">Loading node logs...</p>
            </div>
          </div>
        )}
        <div className="bg-gray-900 rounded-lg border border-gray-700 h-[400px] overflow-hidden flex flex-col">
          <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex space-x-2 mr-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-gray-400 text-sm font-mono">
              massa_node screen session
            </span>
          </div>
          <pre
            ref={logsRef}
            className="text-green-300 p-4 overflow-auto flex-1 font-mono text-sm whitespace-pre-wrap"
          >
            {logs || "No logs available yet. Try refreshing."}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default NodeLogsViewer;

import { useState, Dispatch, SetStateAction, useRef, useEffect } from "react";
import StartNodeModal from "./StartNodeModal";
import NodeLogsViewer from "./NodeLogsViewer";

interface ServerSetupScreenProps {
  setCurrentView: Dispatch<SetStateAction<string>>;
  host: string;
  setHost: Dispatch<SetStateAction<string>>;
  port: number;
  setPort: Dispatch<SetStateAction<number>>;
  user: string;
  setUser: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  connectionStatus: string;
  isConnecting: boolean;
  isConnected: boolean;
  handleConnect: () => Promise<void>;
  handleDisconnect: () => Promise<void>;
  command: string;
  setCommand: Dispatch<SetStateAction<string>>;
  commandOutput: string;
  isRunningCommand: boolean;
  handleRunCommand: () => Promise<void>;
  nodePassword: string;
  setNodePassword: Dispatch<SetStateAction<string>>;
  publicIp: string;
  setPublicIp: Dispatch<SetStateAction<string>>;
  setupLog: string;
  isProcessingSetup: boolean;
  handleSetupMassaComponents: () => Promise<void>;
  installationSuccess: boolean;
  serverStats: string;
  isLoadingServerStats: boolean;
  handleRefreshServerStats: () => Promise<void>;
  forceReinstall: boolean;
  setForceReinstall: Dispatch<SetStateAction<boolean>>;
  showForceReinstallOption: boolean;
  massaNodeStatus: string;
  cpuUsage: string | null;
  ramUsage: string | null;
  diskUsage: string | null;
  isCheckingNodeStatus: boolean;
  isStartingNode: boolean;
  handleStartMassaNode: () => Promise<void>;
  fetchNodeLogs: () => Promise<string>;
  isNodeRunning: boolean;
}

const ServerSetupScreen: React.FC<ServerSetupScreenProps> = ({
  setCurrentView,
  host,
  setHost,
  port,
  setPort,
  user,
  setUser,
  password,
  setPassword,
  connectionStatus,
  isConnecting,
  isConnected,
  handleConnect,
  handleDisconnect,
  command,
  setCommand,
  commandOutput,
  isRunningCommand,
  handleRunCommand,
  nodePassword,
  setNodePassword,
  publicIp,
  setPublicIp,
  setupLog,
  isProcessingSetup,
  handleSetupMassaComponents,
  installationSuccess,
  serverStats,
  isLoadingServerStats,
  handleRefreshServerStats,
  forceReinstall,
  setForceReinstall,
  showForceReinstallOption,
  massaNodeStatus,
  cpuUsage,
  ramUsage,
  diskUsage,
  isCheckingNodeStatus,
  isStartingNode,
  handleStartMassaNode,
  fetchNodeLogs,
  isNodeRunning,
}) => {
  const logRef = useRef<HTMLPreElement>(null);
  const [isStartNodeModalOpen, setIsStartNodeModalOpen] = useState(false);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [setupLog]);

  // Check if node is installed but not running
  const nodeInstalledButNotRunning =
    massaNodeStatus.toLowerCase().includes("stopped_with_logs") ||
    massaNodeStatus.toLowerCase().includes("stopped_empty_log") ||
    massaNodeStatus.toLowerCase().includes("stopped_no_logs") ||
    massaNodeStatus.toLowerCase().includes("stopped_unknown_log_status");

  // Check if node is installed (regardless of running state)
  const nodeIsInstalled =
    massaNodeStatus.toLowerCase().includes("running") ||
    nodeInstalledButNotRunning;

  const nodeIsNotInstalled = massaNodeStatus
    .toLowerCase()
    .includes("not_installed");

  // Add console logs for debugging
  useEffect(() => {
    console.log("Current massaNodeStatus:", massaNodeStatus);
    console.log("nodeInstalledButNotRunning:", nodeInstalledButNotRunning);
    console.log("nodeIsInstalled:", nodeIsInstalled);
    console.log("nodeIsNotInstalled:", nodeIsNotInstalled);
  }, [
    massaNodeStatus,
    nodeInstalledButNotRunning,
    nodeIsInstalled,
    nodeIsNotInstalled,
  ]);

  // Replace the "Start Node" button in status card with a more prominent button
  const handleShowStartNodeModal = () => {
    setIsStartNodeModalOpen(true);
  };

  // Inline SVG icons for cards
  const StatusIcon = ({ status }: { status: string }) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("running")) {
      return (
        <svg
          className="w-8 h-8 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    } else if (
      lowerStatus.includes("stopped") ||
      lowerStatus.includes("error") ||
      lowerStatus.includes("not_installed")
    ) {
      // Consolidate red and gray for simplicity, or differentiate if needed
      const iconColor = lowerStatus.includes("not_installed")
        ? "text-gray-500"
        : "text-red-400";
      if (lowerStatus.includes("not_installed")) {
        return (
          <svg
            className={`w-8 h-8 ${iconColor}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        );
      }
      return (
        <svg
          className={`w-8 h-8 ${iconColor}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }
    // Default to loading/unknown (yellow)
    return (
      <svg
        className="w-8 h-8 text-yellow-400 animate-spin"
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
    );
  };

  const CpuIcon = () => (
    <svg
      className="w-8 h-8 text-blue-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3m0-12h.01M12 12h.01M12 18h.01M7 12h.01M17 12h.01"
      />
    </svg>
  );

  const RamIcon = () => (
    <svg
      className="w-8 h-8 text-purple-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8h16M4 16h16M8 4l8 16M16 4l-8 16"
      />
    </svg>
  );

  const DiskIcon = () => (
    <svg
      className="w-8 h-8 text-teal-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    </svg>
  );

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mr-4">
              <svg
                className="h-8 w-8 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <path d="M12 17l5-5h-3V8h-4v4H7l5 5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Massa Node Manager
            </h1>
          </div>
          <button
            onClick={() => setCurrentView("welcome")}
            className="text-blue-400 hover:text-blue-300 flex items-center"
          >
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Status Cards Section */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Massa Node Status Card */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-3 border border-gray-700">
              <StatusIcon status={massaNodeStatus} />
              <div>
                <p className="text-sm text-gray-400">Massa Node</p>
                <p
                  className={`text-lg font-semibold ${
                    massaNodeStatus.toLowerCase().includes("running")
                      ? "text-green-400"
                      : massaNodeStatus.toLowerCase().includes("stopped") ||
                        massaNodeStatus.toLowerCase().includes("error")
                      ? "text-red-400"
                      : massaNodeStatus.toLowerCase().includes("not_installed")
                      ? "text-gray-500"
                      : "text-yellow-400"
                  }`}
                >
                  {isCheckingNodeStatus
                    ? "Loading..."
                    : massaNodeStatus.replace(/_/g, " ").toUpperCase()}
                </p>
                {nodeInstalledButNotRunning && (
                  <button
                    onClick={handleShowStartNodeModal}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded flex items-center"
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
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Start Node
                  </button>
                )}
              </div>
            </div>

            {/* CPU Usage Card */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-3 border border-gray-700">
              <CpuIcon />
              <div>
                <p className="text-sm text-gray-400">CPU Usage</p>
                <p className="text-lg font-semibold text-blue-400">
                  {isLoadingServerStats && !cpuUsage
                    ? "Loading..."
                    : cpuUsage || "N/A"}
                </p>
              </div>
            </div>

            {/* RAM Usage Card */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-3 border border-gray-700">
              <RamIcon />
              <div>
                <p className="text-sm text-gray-400">RAM Usage</p>
                <p className="text-lg font-semibold text-purple-400">
                  {isLoadingServerStats && !ramUsage
                    ? "Loading..."
                    : ramUsage || "N/A"}
                </p>
              </div>
            </div>

            {/* Disk Usage Card */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-3 border border-gray-700">
              <DiskIcon />
              <div>
                <p className="text-sm text-gray-400">Disk / Usage</p>
                <p className="text-lg font-semibold text-teal-400">
                  {isLoadingServerStats && !diskUsage
                    ? "Loading..."
                    : diskUsage || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Sections */}
        <div className="space-y-6">
          {/* SSH Connection Section */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold text-blue-400 mb-4">
              SSH Connection
            </h2>
            {!isConnected && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="host" className="block text-gray-300 mb-2">
                    Host:
                  </label>
                  <input
                    id="host"
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="E.g., 192.168.1.100"
                    disabled={isConnecting || isConnected}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="port" className="block text-gray-300 mb-2">
                    Port:
                  </label>
                  <input
                    id="port"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    disabled={isConnecting || isConnected}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="user" className="block text-gray-300 mb-2">
                    User:
                  </label>
                  <input
                    id="user"
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="E.g., ubuntu"
                    disabled={isConnecting || isConnected}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-gray-300 mb-2"
                  >
                    Password:
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isConnecting || isConnected}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="mt-4">
              {isConnected ? (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-medium"
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Disconnecting..." : "Disconnect from Server"}
                </button>
              ) : (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
                  onClick={handleConnect}
                  disabled={isConnecting || !host || !user || !password}
                >
                  {isConnecting ? "Connecting..." : "Connect to Server"}
                </button>
              )}

              {connectionStatus && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    connectionStatus.toLowerCase().includes("error")
                      ? "bg-red-900/20 border border-red-800 text-red-200"
                      : connectionStatus.toLowerCase().includes("successfully")
                      ? "bg-green-900/20 border border-green-800 text-green-200"
                      : "bg-blue-900/20 border border-blue-800 text-blue-200"
                  }`}
                >
                  {connectionStatus}
                </div>
              )}
            </div>
          </div>

          {isConnected && (
            <>
              {/* Server Vitals Section */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-400">
                    Server Vitals
                  </h2>
                  <button
                    onClick={handleRefreshServerStats}
                    className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
                    disabled={isLoadingServerStats}
                  >
                    <svg
                      className={`h-4 w-4 mr-1 ${
                        isLoadingServerStats ? "animate-spin" : ""
                      }`}
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
                    {isLoadingServerStats ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
                {isLoadingServerStats && !serverStats && (
                  <div className="flex justify-center items-center py-4">
                    <svg
                      className="animate-spin h-6 w-6 text-blue-500"
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
                  </div>
                )}
                {serverStats && (
                  <div className="text-sm">
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <pre className="text-green-300 overflow-auto max-h-96 whitespace-pre-wrap font-mono">
                        {serverStats}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Remote Command Section */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <h2 className="text-xl font-bold text-blue-400 mb-4">
                  Remote Command
                </h2>
                <div>
                  <label htmlFor="command" className="block text-gray-300 mb-2">
                    Command:
                  </label>
                  <div className="flex">
                    <input
                      id="command"
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      placeholder="E.g., ls -la"
                      className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-r-lg font-medium"
                      onClick={handleRunCommand}
                      disabled={isRunningCommand || !isConnected}
                    >
                      {isRunningCommand ? "Running..." : "Run"}
                    </button>
                  </div>
                </div>

                {commandOutput && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      Command Output:
                    </h3>
                    <pre className="bg-gray-900 text-blue-300 rounded-lg p-4 overflow-auto max-h-60 whitespace-pre-wrap border border-gray-700 font-mono text-sm">
                      {commandOutput}
                    </pre>
                  </div>
                )}
              </div>

              {/* Massa Node Setup Section - Only show if node is not installed */}
              {nodeIsNotInstalled && (
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                  <h2 className="text-xl font-bold text-blue-400 mb-4">
                    Massa Services Setup
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="nodePassword"
                        className="block text-gray-300 mb-2"
                      >
                        Node Password (for setup & services):
                      </label>
                      <input
                        id="nodePassword"
                        type="password"
                        value={nodePassword}
                        onChange={(e) => setNodePassword(e.target.value)}
                        placeholder="Required for setup/start"
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                        disabled={isProcessingSetup}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="publicIp"
                        className="block text-gray-300 mb-2"
                      >
                        Public IP (for node config):
                      </label>
                      <input
                        id="publicIp"
                        type="text"
                        value={publicIp}
                        onChange={(e) => setPublicIp(e.target.value)}
                        placeholder="Your server's public IP"
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                        disabled={isProcessingSetup}
                      />
                    </div>
                  </div>

                  {/* Force Reinstall Checkbox and Warning - Conditionally Rendered */}
                  {showForceReinstallOption && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-700">
                      <div className="flex items-center mb-2">
                        <input
                          id="forceReinstall"
                          type="checkbox"
                          checked={forceReinstall}
                          onChange={(e) => setForceReinstall(e.target.checked)}
                          className="h-5 w-5 text-red-600 border-gray-500 rounded focus:ring-red-500 mr-3"
                          disabled={isProcessingSetup}
                        />
                        <label
                          htmlFor="forceReinstall"
                          className="text-yellow-300 font-medium"
                        >
                          Force Reinstall (Deletes Existing Data)
                        </label>
                      </div>
                      {forceReinstall && (
                        <p className="text-red-400 text-sm font-semibold">
                          WARNING: This will PERMANENTLY DELETE your existing
                          Massa Node installation at{" "}
                          <code className="bg-red-700/50 px-1 py-0.5 rounded">
                            /root/massa_node/massa
                          </code>
                          , including your{" "}
                          <code className="bg-red-700/50 px-1 py-0.5 rounded">
                            wallet.dat
                          </code>
                          . This action is IRREVERSIBLE. Ensure you have backups
                          if needed.
                        </p>
                      )}
                      {!forceReinstall && (
                        <p className="text-yellow-400 text-sm">
                          If you check this, the script will attempt to delete
                          any existing Massa installation in{" "}
                          <code className="bg-yellow-700/50 px-1 py-0.5 rounded">
                            /root/massa_node/massa
                          </code>{" "}
                          before installing. Use with caution.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-4 mb-4">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium flex-1 disabled:opacity-50"
                      onClick={handleSetupMassaComponents}
                      disabled={
                        isProcessingSetup ||
                        !isConnected ||
                        !nodePassword ||
                        !publicIp
                      }
                    >
                      {isProcessingSetup
                        ? "Processing Setup..."
                        : "Setup Massa Services"}
                    </button>
                  </div>

                  {installationSuccess && !isProcessingSetup && (
                    <div className="mt-4 p-3 rounded-lg bg-green-900/20 border border-green-800 text-green-200">
                      INFO: Massa services appear to be running. Check script
                      output for details and screen sessions.
                    </div>
                  )}

                  {setupLog && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">
                        Setup Script Output:
                      </h3>
                      <pre
                        ref={logRef}
                        className="bg-gray-900 text-gray-300 rounded-lg p-4 overflow-auto max-h-96 whitespace-pre-wrap border border-gray-700 font-mono text-sm"
                      >
                        {setupLog}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Node Logs Section - Add this section after the Massa Services Setup section */}
              {nodeIsInstalled && (
                <NodeLogsViewer
                  isConnected={isConnected}
                  fetchNodeLogs={fetchNodeLogs}
                  isNodeRunning={isNodeRunning}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Start Node Modal */}
      <StartNodeModal
        isOpen={isStartNodeModalOpen}
        onClose={() => setIsStartNodeModalOpen(false)}
        nodePassword={nodePassword}
        setNodePassword={setNodePassword}
        onStartNode={handleStartMassaNode}
        isStartingNode={isStartingNode}
      />
    </div>
  );
};

export default ServerSetupScreen;

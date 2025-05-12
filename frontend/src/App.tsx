import { useState, Dispatch, SetStateAction, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";
import {
  ConnectToServer,
  RunCommand,
  SetupAndRunMassaComponents as BackendSetupAndRunMassaComponents,
  DisconnectFromServer,
  CheckMassaNodeInstallation as BackendCheckMassaNodeInstallation,
  GetServerStats as BackendGetServerStats,
  CheckMassaNodeStatus as BackendCheckMassaNodeStatus,
} from "../wailsjs/go/main/App";

// Define Prop types for the new components
interface WelcomeScreenProps {
  setCurrentView: Dispatch<SetStateAction<string>>;
}

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
}

// Welcome Screen with Card Options - Moved outside App
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ setCurrentView }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
    <div className="mb-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center">
          <svg
            className="h-16 w-16 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M12 17l5-5h-3V8h-4v4H7l5 5z" />
          </svg>
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-2">Massa Node Manager</h1>
      <p className="text-xl text-blue-400">
        Don't wait, become an actor of the decentralisation now!
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
      {/* Start from Scratch Card - Coming Soon */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 opacity-75 relative">
        <div className="p-6 flex flex-col items-center text-center h-full">
          <div className="rounded-full bg-red-500/20 p-4 mb-4">
            <svg
              className="h-10 w-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Start from Scratch</h2>
          <p className="text-gray-400 mb-6">
            Let us take care of everything for you.
          </p>
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-blue-600 text-white py-2 px-4 rounded-full font-bold">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* Setup with Your Server Card - Active */}
      <div
        className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-blue-500 transform hover:scale-105 transition-transform cursor-pointer"
        onClick={() => setCurrentView("server-setup")}
      >
        <div className="p-6 flex flex-col items-center text-center h-full">
          <div className="rounded-full bg-blue-500/20 p-4 mb-4">
            <svg
              className="h-10 w-10 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Setup with Your Server</h2>
          <p className="text-gray-300 mb-6">
            Quickly install a Massa Node on your existing server.
          </p>
          <button className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full font-medium">
            Get Started
          </button>
        </div>
      </div>

      {/* Just Watch Card - Coming Soon */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 opacity-75 relative">
        <div className="p-6 flex flex-col items-center text-center h-full">
          <div className="rounded-full bg-purple-500/20 p-4 mb-4">
            <svg
              className="h-10 w-10 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Just Watch</h2>
          <p className="text-gray-400 mb-6">
            Do you already have a node? Just watch.
          </p>
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-blue-600 text-white py-2 px-4 rounded-full font-bold">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-12 text-center text-gray-500">
      <p>© 2025 Massa Node Manager | Created by Altay</p>
    </div>
  </div>
);

// Server Setup Screen with SSH Connection, Commands, and Node Installation - Moved outside App
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
}) => {
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [setupLog]);

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
        {" "}
        {/* Increased max-width for wider layout */}
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
              {/* Server Vitals Section - Title Only, button removed */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-400">
                    Server Vitals
                  </h2>
                  {/* Refresh Button Removed */}
                </div>
                {/* {isLoadingServerStats && !serverStats && (
                  <p className="text-center text-gray-400">
                    Loading server vitals...
                  </p>
                )} */}
                {/* Preformatted full server stats log - can be removed if cards are sufficient */}
                {serverStats && (
                  <pre className="bg-gray-900 text-sky-300 rounded-lg p-4 overflow-auto max-h-60 whitespace-pre-wrap border border-gray-700 font-mono text-sm">
                    {serverStats}
                  </pre>
                )}
                {/* {!serverStats && !isLoadingServerStats && (
                  <p className="text-center text-gray-400">
                    Server stats will appear here after connecting or
                    refreshing.
                  </p>
                )} */}
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

              {/* Massa Node Setup Section */}
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
                        If you check this, the script will attempt to delete any
                        existing Massa installation in{" "}
                        <code className="bg-yellow-700/50 px-1 py-0.5 rounded">
                          /root/massa_node/massa
                        </code>{" "}
                        before installing. Use with caution.
                      </p>
                    )}
                  </div>
                )}

                {/* Toast Notification Area - Will be handled by react-hot-toast Toaster component */}
                {/* {toastNotification && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm font-medium border ${ 
                      toastNotification.type === "success"
                        ? "bg-green-900/30 border-green-700 text-green-200"
                        : toastNotification.type === "error"
                        ? "bg-red-900/30 border-red-700 text-red-200"
                        : "bg-blue-900/30 border-blue-700 text-blue-200"
                    }`}
                  >
                    {toastNotification.message}
                  </div>
                )} */}

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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  // View state
  const [currentView, setCurrentView] = useState("welcome"); // welcome, server-setup

  // SSH Connection State
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState(22);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Command Execution State
  const [command, setCommand] = useState("ls -la");
  const [commandOutput, setCommandOutput] = useState("");
  const [isRunningCommand, setIsRunningCommand] = useState(false);

  // Massa Node Setup State
  const [nodePassword, setNodePassword] = useState("");
  const [publicIp, setPublicIp] = useState("");
  const [setupLog, setSetupLog] = useState("");
  const [isProcessingSetup, setIsProcessingSetup] = useState(false);
  const [installationSuccess, setInstallationSuccess] = useState(false);
  const [forceReinstall, setForceReinstall] = useState(false);
  const [showForceReinstallOption, setShowForceReinstallOption] =
    useState(false);

  // Server Stats State
  const [serverStats, setServerStats] = useState("");
  const [isLoadingServerStats, setIsLoadingServerStats] = useState(false);
  const [cpuUsage, setCpuUsage] = useState<string | null>(null);
  const [ramUsage, setRamUsage] = useState<string | null>(null);
  const [diskUsage, setDiskUsage] = useState<string | null>(null);

  // Massa Node Status State
  const [massaNodeStatus, setMassaNodeStatus] = useState("Checking...");
  const [isCheckingNodeStatus, setIsCheckingNodeStatus] = useState(false);

  const handleRefreshServerStats = async () => {
    if (!isConnected) {
      // toast.error("Connect to a server first to see stats."); // Already handled by card display state
      return;
    }
    setIsLoadingServerStats(true); // This can still be used to show combined loading for CPU/RAM/Disk if desired
    // const statsToastId = toast.loading("Fetching server stats..."); // Toast can be omitted if updates are frequent
    try {
      const result = await BackendGetServerStats();
      // Initialize with N/A to clear previous values if parsing fails for any part
      let parsedCpu = "N/A";
      let parsedRam = "N/A";
      let parsedDisk = "N/A";

      if (result.includes("Fetching") && result.includes("Executing:")) {
        const lines = result.split("\n");
        lines.forEach((line) => {
          if (line.startsWith("CPU Usage:")) {
            // Expecting: "CPU Usage: CPU Usage: X%" or "CPU Usage: X%"
            const cpuParts = line.split("CPU Usage:");
            parsedCpu = cpuParts[cpuParts.length - 1].trim(); // Get the last part which should be X%
          }
          if (line.startsWith("RAM:")) {
            // RAM: 987/7801MB (12.65% used)
            const ramStr = line.replace("RAM:", "").trim();
            const match = ramStr.match(/(\d+\/\d+MB) \((.*% used)\)/);
            if (match && match.length === 3) {
              parsedRam = `${match[1]} (${match[2]})`;
            } else {
              parsedRam = ramStr; // Fallback to raw string if regex fails
            }
          }
          if (line.startsWith("Disk /:")) {
            // Disk /: 10G/100G (10% used)
            const diskStr = line.replace("Disk /:", "").trim();
            const match = diskStr.match(/(\d+\w*\/\d+\w*) \((.*used)\)/);
            if (match && match.length === 3) {
              parsedDisk = `${match[1]} (${match[2]})`;
            } else {
              parsedDisk = diskStr; // Fallback to raw string if regex fails
            }
          }
        });
      } else {
        toast.error("Could not parse server stats format.");
      }
      setCpuUsage(parsedCpu);
      setRamUsage(parsedRam);
      setDiskUsage(parsedDisk);
      setServerStats(result); // Keep the full log for the preformatted display if needed
      // toast.success("Server stats refreshed!", { id: statsToastId }); // Omit toast for frequent updates
    } catch (error: any) {
      toast.error(
        `Server Stats Error: ${
          error?.message || error || "An unknown error occurred."
        }`
      );
      setCpuUsage("Error");
      setRamUsage("Error");
      setDiskUsage("Error");
    } finally {
      setIsLoadingServerStats(false);
    }
  };

  const handleCheckMassaNodeStatus = async () => {
    if (!isConnected) return;
    setIsCheckingNodeStatus(true);
    try {
      const status = await BackendCheckMassaNodeStatus();
      setMassaNodeStatus(status);
    } catch (error: any) {
      setMassaNodeStatus("Error fetching status");
      toast.error(`Error checking node status: ${error?.message || error}`);
    } finally {
      setIsCheckingNodeStatus(false);
    }
  };

  const handleConnect = async () => {
    if (!host || !port || !user || !password) {
      toast.error("Please fill in all server connection details.");
      return;
    }
    setIsConnecting(true);
    const connectToastId = toast.loading("Connecting to server...");

    setCommandOutput("");
    setSetupLog("");
    setInstallationSuccess(false);
    setServerStats("");
    setShowForceReinstallOption(false);
    setForceReinstall(false);
    try {
      const connResult = await ConnectToServer(
        host,
        Number(port),
        user,
        password
      );
      setConnectionStatus(connResult);
      if (connResult.toLowerCase().includes("successfully connected")) {
        setIsConnected(true);
        await handleRefreshServerStats();
        setSetupLog(
          (prev) => prev + "Checking for existing Massa Node installation...\n"
        );
        try {
          const checkResult = await BackendCheckMassaNodeInstallation();
          setSetupLog((prev) => prev + checkResult + "\n");
          if (checkResult === "INSTALLED") {
            setInstallationSuccess(true);
            setShowForceReinstallOption(true);
            setSetupLog(
              (prev) =>
                prev +
                "INFO: Existing installation detected by initial check.\nUse 'Setup Massa Services' to ensure it is running correctly or to update settings.\n"
            );
          } else if (checkResult === "NOT_INSTALLED") {
            setInstallationSuccess(false);
            setShowForceReinstallOption(false);
            setForceReinstall(false);
            setSetupLog(
              (prev) =>
                prev +
                "INFO: No existing installation detected by initial check. Use 'Setup Massa Services' to install.\n"
            );
          } else {
            setSetupLog(
              (prev) =>
                prev +
                `WARN: Could not determine installation status from check: ${checkResult}\n`
            );
            setInstallationSuccess(false);
            setShowForceReinstallOption(false);
            setForceReinstall(false);
          }
        } catch (checkError: any) {
          setSetupLog(
            (prev) =>
              prev +
              `ERROR checking installation status: ${
                checkError || "Unknown error"
              }\n`
          );
          setInstallationSuccess(false);
          setShowForceReinstallOption(false);
          setForceReinstall(false);
        }
        await handleCheckMassaNodeStatus();
      } else {
        setIsConnected(false);
      }
    } catch (error: any) {
      setConnectionStatus(
        `Connection Error: ${error || "An unknown error occurred."}`
      );
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
      setCommandOutput("");
      setSetupLog("");
      setInstallationSuccess(false);
      setServerStats("");
      setIsLoadingServerStats(false);
      setShowForceReinstallOption(false);
      setForceReinstall(false);
      toast.dismiss(connectToastId);
      toast.success("Disconnected from server.");
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    setConnectionStatus("Disconnecting...");
    try {
      const result = await DisconnectFromServer();
      setConnectionStatus(result);
    } catch (error: any) {
      setConnectionStatus(
        `Disconnect Error: ${error || "An unknown error occurred."}`
      );
    } finally {
      setIsConnected(false);
      setCommandOutput("");
      setSetupLog("");
      setInstallationSuccess(false);
      setServerStats("");
      setIsLoadingServerStats(false);
      setShowForceReinstallOption(false);
      setForceReinstall(false);
      setCpuUsage(null);
      setRamUsage(null);
      setDiskUsage(null);
      setMassaNodeStatus("Checking...");
      setIsCheckingNodeStatus(false);
      setIsConnecting(false);
    }
  };

  const handleRunCommand = async () => {
    if (!command) {
      toast.error("Please enter a command to run.");
      return;
    }
    setIsRunningCommand(true);
    const cmdToastId = toast.loading(`Running: ${command}`);
    try {
      const result = await RunCommand(command);
      setCommandOutput(result);
      toast.success(`Command finished. Output below.`, { id: cmdToastId });
    } catch (error: any) {
      setCommandOutput(
        `Command Execution Error: ${
          error?.message || error || "An unknown error occurred."
        }`
      );
      toast.error(
        `Command Error: ${
          error?.message || error || "An unknown error occurred."
        }`,
        { id: cmdToastId }
      );
    } finally {
      setIsRunningCommand(false);
    }
  };

  const handleSetupMassaComponents = async () => {
    if (!nodePassword) {
      toast.error("Node Password is required for setup.");
      return;
    }
    if (!publicIp) {
      toast.error("Public IP is required for node configuration.");
      return;
    }
    setIsProcessingSetup(true);
    const setupToastId = toast.loading("Massa setup process initiated...");

    setSetupLog(
      `Starting Massa services setup for Public IP: ${publicIp}...\nThis might take a while. Check the script output below.\n------------------------------------\n`
    );
    setInstallationSuccess(false);
    try {
      const result = await BackendSetupAndRunMassaComponents(
        nodePassword,
        publicIp,
        forceReinstall
      );
      setSetupLog(result);

      const successNode = result
        .toLowerCase()
        .includes("success: massa node screen session appears to be running");
      const successClient = result
        .toLowerCase()
        .includes("success: massa client screen session appears to be running");

      if (successNode && successClient) {
        setSetupLog(
          (prev) =>
            prev +
            "\n\nSUCCESS: Massa Node and Client services appear to be running in screen sessions."
        );
        setInstallationSuccess(true);
        toast.success("Massa services setup successful! Check script output.", {
          id: setupToastId,
        });
        await handleCheckMassaNodeStatus();
      } else if (result.toLowerCase().includes("error:")) {
        setSetupLog(
          (prev) =>
            prev +
            "\n\nERROR: The setup script reported errors. Please check the full output above."
        );
        setInstallationSuccess(false);
        toast.error("Setup script reported errors. Check logs.", {
          id: setupToastId,
        });
      } else {
        setSetupLog(
          (prev) =>
            prev +
            "\n\nINFO: Setup script finished. Review output to confirm status of services. Could not automatically verify success from script output."
        );
        setInstallationSuccess(false);
        toast("Setup script finished. Review output to confirm status.", {
          id: setupToastId,
          duration: 6000,
        });
      }
    } catch (error: any) {
      const errorMsg = error?.message || error || "An unknown error occurred.";
      setSetupLog(
        (prevLog) =>
          prevLog +
          `\n\nSETUP CRITICAL ERROR: ${errorMsg}\n` +
          "This usually means the Go backend encountered an issue before or during script execution. Check backend logs."
      );
      setInstallationSuccess(false);
      toast.error(`Critical setup error: ${errorMsg}`, {
        id: setupToastId,
        duration: 6000,
      });
    } finally {
      setIsProcessingSetup(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      // Initial fetch on connect
      handleCheckMassaNodeStatus();
      handleRefreshServerStats();

      const intervalId = setInterval(() => {
        handleCheckMassaNodeStatus();
        handleRefreshServerStats();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(intervalId); // Cleanup on disconnect or component unmount
    }
  }, [isConnected]); // Rerun when isConnected changes

  // Render current view
  return (
    <div className="bg-gray-900 min-h-screen">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: "",
          duration: 5000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "green",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
          },
        }}
      />
      {currentView === "welcome" ? (
        <WelcomeScreen setCurrentView={setCurrentView} />
      ) : (
        <ServerSetupScreen
          setCurrentView={setCurrentView}
          host={host}
          setHost={setHost}
          port={port}
          setPort={setPort}
          user={user}
          setUser={setUser}
          password={password}
          setPassword={setPassword}
          connectionStatus={connectionStatus}
          isConnecting={isConnecting}
          isConnected={isConnected}
          handleConnect={handleConnect}
          handleDisconnect={handleDisconnect}
          command={command}
          setCommand={setCommand}
          commandOutput={commandOutput}
          isRunningCommand={isRunningCommand}
          handleRunCommand={handleRunCommand}
          nodePassword={nodePassword}
          setNodePassword={setNodePassword}
          publicIp={publicIp}
          setPublicIp={setPublicIp}
          setupLog={setupLog}
          isProcessingSetup={isProcessingSetup}
          handleSetupMassaComponents={handleSetupMassaComponents}
          installationSuccess={installationSuccess}
          serverStats={serverStats}
          isLoadingServerStats={isLoadingServerStats}
          handleRefreshServerStats={handleRefreshServerStats}
          forceReinstall={forceReinstall}
          setForceReinstall={setForceReinstall}
          showForceReinstallOption={showForceReinstallOption}
          massaNodeStatus={massaNodeStatus}
          cpuUsage={cpuUsage}
          ramUsage={ramUsage}
          diskUsage={diskUsage}
          isCheckingNodeStatus={isCheckingNodeStatus}
        />
      )}
    </div>
  );
}

export default App;

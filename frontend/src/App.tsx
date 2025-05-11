import { useState, Dispatch, SetStateAction } from "react";
import "./App.css";
import {
  ConnectToServer,
  RunCommand,
  InstallMassaNode as BackendInstallMassaNode,
  DisconnectFromServer,
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
  installationLog: string;
  isInstallingNode: boolean;
  handleInstallMassaNode: () => Promise<void>;
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
      <p>© 2023 Massa Node Manager | Need help? Contact support@example.com</p>
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
  installationLog,
  isInstallingNode,
  handleInstallMassaNode,
}) => (
  <div className="bg-gray-900 min-h-screen p-6">
    <div className="max-w-4xl mx-auto">
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
          <h1 className="text-2xl font-bold text-white">Massa Node Manager</h1>
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

      {/* Main Content */}
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
                <label htmlFor="password" className="block text-gray-300 mb-2">
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
                Massa Node Setup
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="nodePassword"
                    className="block text-gray-300 mb-2"
                  >
                    Node Password:
                  </label>
                  <input
                    id="nodePassword"
                    type="password"
                    value={nodePassword}
                    onChange={(e) => setNodePassword(e.target.value)}
                    placeholder="Password for Massa node/client"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="publicIp"
                    className="block text-gray-300 mb-2"
                  >
                    Public IP:
                  </label>
                  <input
                    id="publicIp"
                    type="text"
                    value={publicIp}
                    onChange={(e) => setPublicIp(e.target.value)}
                    placeholder="Your server's public IP address"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium"
                onClick={handleInstallMassaNode}
                disabled={
                  isInstallingNode || !isConnected || !nodePassword || !publicIp
                }
              >
                {isInstallingNode ? "Installing..." : "Install Massa Node"}
              </button>

              {installationLog && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    Installation Log:
                  </h3>
                  <pre className="bg-gray-900 text-green-300 rounded-lg p-4 overflow-auto max-h-60 whitespace-pre-wrap border border-gray-700 font-mono text-sm">
                    {installationLog}
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

  // Massa Node Installation State
  const [nodePassword, setNodePassword] = useState("");
  const [publicIp, setPublicIp] = useState("");
  const [installationLog, setInstallationLog] = useState("");
  const [isInstallingNode, setIsInstallingNode] = useState(false);

  const handleConnect = async () => {
    if (!host || !port || !user || !password) {
      setConnectionStatus("Please fill in all server connection details.");
      return;
    }
    setIsConnecting(true);
    setConnectionStatus("Connecting...");
    setCommandOutput("");
    setInstallationLog("");
    try {
      const result = await ConnectToServer(host, Number(port), user, password);
      setConnectionStatus(result);
      if (result.toLowerCase().includes("successfully connected")) {
        setIsConnected(true);
      }
    } catch (error: any) {
      setConnectionStatus(
        `Connection Error: ${error || "An unknown error occurred."}`
      );
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    setConnectionStatus("Disconnecting...");
    try {
      const result = await DisconnectFromServer();
      setConnectionStatus(result);
      setIsConnected(false);
      setCommandOutput("");
      setInstallationLog("");
    } catch (error: any) {
      setConnectionStatus(
        `Disconnect Error: ${error || "An unknown error occurred."}`
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRunCommand = async () => {
    if (!command) {
      setCommandOutput("Please enter a command to run.");
      return;
    }
    setIsRunningCommand(true);
    setCommandOutput("Running command...");
    try {
      const result = await RunCommand(command);
      setCommandOutput(result);
    } catch (error: any) {
      setCommandOutput(
        `Command Execution Error: ${error || "An unknown error occurred."}`
      );
    } finally {
      setIsRunningCommand(false);
    }
  };

  const handleInstallMassaNode = async () => {
    if (!nodePassword) {
      setInstallationLog("Please enter a password for the Massa node.");
      return;
    }
    if (!publicIp) {
      setInstallationLog("Please enter the Public IP address for the node.");
      return;
    }
    setIsInstallingNode(true);
    setInstallationLog(
      "Starting Massa Node installation...\nThis might take a while. Check the application logs (terminal) for details from the Go backend."
    );
    try {
      const result = await BackendInstallMassaNode(nodePassword, publicIp);
      setInstallationLog(result);
    } catch (error: any) {
      setInstallationLog(
        `Massa Node Installation Error: ${
          error || "An unknown error occurred."
        }\nCheck backend logs for more details.`
      );
    } finally {
      setIsInstallingNode(false);
    }
  };

  // Render current view
  return (
    <div className="bg-gray-900 min-h-screen">
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
          installationLog={installationLog}
          isInstallingNode={isInstallingNode}
          handleInstallMassaNode={handleInstallMassaNode}
        />
      )}
    </div>
  );
}

export default App;

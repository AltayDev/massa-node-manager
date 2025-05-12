import { useState, useEffect } from "react";
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
  StartMassaNode as BackendStartMassaNode,
  GetMassaNodeLogs as BackendGetMassaNodeLogs,
} from "../wailsjs/go/main/App";

// Import components
import WelcomeScreen from "./components/WelcomeScreen";
import ServerSetupScreen from "./components/ServerSetupScreen";
import NodeLogsViewer from "./components/NodeLogsViewer";

function App() {
  // View state
  const [currentView, setCurrentView] = useState("welcome"); // welcome, server-setup

  // SSH Connection State
  const [host, setHost] = useState("127.0.0.1");
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
  const [isStartingNode, setIsStartingNode] = useState(false);

  // Node Logs State
  const [nodeLogs, setNodeLogs] = useState("");
  const [isLoadingNodeLogs, setIsLoadingNodeLogs] = useState(false);

  const handleRefreshServerStats = async () => {
    if (!isConnected) {
      return;
    }
    setIsLoadingServerStats(true);
    try {
      const result = await BackendGetServerStats();
      // Initialize with N/A to clear previous values if parsing fails for any part
      let parsedCpu = "N/A";
      let parsedRam = "N/A";
      let parsedDisk = "N/A";

      if (result.includes("Server Information")) {
        const lines = result.split("\n");
        lines.forEach((line) => {
          // CPU Usage line
          if (line.startsWith("CPU Usage:")) {
            parsedCpu = line.replace("CPU Usage:", "").trim();
          }

          // RAM Usage line
          if (line.startsWith("RAM Usage:")) {
            parsedRam = line.replace("RAM Usage:", "").trim();
          }

          // Disk Usage line
          if (line.startsWith("Disk Usage:")) {
            parsedDisk = line.replace("Disk Usage:", "").trim();
          }
        });
      } else {
        console.error("Could not parse server stats format:", result);
        toast.error("Could not parse server stats format.");
      }

      console.log("Parsed stats:", { parsedCpu, parsedRam, parsedDisk });
      setCpuUsage(parsedCpu);
      setRamUsage(parsedRam);
      setDiskUsage(parsedDisk);
      setServerStats(result); // Keep the full log for the preformatted display
    } catch (error: any) {
      console.error("Server stats error:", error);
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
        toast.success("Connected to server!", { id: connectToastId });
      } else {
        setIsConnected(false);
        toast.error("Failed to connect to server.", { id: connectToastId });
      }
    } catch (error: any) {
      setConnectionStatus(
        `Connection Error: ${error || "An unknown error occurred."}`
      );
      setIsConnected(false);
      toast.error(`Connection Error: ${error?.message || error}`, {
        id: connectToastId,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    setConnectionStatus("Disconnecting...");
    const disconnectToastId = toast.loading("Disconnecting from server...");

    try {
      const result = await DisconnectFromServer();
      setConnectionStatus(result);
      toast.success("Disconnected from server.", { id: disconnectToastId });
    } catch (error: any) {
      setConnectionStatus(
        `Disconnect Error: ${error || "An unknown error occurred."}`
      );
      toast.error(`Disconnect Error: ${error?.message || error}`, {
        id: disconnectToastId,
      });
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
      setIsStartingNode(false);
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

  const handleStartMassaNode = async () => {
    if (!isConnected) {
      console.error("Can't start node: Not connected");
      return;
    }
    if (!nodePassword) {
      console.error("Can't start node: No password provided");
      toast.error("Node password is required to start the node.");
      return;
    }

    console.log(
      "Starting Massa node with password",
      nodePassword ? "[REDACTED]" : "empty"
    );
    setIsStartingNode(true);
    const startToastId = toast.loading("Starting Massa node...");

    try {
      console.log("Calling BackendStartMassaNode...");
      const result = await BackendStartMassaNode(nodePassword);
      console.log("BackendStartMassaNode result:", result);
      setSetupLog(
        (prev) => prev + "\n--- Start Node Operation ---\n" + result + "\n"
      );

      if (result.includes("Confirmed: Massa node screen is running")) {
        toast.success("Massa node started successfully!", { id: startToastId });
      } else if (result.includes("Massa node screen is already running")) {
        toast.success("Massa node is already running.", { id: startToastId });
      } else if (result.includes("Error:")) {
        toast.error("Failed to start node. Check logs for details.", {
          id: startToastId,
        });
      } else {
        toast("Start operation completed. Check logs for details.", {
          id: startToastId,
        });
      }

      // Check node status after start attempt
      await handleCheckMassaNodeStatus();
    } catch (error: any) {
      console.error("Error starting node:", error);
      toast.error(`Failed to start node: ${error?.message || error}`, {
        id: startToastId,
      });
      setSetupLog(
        (prev) =>
          prev +
          "\nError starting Massa node: " +
          (error?.message || error) +
          "\n"
      );
    } finally {
      setIsStartingNode(false);
    }
  };

  const fetchNodeLogs = async () => {
    if (!isConnected) return "";

    setIsLoadingNodeLogs(true);
    try {
      const logs = await BackendGetMassaNodeLogs();
      setNodeLogs(logs);
      return logs;
    } catch (error: any) {
      console.error("Error fetching node logs:", error);
      toast.error(`Error fetching logs: ${error?.message || error}`);
      return "Error fetching logs. Please try again.";
    } finally {
      setIsLoadingNodeLogs(false);
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
          isStartingNode={isStartingNode}
          handleStartMassaNode={handleStartMassaNode}
          fetchNodeLogs={fetchNodeLogs}
          isNodeRunning={massaNodeStatus.toLowerCase().includes("running")}
        />
      )}
    </div>
  );
}

export default App;

package main

import (
	"bytes"
	"context"
	"fmt"
	"strings"
	"time"

	"encoding/base64"

	"golang.org/x/crypto/ssh"
)

// App struct
type App struct {
	ctx          context.Context
	sshClient    *ssh.Client // Aktif SSH bağlantısını tutar
	nodePassword string      // Add this field
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	fmt.Println("App Startup called")
}

// DomReady is called after the front-end has been loaded
func (a *App) DomReady(ctx context.Context) {
	fmt.Println("App DomReady called")
}

// BeforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will prevent the application from quitting.
func (a *App) BeforeClose(ctx context.Context) (prevent bool) {
	fmt.Println("App BeforeClose called")
	// Ensure SSH client is closed if user tries to close window while connected
	if a.sshClient != nil {
		fmt.Println("SSH client connected, attempting to close it before quitting app...")
		a.sshClient.Close()
		a.sshClient = nil // Set to nil after closing
		fmt.Println("SSH client closed during BeforeClose.")
	}
	return false // Default to allow closing
}

// OnShutdown is called when the app is about to quit.
func (a *App) OnShutdown(ctx context.Context) {
	if a.sshClient != nil {
		a.sshClient.Close()
		a.sshClient = nil // Explicitly set to nil
		fmt.Println("SSH client closed on shutdown.")
	}
	fmt.Println("App OnShutdown called")
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// ConnectToServer establishes an SSH connection to the server.
func (a *App) ConnectToServer(host string, port int, user string, password string) (string, error) {
	if a.sshClient != nil {
		// Mevcut bir bağlantı varsa kapat
		err := a.sshClient.Close()
		if err != nil {
			// Hata olması durumunda loglayalım ama devam edelim
			fmt.Printf("Error closing existing SSH connection: %v\n", err)
		}
		a.sshClient = nil
		a.nodePassword = "" // Reset node password on disconnect
		fmt.Println("Previous SSH connection closed.")
	}

	fmt.Printf("Attempting to connect to %s:%d as %s\n", host, port, user)

	sshConfig := &ssh.ClientConfig{
		User: user,
		Auth: []ssh.AuthMethod{
			ssh.Password(password),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(), // WARNING: Insecure, use for development only. In production, you should verify the host key.
		Timeout:         10 * time.Second,            // Bağlantı zaman aşımını artırdık
	}

	addr := fmt.Sprintf("%s:%d", host, port)
	client, err := ssh.Dial("tcp", addr, sshConfig)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to dial: %s", err) // Simplified error for frontend
		fmt.Printf("Connection error for %s: %v\n", addr, err)
		return errMsg, err
	}

	a.sshClient = client
	successMsg := fmt.Sprintf("Successfully connected to %s!", addr)
	fmt.Println(successMsg)
	return successMsg, nil
}

// DisconnectFromServer closes the active SSH connection.
func (a *App) DisconnectFromServer() (string, error) {
	fmt.Println("Attempting to disconnect from server...")
	if a.sshClient == nil {
		errMsg := "No active SSH connection to disconnect."
		fmt.Println(errMsg)
		return errMsg, nil // Not an error per se, but no action taken
	}

	err := a.sshClient.Close()
	a.sshClient = nil   // Set to nil regardless of close error
	a.nodePassword = "" // Reset node password
	if err != nil {
		errMsg := fmt.Sprintf("Error while disconnecting: %v", err)
		fmt.Println(errMsg)
		return errMsg, err
	}

	successMsg := "Successfully disconnected from server."
	fmt.Println(successMsg)
	return successMsg, nil
}

// RunCommand executes a command on the connected SSH server.
func (a *App) RunCommand(command string) (string, error) {
	if a.sshClient == nil {
		errMsg := "Error: No active SSH connection."
		fmt.Println(errMsg)
		return errMsg, fmt.Errorf(errMsg)
	}

	fmt.Printf("Running command: %s\n", command)

	session, err := a.sshClient.NewSession()
	if err != nil {
		errMsg := fmt.Sprintf("Failed to create session: %v", err)
		fmt.Println(errMsg)
		return errMsg, err
	}
	defer session.Close()

	var stdoutBuf bytes.Buffer
	var stderrBuf bytes.Buffer
	session.Stdout = &stdoutBuf
	session.Stderr = &stderrBuf

	err = session.Run(command)
	stdoutStr := stdoutBuf.String()
	stderrStr := stderrBuf.String()

	// Combine stdout and stderr for the primary output, as scripts often use both for logging.
	// If err is not nil, it means the command likely failed (exited non-zero).
	// The combined output is useful regardless.
	combinedOutput := stdoutStr
	if stderrStr != "" {
		if combinedOutput != "" && !strings.HasSuffix(combinedOutput, "\n") {
			combinedOutput += "\n"
		}
		combinedOutput += stderrStr
	}

	if err != nil {
		// Log the detailed error for backend debugging.
		// The 'combinedOutput' will be returned to the frontend, which includes stdout and stderr.
		fmt.Printf("Error running command '%s': %v\nStdout:\n%s\nStderr:\n%s\n", command, err, stdoutStr, stderrStr)
		// Return the error so the calling Go function knows the command failed.
		return strings.TrimSpace(combinedOutput), err
	}

	fmt.Printf("Command '%s' executed. Combined output:\n%s\n", command, combinedOutput)
	return strings.TrimSpace(combinedOutput), nil
}

// SetupAndRunMassaComponents creates and executes a script to install/setup and run Massa node and client.
func (a *App) SetupAndRunMassaComponents(nodePassword string, publicIp string, forceReinstall bool) (string, error) {
	fmt.Printf("SetupAndRunMassaComponents called. Node Password: [REDACTED], Public IP: %s, Force Reinstall: %t\\n", publicIp, forceReinstall)
	if a.sshClient == nil {
		return "Error: No active SSH connection.", fmt.Errorf("no active SSH connection")
	}

	// Save the node password for future use with massa-client
	a.nodePassword = nodePassword

	// Sanitize publicIp for local testing scenarios
	actualPublicIp := publicIp
	if publicIp == "localhost" {
		actualPublicIp = "127.0.0.1"
		fmt.Println("Warning: 'localhost' provided as Public IP. Using '127.0.0.1' for config.toml. For a real routable node, provide a public IP.")
	}

	scriptContent := fmt.Sprintf(`#!/bin/bash
set -e
# set -o pipefail # pipefail can sometimes hide errors from commands in a pipeline if not handled carefully

NODE_PASSWORD="$1"
PUBLIC_IP_FROM_ARG="$2"
# Third argument to script will be forceReinstall flag
FORCE_REINSTALL_FLAG="$3"

INSTALL_BASE_DIR="/root/massa_node"
MASSA_INSTALL_DIR="${INSTALL_BASE_DIR}/massa"
MASSA_VERSION="MAIN.2.4"
EXPECTED_NODE_DIR="${MASSA_INSTALL_DIR}/massa-node"
EXPECTED_CLIENT_DIR="${MASSA_INSTALL_DIR}/massa-client"
NODE_SCREEN_NAME="massa_node"
CLIENT_SCREEN_NAME="massa_client"
NODE_LOG_PATH="${EXPECTED_NODE_DIR}/logs.txt"

CONFIG_IP="%s" # This will be actualPublicIp from Go

echo "--- Massa Node and Client Setup Script ---"
echo "Node Password: [REDACTED]"
echo "Public IP Argument: ${PUBLIC_IP_FROM_ARG}"
echo "IP for config.toml: ${CONFIG_IP}"
echo "Installation Base Directory: ${INSTALL_BASE_DIR}"
echo "Force Reinstall Flag: ${FORCE_REINSTALL_FLAG}"
echo "------------------------------------------"

if [ -z "${NODE_PASSWORD}" ]; then
    echo "ERROR: Node password is not set. Exiting."
    exit 1
fi
# CONFIG_IP is now taken from Go, not an argument to the script directly for this check
if [ -z "${CONFIG_IP}" ]; then 
    echo "ERROR: IP for config.toml is not set (problem in calling script). Exiting."
    exit 1
fi

# Handle forceful reinstallation if flag is set
if [ "${FORCE_REINSTALL_FLAG}" = "true" ]; then
    echo "INFO: Force reinstall flag is set to true."
    if [ -d "${MASSA_INSTALL_DIR}" ]; then
        echo "WARN: Deleting existing Massa installation directory: ${MASSA_INSTALL_DIR} (includes wallet and node data) due to force reinstall!"
        rm -rf "${MASSA_INSTALL_DIR}"
        if [ $? -ne 0 ]; then 
            echo "ERROR: Failed to delete existing directory ${MASSA_INSTALL_DIR}. Exiting."
            exit 1
        fi
        echo "Successfully deleted ${MASSA_INSTALL_DIR}."
    else
        echo "INFO: No existing directory found at ${MASSA_INSTALL_DIR} to delete for force reinstall."
    fi
fi

# Check for existing installation
if [ -d "${EXPECTED_NODE_DIR}" ] && [ -f "${EXPECTED_NODE_DIR}/massa-node" ] && [ -d "${EXPECTED_CLIENT_DIR}" ] && [ -f "${EXPECTED_CLIENT_DIR}/massa-client" ]; then
    echo "INFO: Existing complete Massa node and client installation detected at ${INSTALL_BASE_DIR}/massa."
    echo "Proceeding to ensure services are started/restarted."
else
    echo "INFO: No existing complete Massa node and client installation found. Proceeding with download and setup."

    if [ -d "${INSTALL_BASE_DIR}/massa" ]; then
        echo "WARN: Found existing '${INSTALL_BASE_DIR}/massa' directory but the setup seems incomplete. Cleaning it up..."
        rm -rf "${INSTALL_BASE_DIR}/massa"
        if [ $? -ne 0 ]; then echo "ERROR: Failed to clean up existing incomplete '${INSTALL_BASE_DIR}/massa' directory. Exiting."; exit 1; fi
    fi
		
    mkdir -p "${INSTALL_BASE_DIR}"
    if [ $? -ne 0 ]; then echo "ERROR: Failed to create base directory ${INSTALL_BASE_DIR}. Exiting."; exit 1; fi
    echo "Created base directory: ${INSTALL_BASE_DIR}"

    DOWNLOAD_URL="https://github.com/massalabs/massa/releases/download/${MASSA_VERSION}/massa_${MASSA_VERSION}_release_linux.tar.gz"
    ARCHIVE_NAME="massa_release.tar.gz"

    echo "Downloading Massa ${MASSA_VERSION} from ${DOWNLOAD_URL} (output suppressed)..."
    cd "${INSTALL_BASE_DIR}"
    # Suppress wget output completely
    if ! wget -O "${ARCHIVE_NAME}" "${DOWNLOAD_URL}" > /dev/null 2>&1; then
        echo "ERROR: Failed to download Massa archive. Check URL or network. Exiting."
        rm -f "${ARCHIVE_NAME}" # Clean up partial download
        exit 1
    fi
    echo "Download complete."

    echo "Extracting archive ${ARCHIVE_NAME} into '${INSTALL_BASE_DIR}' (should create a 'massa' subdirectory)..."
    if ! tar -xzf "${ARCHIVE_NAME}" -C "${INSTALL_BASE_DIR}"; then
        echo "ERROR: Failed to extract Massa archive. Exiting."
        exit 1
    fi
    echo "Extraction complete. Extracted content should be in '${INSTALL_BASE_DIR}/massa'."

    if [ ! -d "${INSTALL_BASE_DIR}/massa" ]; then echo "ERROR: Expected 'massa' subdirectory not found. Exiting."; exit 1; fi
    if [ ! -d "${EXPECTED_NODE_DIR}" ]; then echo "ERROR: Expected node directory ${EXPECTED_NODE_DIR} not found. Exiting."; exit 1; fi
    if [ ! -d "${EXPECTED_CLIENT_DIR}" ]; then echo "ERROR: Expected client directory ${EXPECTED_CLIENT_DIR} not found. Exiting."; exit 1; fi

    echo "Cleaning up archive ${ARCHIVE_NAME}..."
    rm "${ARCHIVE_NAME}"
    echo "Archive cleaned up."

    NODE_CONFIG_DIR="${EXPECTED_NODE_DIR}/config"
    NODE_CONFIG_FILE="${NODE_CONFIG_DIR}/config.toml"

    echo "Creating node config directory: ${NODE_CONFIG_DIR}"
    mkdir -p "${NODE_CONFIG_DIR}"
    if [ $? -ne 0 ]; then echo "ERROR: Failed to create node config directory. Exiting."; exit 1; fi

    echo "Creating node config file ${NODE_CONFIG_FILE} with routable_ip = ${CONFIG_IP}..."
    # Use cat with a heredoc for safer multi-line, special character-friendly file writing
cat << EOF > "${NODE_CONFIG_FILE}"
[protocol]
routable_ip = "${CONFIG_IP}"
EOF
    if [ $? -ne 0 ]; then echo "ERROR: Failed to write node config file. Exiting."; exit 1; fi
    echo "Node config file created. Content:"
    cat "${NODE_CONFIG_FILE}" || echo "WARN: Could not display config file content."
fi

# --- Screen Management ---
echo ""
echo "--- Managing Screen Sessions ---"

terminate_screen() {
    local screen_name="$1"
    echo "Checking for existing screen session: ${screen_name}..."
    # Simpler grep, just check if the name exists in the list, might catch substrings if names are too similar
    if screen -list | grep -q "${screen_name}"; then 
        echo "Found existing screen session ${screen_name}, attempting to terminate it..."
        screen -S "${screen_name}" -X quit
        sleep 1 
        if screen -list | grep -q "${screen_name}"; then
            echo "WARN: Failed to terminate screen ${screen_name} with quit. Trying to kill it..."
            screen -S "${screen_name}" -X kill
            sleep 1
            if screen -list | grep -q "${screen_name}"; then
                 echo "ERROR: Still failed to terminate screen ${screen_name} after kill. Manual check required."
            else
                 echo "Screen ${screen_name} terminated with kill."
            fi
        else
            echo "Screen ${screen_name} terminated with quit."
        fi
    else
        echo "No existing screen session ${screen_name} found (or grep failed to find it)."
    fi
}

terminate_screen "${NODE_SCREEN_NAME}"
terminate_screen "${CLIENT_SCREEN_NAME}"

# Start Massa Node
echo ""
echo "Starting Massa Node in screen session: ${NODE_SCREEN_NAME}"
echo "Node logs will be at: ${NODE_LOG_PATH}"
if [ ! -f "${EXPECTED_NODE_DIR}/massa-node" ]; then
    echo "ERROR: Massa node executable not found at ${EXPECTED_NODE_DIR}/massa-node. Cannot start node."
    exit 1
fi
chmod +x "${EXPECTED_NODE_DIR}/massa-node"

# Ensure log directory exists and log file is writable, or clear old log
rm -f "${NODE_LOG_PATH}"
touch "${NODE_LOG_PATH}"

NODE_START_CMD="cd '${EXPECTED_NODE_DIR}' && ./massa-node -p '${NODE_PASSWORD}' |& tee '${NODE_LOG_PATH}'"
echo "Executing in screen: screen -dmS ${NODE_SCREEN_NAME} /bin/bash -c \"${NODE_START_CMD}\""
screen -dmS "${NODE_SCREEN_NAME}" /bin/bash -c "${NODE_START_CMD}"
NODE_SCREEN_EXIT_CODE=$?
echo "Screen command for node exited with code: ${NODE_SCREEN_EXIT_CODE}"
sleep 8 # Increased sleep

echo "Verifying node screen session ${NODE_SCREEN_NAME}..."
if screen -list | grep -q "${NODE_SCREEN_NAME}"; then
    echo "INFO: Massa Node screen session ${NODE_SCREEN_NAME} was created."
    echo "Checking node log file (${NODE_LOG_PATH}) for activity (last 20 lines)..."
    if [ -f "${NODE_LOG_PATH}" ]; then # Check if log file exists
        if [ -s "${NODE_LOG_PATH}" ]; then # Check if log file is not empty
            echo "SUCCESS: Massa Node log file contains data. Last 20 lines:"
            tail -n 20 "${NODE_LOG_PATH}"
        else
            echo "WARN: Massa Node log file is empty. The node might have failed to start or exited immediately."
        fi
    else
        echo "WARN: Massa Node log file NOT FOUND at ${NODE_LOG_PATH}. Node likely failed very early."
    fi
else
    echo "ERROR: Failed to create/find Massa Node screen session ${NODE_SCREEN_NAME} (screen command exit code: ${NODE_SCREEN_EXIT_CODE})."
    echo "This could be due to an immediate crash of massa-node or an issue with 'screen' itself."
    echo "Checking for logs at ${NODE_LOG_PATH} (last 20 lines if file exists):"
    if [ -f "${NODE_LOG_PATH}" ]; then
        tail -n 20 "${NODE_LOG_PATH}"
    else
        echo "Node log file not found at ${NODE_LOG_PATH}."
    fi
fi

# Start Massa Client
echo ""
echo "Starting Massa Client in screen session: ${CLIENT_SCREEN_NAME}"
if [ ! -f "${EXPECTED_CLIENT_DIR}/massa-client" ]; then
    echo "ERROR: Massa client executable not found at ${EXPECTED_CLIENT_DIR}/massa-client. Cannot start client."
    # exit 1 # Don't exit if only client fails, node might be useful
else
    chmod +x "${EXPECTED_CLIENT_DIR}/massa-client"
    CLIENT_START_CMD="cd '${EXPECTED_CLIENT_DIR}' && ./massa-client -p '${NODE_PASSWORD}'"
    echo "Executing in screen: screen -dmS ${CLIENT_SCREEN_NAME} /bin/bash -c \"${CLIENT_START_CMD}\""
    screen -dmS "${CLIENT_SCREEN_NAME}" /bin/bash -c "${CLIENT_START_CMD}"
    sleep 3

    echo "Verifying client screen session ${CLIENT_SCREEN_NAME}..."
    if screen -list | grep -q "${CLIENT_SCREEN_NAME}"; then
        echo "SUCCESS: Massa Client screen session ${CLIENT_SCREEN_NAME} appears to be running."
    else
        echo "ERROR: Failed to confirm Massa Client screen session ${CLIENT_SCREEN_NAME} is running. Check server manually."
    fi
fi

echo ""
echo "--- Script Finished ---"
echo "To check screens: screen -ls"
echo "To attach to node: screen -r ${NODE_SCREEN_NAME}"
    echo "(Inside screen, use Ctrl+A then D to detach)"
echo "To attach to client: screen -r ${CLIENT_SCREEN_NAME}"
    echo "(Inside screen, use Ctrl+A then D to detach)"
echo "Node logs are at: ${NODE_LOG_PATH}"

`, actualPublicIp)

	scriptPathOnServer := "/root/setup_massa_services.sh"
	var logBuffer bytes.Buffer

	// Step 1: Create/Update the script on the server using base64 encoding for safety
	logBuffer.WriteString(fmt.Sprintf("Encoding script content and preparing to write to %s...\n", scriptPathOnServer))
	encodedScript := base64.StdEncoding.EncodeToString([]byte(scriptContent))

	// heredoc is generally safer for multiline strings if available and printf is tricky with complex content.
	// However, for SSH commands, directly providing base64 encoded content to `base64 -d` is very robust.
	writeCmd := fmt.Sprintf("echo '%s' | base64 -d > %s", encodedScript, scriptPathOnServer)

	output, err := a.RunCommand(writeCmd)
	// Output from echo | base64 -d > file is usually empty if successful
	if strings.TrimSpace(output) != "" {
		logBuffer.WriteString("Output from script write: " + output + "\n")
	}

	if err != nil {
		errMsg := fmt.Sprintf("Error writing script to server (using base64): %v. Output: %s", err, output)
		logBuffer.WriteString(errMsg + "\n")
		fmt.Println(errMsg)
		return logBuffer.String(), fmt.Errorf("failed to write script: %w", err)
	}
	logBuffer.WriteString(fmt.Sprintf("Successfully wrote script to %s using base64 method.\n", scriptPathOnServer))

	// Step 2: Make the script executable
	logBuffer.WriteString("Making script executable...\n")
	chmodCmd := fmt.Sprintf("chmod +x %s", scriptPathOnServer)
	output, err = a.RunCommand(chmodCmd)
	logBuffer.WriteString(output + "\n")
	if err != nil {
		errMsg := fmt.Sprintf("Error making script executable: %v. Output: %s", err, output)
		logBuffer.WriteString(errMsg + "\n")
		fmt.Println(errMsg)
		return logBuffer.String(), fmt.Errorf("failed to chmod script: %w", err)
	}

	// Step 3: Execute the script
	logBuffer.WriteString(fmt.Sprintf("Executing script: %s with password [REDACTED], IP %s, Force Reinstall %t...\n", scriptPathOnServer, publicIp, forceReinstall))
	// Pass password, IP, and forceReinstall flag as arguments to the script
	forceReinstallStr := "false"
	if forceReinstall {
		forceReinstallStr = "true"
	}
	execCmd := fmt.Sprintf("%s '%s' '%s' '%s'", scriptPathOnServer, nodePassword, publicIp, forceReinstallStr)
	scriptOutput, err := a.RunCommand(execCmd) // This will capture combined stdout/stderr from the script
	logBuffer.WriteString("\n--- Script Execution Output ---\n")
	logBuffer.WriteString(scriptOutput + "\n")
	logBuffer.WriteString("--- End of Script Execution Output ---\n")

	if err != nil {
		// The script uses `set -e`, so any command failure in the script will cause it to exit with an error.
		// `RunCommand` will return this error.
		errMsg := fmt.Sprintf("Script execution failed: %v. Full script log above.", err)
		// No need to print full scriptOutput again here as it's already in logBuffer
		fmt.Println(errMsg)
		// Return the full log buffer and the error
		return logBuffer.String(), fmt.Errorf("script execution reported an error: %w. Check script output for details.", err)
	}

	// Check for success messages from the script output to be more confident, even if err is nil
	if strings.Contains(scriptOutput, "SUCCESS: Massa Node screen session") && strings.Contains(scriptOutput, "SUCCESS: Massa Client screen session") {
		logBuffer.WriteString("\nINFO: Script reported successful start of Node and Client screen sessions.\n")
	} else if strings.Contains(scriptOutput, "ERROR:") { // Generic error check in script output
		logBuffer.WriteString("\nWARN: Script output contains 'ERROR:'. Please review the script log carefully.\n")
		// Decide if this should constitute a Go-level error.
		// For now, if the script itself didn't exit with non-zero (err == nil), we'll pass it as "success" at Go level,
		// but the frontend can parse the log for "ERROR:" or "SUCCESS:"
	}

	finalLog := logBuffer.String()
	fmt.Println("Massa components setup script executed.")
	// fmt.Println(finalLog) // Avoid double printing if caller also prints
	return finalLog, nil // err would be non-nil if script exited with non-zero status
}

// CheckMassaNodeInstallation checks if the Massa node directory exists.
func (a *App) CheckMassaNodeInstallation() (string, error) {
	fmt.Println("CheckMassaNodeInstallation called")
	if a.sshClient == nil {
		return "Error: No active SSH connection.", fmt.Errorf("no active SSH connection")
	}
	installBaseDir := "/root/massa_node"
	expectedNodeDirOnServer := installBaseDir + "/massa/massa-node"
	cmd := fmt.Sprintf("if [ -d \"%s\" ]; then echo 'INSTALLED'; else echo 'NOT_INSTALLED'; fi", expectedNodeDirOnServer)
	output, err := a.RunCommand(cmd)
	trimmedOutput := strings.TrimSpace(output)
	if err != nil {
		if trimmedOutput == "INSTALLED" {
			return "INSTALLED", nil
		}
		if trimmedOutput == "NOT_INSTALLED" {
			return "NOT_INSTALLED", nil
		}
		return fmt.Sprintf("Error checking installation: %v. Output: %s", err, trimmedOutput), err
	}
	if trimmedOutput == "INSTALLED" {
		return "INSTALLED", nil
	}
	if trimmedOutput == "NOT_INSTALLED" {
		return "NOT_INSTALLED", nil
	}
	return fmt.Sprintf("Unexpected output from check: %s", trimmedOutput), fmt.Errorf("unexpected output: %s", trimmedOutput)
}

// GetServerStats retrieves basic server resource information.
func (a *App) GetServerStats() (string, error) {
	fmt.Println("GetServerStats called")
	if a.sshClient == nil {
		return "Error: No active SSH connection.", fmt.Errorf("no active SSH connection")
	}

	var fullOutput strings.Builder
	var lastError error

	// Improved commands for more reliable and better formatted output
	commands := map[string]string{
		"Uptime":    "uptime -p",
		"CPU Usage": "top -bn1 | grep -i 'cpu(s)' | awk '{print $2 + $4 \"%\"}'", // Just the percentage sum
		// Get the RAM info for display purposes
		"RAM Usage": "free -m | awk 'NR==2{printf \"%dMB/%dMB (%.1f%%)\", $3,$2,$3*100.0/$2}'",
		"Disk Root": "df -h / | awk 'NR==2{printf \"%s/%s (%s)\", $3,$2,$5}'", // Human readable format
	}

	serverInfo := map[string]string{}

	for name, cmd := range commands {
		// Run the command silently without logging details to the output
		output, err := a.RunCommand(cmd)
		trimmedOutput := strings.TrimSpace(output)

		if err != nil {
			errMsg := fmt.Sprintf("Error fetching %s: %v", name, err)
			fmt.Println(errMsg) // log to console only
			serverInfo[name] = "Error"
			if lastError == nil {
				lastError = fmt.Errorf("failed to fetch %s: %w", name, err)
			}
		} else {
			// Store the result in our map
			serverInfo[name] = trimmedOutput
		}
	}

	// Format output in a cleaner way for display
	fullOutput.WriteString("=== Server Information ===\n\n")

	if uptime, ok := serverInfo["Uptime"]; ok {
		fullOutput.WriteString(fmt.Sprintf("Server Uptime: %s\n", uptime))
	}

	if cpuUsage, ok := serverInfo["CPU Usage"]; ok {
		fullOutput.WriteString(fmt.Sprintf("CPU Usage: %s\n", cpuUsage))
	}

	if ramUsage, ok := serverInfo["RAM Usage"]; ok {
		fullOutput.WriteString(fmt.Sprintf("RAM Usage: %s\n", ramUsage))
	}

	if diskRoot, ok := serverInfo["Disk Root"]; ok {
		fullOutput.WriteString(fmt.Sprintf("Disk Usage: %s\n", diskRoot))
	}

	// Add a divider
	fullOutput.WriteString("\n=== System Process Information ===\n\n")

	// Get list of running processes by CPU usage
	topProcessesCmd := "ps -eo pid,pcpu,pmem,comm --sort=-pcpu | head -n 6"
	topOutput, topErr := a.RunCommand(topProcessesCmd)
	if topErr == nil {
		fullOutput.WriteString("Top Processes (by CPU):\n")
		fullOutput.WriteString(topOutput)
		fullOutput.WriteString("\n")
	}

	// Get screen sessions
	screenListCmd := "screen -ls"
	screenOutput, screenErr := a.RunCommand(screenListCmd)
	if screenErr == nil && strings.Contains(screenOutput, "Socket") {
		fullOutput.WriteString("Active Screen Sessions:\n")
		fullOutput.WriteString(screenOutput)
	} else {
		fullOutput.WriteString("No active screen sessions found.\n")
	}

	log := fullOutput.String()
	fmt.Println("Server stats fetched.")
	return log, lastError
}

// CheckMassaNodeStatus checks the live status of the Massa node screen session and its logs.
// Returns "RUNNING", "STOPPED_WITH_LOGS", "STOPPED_NO_LOGS", "NOT_INSTALLED", or an error string.
func (a *App) CheckMassaNodeStatus() (string, error) {
	fmt.Println("CheckMassaNodeStatus called")
	if a.sshClient == nil {
		return "Error: No active SSH connection.", fmt.Errorf("no active SSH connection")
	}

	installBaseDir := "/root/massa_node"
	expectedNodeDir := installBaseDir + "/massa/massa-node"
	nodeLogPath := expectedNodeDir + "/logs.txt"
	nodeScreenName := "massa_node"

	// 1. Check if the base installation directory and massa-node executable exist
	checkInstallCmd := fmt.Sprintf("if [ -d \"%s\" ] && [ -f \"%s/massa-node\" ]; then echo 'INSTALLED_EXE_FOUND'; else echo 'NOT_INSTALLED_OR_EXE_MISSING'; fi", expectedNodeDir, expectedNodeDir)
	installStatusOutput, err := a.RunCommand(checkInstallCmd)
	trimmedInstallStatus := strings.TrimSpace(installStatusOutput)

	if err != nil {
		// If the command itself failed, it might be a connection issue or deeper problem.
		// However, if the output indicates not installed, we trust that.
		if trimmedInstallStatus == "NOT_INSTALLED_OR_EXE_MISSING" {
			fmt.Println("Node not installed or executable missing (based on error path).")
			return "NOT_INSTALLED", nil
		}
		return fmt.Sprintf("Error checking installation presence: %v. Output: %s", err, trimmedInstallStatus), err
	}

	if trimmedInstallStatus == "NOT_INSTALLED_OR_EXE_MISSING" {
		fmt.Println("Node not installed or executable missing.")
		return "NOT_INSTALLED", nil
	}

	// 2. Check if the screen session is running
	// The grep command will have an exit status of 0 if found, 1 if not found.
	// For simple screen names without spaces, direct injection is usually fine.
	// If screen names could have spaces or special characters, using sh -c "grep 'name'" would be more robust.
	checkScreenCmd := fmt.Sprintf("screen -list | grep -q %s", nodeScreenName)
	screenOutput, screenErr := a.RunCommand(checkScreenCmd)

	isScreenRunning := false
	if screenErr == nil {
		// Exit status 0 means grep found the screen session
		isScreenRunning = true
		fmt.Printf("Screen session '%s' is running. Output: %s\n", nodeScreenName, screenOutput)
	} else {
		// Exit status non-zero from grep means not found (or other error, but usually not found)
		fmt.Printf("Screen session '%s' not found or grep error. Error: %v, Output: %s\n", nodeScreenName, screenErr, screenOutput)
	}

	// 3. Check the log file (even if screen is not running, logs might indicate past activity or recent crash)
	checkLogCmd := fmt.Sprintf("if [ -f \"%s\" ] && [ -s \"%s\" ]; then echo 'LOG_EXISTS_AND_NOT_EMPTY'; elif [ -f \"%s\" ]; then echo 'LOG_EXISTS_BUT_EMPTY'; else echo 'LOG_NOT_FOUND'; fi", nodeLogPath, nodeLogPath, nodeLogPath)
	logStatusOutput, logErr := a.RunCommand(checkLogCmd)
	trimmedLogStatus := strings.TrimSpace(logStatusOutput)

	if logErr != nil {
		// This is an error in the command to check the log, not necessarily that the log doesn't exist.
		// However, we can still try to infer based on the screen status.
		fmt.Printf("Error checking log status: %v. Output: %s\n", logErr, trimmedLogStatus)
		if isScreenRunning {
			// If screen is running but we can't check logs, it's odd. Report as running but with log issue.
			return "RUNNING_LOG_CHECK_ERROR", nil
		}
		// If screen not running and log check failed, be cautious.
		return "STOPPED_LOG_CHECK_ERROR", nil
	}

	if isScreenRunning {
		// If screen is running, the primary status is RUNNING. Log status is secondary.
		return "RUNNING", nil
	}

	// Screen is not running at this point. Determine status based on logs.
	switch trimmedLogStatus {
	case "LOG_EXISTS_AND_NOT_EMPTY":
		fmt.Println("Screen not running, but log file exists and is not empty.")
		return "STOPPED_WITH_LOGS", nil
	case "LOG_EXISTS_BUT_EMPTY":
		fmt.Println("Screen not running, and log file exists but is empty.")
		return "STOPPED_EMPTY_LOG", nil
	case "LOG_NOT_FOUND":
		fmt.Println("Screen not running, and log file not found.")
		return "STOPPED_NO_LOGS", nil // This might also imply it was never run or cleaned.
	default:
		fmt.Printf("Screen not running, and unexpected log status: %s\n", trimmedLogStatus)
		return "STOPPED_UNKNOWN_LOG_STATUS", nil
	}
}

// StartMassaNode starts the Massa node when it's installed but not running
func (a *App) StartMassaNode(nodePassword string) (string, error) {
	fmt.Println("StartMassaNode called")
	if a.sshClient == nil {
		return "Error: No active SSH connection.", fmt.Errorf("no active SSH connection")
	}

	if nodePassword == "" {
		return "Error: Node password is required to start Massa node.", fmt.Errorf("node password is required")
	}

	// Save the node password for future use with massa-client
	a.nodePassword = nodePassword

	// Define paths and screen names
	installBaseDir := "/root/massa_node"
	expectedNodeDir := installBaseDir + "/massa/massa-node"
	expectedClientDir := installBaseDir + "/massa/massa-client"
	nodeLogPath := expectedNodeDir + "/logs.txt"
	nodeScreenName := "massa_node"
	clientScreenName := "massa_client"

	// Check if node is installed first
	checkInstallCmd := fmt.Sprintf("if [ -d \"%s\" ] && [ -f \"%s/massa-node\" ]; then echo 'INSTALLED'; else echo 'NOT_INSTALLED'; fi", expectedNodeDir, expectedNodeDir)
	installStatusOutput, err := a.RunCommand(checkInstallCmd)
	trimmedInstallStatus := strings.TrimSpace(installStatusOutput)

	if err != nil || trimmedInstallStatus != "INSTALLED" {
		return "Error: Massa node is not installed or executable missing. Please install it first.", fmt.Errorf("node not installed")
	}

	var logBuffer strings.Builder
	logBuffer.WriteString("Starting Massa node...\n")

	// Check if screens are already running
	checkNodeScreenCmd := fmt.Sprintf("screen -list | grep -q %s", nodeScreenName)
	_, nodeScreenErr := a.RunCommand(checkNodeScreenCmd)

	if nodeScreenErr == nil {
		logBuffer.WriteString("Massa node screen is already running. No need to start.\n")
		return logBuffer.String(), nil
	}

	// Ensure the node executable is executable
	chmodCmd := fmt.Sprintf("chmod +x %s/massa-node", expectedNodeDir)
	_, chmodErr := a.RunCommand(chmodCmd)
	if chmodErr != nil {
		errMsg := fmt.Sprintf("Failed to make node executable: %v", chmodErr)
		logBuffer.WriteString(errMsg + "\n")
		return logBuffer.String(), fmt.Errorf(errMsg)
	}

	// Create log directory and clear old log if it exists
	rmLogCmd := fmt.Sprintf("rm -f %s && touch %s", nodeLogPath, nodeLogPath)
	_, rmLogErr := a.RunCommand(rmLogCmd)
	if rmLogErr != nil {
		logBuffer.WriteString(fmt.Sprintf("Warning: Failed to clear old log file: %v\n", rmLogErr))
	}

	// Start Massa Node in a screen session
	nodeStartCmd := fmt.Sprintf("cd '%s' && screen -dmS %s /bin/bash -c './massa-node -p \"%s\" |& tee \"%s\"'",
		expectedNodeDir, nodeScreenName, nodePassword, nodeLogPath)
	_, nodeStartErr := a.RunCommand(nodeStartCmd)

	if nodeStartErr != nil {
		errMsg := fmt.Sprintf("Failed to start Massa node: %v", nodeStartErr)
		logBuffer.WriteString(errMsg + "\n")
		return logBuffer.String(), fmt.Errorf(errMsg)
	}

	logBuffer.WriteString("Massa node screen started. Waiting to verify...\n")

	// Wait a few seconds before checking
	time.Sleep(5 * time.Second)

	// Verify node screen is running
	_, nodeCheckErr := a.RunCommand(checkNodeScreenCmd)
	if nodeCheckErr != nil {
		logBuffer.WriteString("Warning: Could not verify node screen is running after start attempt.\n")
	} else {
		logBuffer.WriteString("Confirmed: Massa node screen is running.\n")
	}

	// Also start the client if available
	checkClientExeCmd := fmt.Sprintf("if [ -f \"%s/massa-client\" ]; then echo 'CLIENT_FOUND'; else echo 'CLIENT_NOT_FOUND'; fi", expectedClientDir)
	clientExeOutput, _ := a.RunCommand(checkClientExeCmd)
	trimmedClientExe := strings.TrimSpace(clientExeOutput)

	if trimmedClientExe == "CLIENT_FOUND" {
		logBuffer.WriteString("Massa client found. Attempting to start client screen...\n")

		// Check if client screen is already running
		checkClientScreenCmd := fmt.Sprintf("screen -list | grep -q %s", clientScreenName)
		_, clientScreenErr := a.RunCommand(checkClientScreenCmd)

		if clientScreenErr == nil {
			logBuffer.WriteString("Massa client screen is already running.\n")
		} else {
			// Make client executable
			chmodClientCmd := fmt.Sprintf("chmod +x %s/massa-client", expectedClientDir)
			_, chmodClientErr := a.RunCommand(chmodClientCmd)
			if chmodClientErr != nil {
				logBuffer.WriteString(fmt.Sprintf("Warning: Failed to make client executable: %v\n", chmodClientErr))
			}

			// Start client screen
			clientStartCmd := fmt.Sprintf("cd '%s' && screen -dmS %s /bin/bash -c './massa-client -p \"%s\"'",
				expectedClientDir, clientScreenName, nodePassword)
			_, clientStartErr := a.RunCommand(clientStartCmd)

			if clientStartErr != nil {
				logBuffer.WriteString(fmt.Sprintf("Warning: Failed to start Massa client: %v\n", clientStartErr))
			} else {
				logBuffer.WriteString("Massa client screen started.\n")
			}
		}
	} else {
		logBuffer.WriteString("Massa client executable not found. Only node was started.\n")
	}

	logBuffer.WriteString("\nMassa node startup complete.\n")
	logBuffer.WriteString("To check screens: screen -ls\n")
	logBuffer.WriteString("To attach to node: screen -r " + nodeScreenName + "\n")
	logBuffer.WriteString("To attach to client: screen -r " + clientScreenName + "\n")
	logBuffer.WriteString("Node logs are at: " + nodeLogPath + "\n")

	return logBuffer.String(), nil
}

// GetMassaNodeLogs fetches the logs from the massa_node screen session.
func (a *App) GetMassaNodeLogs() (string, error) {
	fmt.Println("Fetching Massa node logs...")
	if a.sshClient == nil {
		errMsg := "Error: No active SSH connection."
		fmt.Println(errMsg)
		return errMsg, fmt.Errorf(errMsg)
	}

	// Command to get the most recent logs from the massa_node screen session
	// We use "screen -S massa_node -X hardcopy /tmp/massa_node_logs.txt" to create a snapshot of the screen
	// and then read the file content
	command := `
if screen -list | grep -q "massa_node"; then
  # Create a snapshot of the screen content
  screen -S massa_node -X hardcopy /tmp/massa_node_logs.txt
  # Give it a moment to write the file
  sleep 0.5
  # Check if the file exists
  if [ -f /tmp/massa_node_logs.txt ]; then
    # Get the last 500 lines (adjust as needed)
    tail -n 500 /tmp/massa_node_logs.txt
    # Clean up
    rm /tmp/massa_node_logs.txt
  else
    echo "Error: Failed to create logs snapshot."
  fi
else
  echo "Massa node screen session not found."
fi
`

	session, err := a.sshClient.NewSession()
	if err != nil {
		errMsg := fmt.Sprintf("Failed to create session: %v", err)
		fmt.Println(errMsg)
		return errMsg, err
	}
	defer session.Close()

	var stdoutBuf bytes.Buffer
	var stderrBuf bytes.Buffer
	session.Stdout = &stdoutBuf
	session.Stderr = &stderrBuf

	err = session.Run(command)
	stdoutStr := stdoutBuf.String()
	stderrStr := stderrBuf.String()

	// Combine stdout and stderr for the primary output
	combinedOutput := stdoutStr
	if stderrStr != "" {
		if combinedOutput != "" && !strings.HasSuffix(combinedOutput, "\n") {
			combinedOutput += "\n"
		}
		combinedOutput += stderrStr
	}

	if err != nil {
		fmt.Printf("Error fetching Massa node logs: %v\nStdout:\n%s\nStderr:\n%s\n", err, stdoutStr, stderrStr)
		return strings.TrimSpace(combinedOutput), err
	}

	fmt.Println("Successfully fetched Massa node logs")
	return strings.TrimSpace(combinedOutput), nil
}

// GetWalletInfo retrieves wallet information from the Massa client
func (a *App) GetWalletInfo() (string, error) {
	fmt.Println("Getting wallet information...")
	return a.RunMassaClientCommand("wallet_info")
}

// GenerateWalletKey generates a new wallet key in the Massa client
func (a *App) GenerateWalletKey() (string, error) {
	fmt.Println("Generating new wallet key...")
	return a.RunMassaClientCommand("wallet_generate_secret_key")
}

// ImportWalletKey imports a wallet key into the Massa client
func (a *App) ImportWalletKey(secretKey string) (string, error) {
	fmt.Println("Importing wallet key...")
	return a.RunMassaClientCommand("wallet_add_secret_keys " + secretKey)
}

// GetAddressPublicKey gets the public key for specified addresses
func (a *App) GetAddressPublicKey(address string) (string, error) {
	fmt.Println("Getting public key for address:", address)
	return a.RunMassaClientCommand("wallet_get_public_key " + address)
}

// BuyRolls buys rolls (stake) for a wallet address
func (a *App) BuyRolls(address string, rollCount int, fee float64) (string, error) {
	fmt.Printf("Buying %d rolls for address %s with fee %f\n", rollCount, address, fee)
	cmd := fmt.Sprintf("buy_rolls %s %d %f", address, rollCount, fee)
	return a.RunMassaClientCommand(cmd)
}

// SellRolls sells rolls (unstake) for a wallet address
func (a *App) SellRolls(address string, rollCount int, fee float64) (string, error) {
	fmt.Printf("Selling %d rolls for address %s with fee %f\n", rollCount, address, fee)
	cmd := fmt.Sprintf("sell_rolls %s %d %f", address, rollCount, fee)
	return a.RunMassaClientCommand(cmd)
}

// StartStaking starts staking with a wallet address
func (a *App) StartStaking(address string) (string, error) {
	fmt.Println("Starting staking with address:", address)
	return a.RunMassaClientCommand("node_start_staking " + address)
}

// RunMassaClientCommand runs a command in the Massa client with a more reliable approach
func (a *App) RunMassaClientCommand(command string) (string, error) {
	if a.sshClient == nil {
		return "Error: No active SSH connection.", fmt.Errorf("no active SSH connection")
	}

	// Find the massa-client directory
	findClientDirCmd := "find /root/massa_node/massa -name massa-client -type d 2>/dev/null"
	clientDirOutput, err := a.RunCommand(findClientDirCmd)
	if err != nil || clientDirOutput == "" {
		return "Error: Could not find massa-client directory.", fmt.Errorf("massa-client directory not found")
	}

	// Trim any whitespace from the directory path
	clientDir := strings.TrimSpace(clientDirOutput)
	fmt.Printf("Found massa-client directory: %s\n", clientDir)

	// Create a temporary script to execute the command and capture its output
	scriptContent := fmt.Sprintf(`#!/bin/bash
cd "%s"
PASSWORD="%s"
COMMAND="%s"

# Execute massa-client command and capture output
./massa-client -p "$PASSWORD" <<EOF | tee /tmp/massa_client_result.txt
$COMMAND
exit
EOF

cat /tmp/massa_client_result.txt
`, clientDir, a.nodePassword, command)

	// Create a temporary script file
	scriptPath := "/tmp/run_massa_client.sh"
	createScriptCmd := fmt.Sprintf("cat > %s << 'EOFSCRIPT'\n%s\nEOFSCRIPT", scriptPath, scriptContent)
	_, err = a.RunCommand(createScriptCmd)
	if err != nil {
		return fmt.Sprintf("Error creating temporary script: %v", err), err
	}

	// Make script executable
	_, err = a.RunCommand(fmt.Sprintf("chmod +x %s", scriptPath))
	if err != nil {
		return fmt.Sprintf("Error making script executable: %v", err), err
	}

	// Execute the script
	output, err := a.RunCommand(scriptPath)

	// Clean up the script
	a.RunCommand(fmt.Sprintf("rm -f %s /tmp/massa_client_result.txt", scriptPath))

	if err != nil {
		return fmt.Sprintf("Error executing massa-client command: %v\nOutput: %s", err, output), err
	}

	// Process output to extract the command results
	// Typically massa-client will show a prompt at the beginning and possibly at the end
	lines := strings.Split(output, "\n")
	var resultLines []string
	inResultSection := false

	for _, line := range lines {
		// Skip prompt/header lines
		if strings.Contains(line, "Enter password:") ||
			strings.Contains(line, "wallet_info") ||
			strings.Contains(line, "wallet_generate_secret_key") ||
			strings.Contains(line, "wallet_add_secret_keys") ||
			strings.Contains(line, "buy_rolls") ||
			strings.Contains(line, "sell_rolls") ||
			strings.Contains(line, "node_start_staking") {
			inResultSection = true
			continue
		}

		// Skip exit command line
		if strings.Contains(line, "exit") {
			inResultSection = false
			continue
		}

		if inResultSection {
			resultLines = append(resultLines, line)
		}
	}

	return strings.Join(resultLines, "\n"), nil
}

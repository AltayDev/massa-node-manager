package main

import (
	"bytes"
	"context"
	"fmt"
	"time"

	"golang.org/x/crypto/ssh"
)

// App struct
type App struct {
	ctx       context.Context
	sshClient *ssh.Client // Aktif SSH bağlantısını tutar
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
	a.sshClient = nil // Set to nil regardless of close error
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

	if err != nil {
		output := fmt.Sprintf("Error running command '%s': %v\nStdout:\n%s\nStderr:\n%s", command, err, stdoutStr, stderrStr)
		fmt.Println(output)
		return output, fmt.Errorf("command '%s' failed: %w. Stderr: %s", command, err, stderrStr)
	}

	output := fmt.Sprintf("Stdout:\n%s\nStderr:\n%s", stdoutStr, stderrStr)
	fmt.Println(output)
	return output, nil
}

// InstallMassaNode creates a test file on the server.
func (a *App) InstallMassaNode(nodePassword string, publicIp string) (string, error) {
	fmt.Printf("InstallMassaNode called. Node Password: [REDACTED], Public IP: %s\n", publicIp)

	if a.sshClient == nil {
		errMsg := "Error: No active SSH connection to run installation commands."
		fmt.Println(errMsg)
		return errMsg, fmt.Errorf(errMsg)
	}

	logMsg := "Attempting to create a test file on the server...\n"

	fileName := "test_massa_node_installation.txt"
	fileContent := fmt.Sprintf("Massa Node installation initiated at %s with Public IP %s", time.Now().Format(time.RFC3339), publicIp)

	// Command to create the file and append content. This will create the file if it doesn't exist, or append if it does.
	// Using double quotes for the shell command and single quotes for the content to avoid issues with spaces in content.
	testFileCommand := fmt.Sprintf("echo '%s' > %s", fileContent, fileName) // Overwrite file

	output, err := a.RunCommand(testFileCommand)
	if err != nil {
		logMsg += fmt.Sprintf("Error creating test file '%s': %v\nOutput from server: %s\n", fileName, err, output)
		fmt.Println(logMsg)
		return logMsg, err
	}
	logMsg += fmt.Sprintf("Successfully created/updated test file '%s' on the server.\nContent: %s\nOutput from server: %s\n", fileName, fileContent, output)

	fmt.Println(logMsg)
	return logMsg, nil
}

import json
import subprocess
import sys

def call_mcp_tool(binary_path, args, method, arguments):
    process = subprocess.Popen(
        [binary_path] + args,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Step 1: Initialize
    init_request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "antigravity-checker", "version": "1.0.0"}
        }
    }
    process.stdin.write(json.dumps(init_request) + "\n")
    process.stdin.flush()
    process.stdout.readline() # Read init response
    
    # Step 2: Call Tool
    tool_request = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": method,
            "arguments": arguments
        }
    }
    process.stdin.write(json.dumps(tool_request) + "\n")
    process.stdin.flush()
    
    # Read response
    response = process.stdout.readline()
    print(f"Tool {method} Response:", response)
    
    process.terminate()

if __name__ == "__main__":
    call_mcp_tool(
        "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64", 
        ["--app", "desktop"],
        "get_editor_state",
        {"include_schema": True}
    )

import json
import subprocess
import sys

def call_mcp_list_tools(binary_path):
    process = subprocess.Popen(
        [binary_path, "--app", "antigravity"],
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
    
    # Read response
    response = process.stdout.readline()
    print("Init Response:", response)
    
    # Step 2: List Tools
    list_request = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "list_tools",
        "params": {}
    }
    process.stdin.write(json.dumps(list_request) + "\n")
    process.stdin.flush()
    
    # Read response
    response = process.stdout.readline()
    print("List Tools Response:", response)
    
    process.terminate()

if __name__ == "__main__":
    call_mcp_list_tools("/Users/kimhansol/.pencil/mcp/antigravity/out/mcp-server-darwin-arm64")

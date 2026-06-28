#!/usr/bin/env python3
import os
import subprocess
import sys
import signal
import re

PORTS = [80, 5173, 8000, 6379, 5100, 9000, 10100, 9100, 10200]
SERVICES = [
    "hrms-nginx-server", "hrms-frontend", "hrms-auth-service", "hrms-redis",
    "hrms-auth-grpc-service", "hrms-book-service", "hrms-book-grpc-service",
    "hrms-borrow-service", "hrms-borrow-grpc-service"
]

def run_command(cmd):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return res.stdout.strip(), res.returncode
    except Exception as e:
        return "", -1

def clean_docker():
    print("🐳 Checking for conflicting Docker containers across all contexts...")
    stdout, code = run_command("docker context ls --format '{{.Name}}'")
    if code == 0:
        contexts = [c.strip() for c in stdout.split("\n") if c.strip()]
        for ctx in contexts:
            # List all running containers in this context
            stdout_ps, code_ps = run_command("docker --context " + ctx + " ps --format '{{.Names}}'")
            if code_ps == 0:
                running_containers = [name.strip() for name in stdout_ps.split("\n") if name.strip()]
                for container in running_containers:
                    if container in SERVICES:
                        print(f"🛑 Found active container '{container}' in context '{ctx}'. Stopping and removing...")
                        run_command("docker --context " + ctx + " stop " + container)
                        run_command("docker --context " + ctx + " rm " + container)
    print("✅ Docker cleanup check complete.")

def kill_processes():
    print("⚡ Checking for processes blocking ports: " + ", ".join(map(str, PORTS)))
    for port in PORTS:
        pids_to_kill = set()
        
        # Method 1: Using lsof
        stdout, code = run_command(f"lsof -t -i:{port}")
        if code == 0 and stdout:
            for pid in stdout.split("\n"):
                if pid.strip():
                    pids_to_kill.add(int(pid.strip()))
                    
        # Method 2: Using ss
        stdout_ss, code_ss = run_command(f"ss -tulpn | grep :{port}")
        if code_ss == 0 and stdout_ss:
            matches = re.findall(r"pid=(\d+)", stdout_ss)
            for m in matches:
                pids_to_kill.add(int(m))
                
        # Method 3: Using fuser as fallback
        stdout_fu, code_fu = run_command(f"fuser {port}/tcp 2>/dev/null")
        if code_fu == 0 and stdout_fu:
            for pid in stdout_fu.strip().split():
                if pid.strip().isdigit():
                    pids_to_kill.add(int(pid.strip()))

        # Filter out self
        my_pid = os.getpid()
        pids_to_kill = {pid for pid in pids_to_kill if pid != my_pid}

        if pids_to_kill:
            print(f"⚠️ Port {port} is blocked by PIDs: {list(pids_to_kill)}")
            for pid in pids_to_kill:
                try:
                    # Get process info
                    proc_info, _ = run_command(f"ps -p {pid} -o comm=")
                    proc_name = proc_info.strip() or "Unknown"
                    print(f"   Killing PID {pid} ({proc_name})...")
                    os.kill(pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                except PermissionError:
                    print(f"   ❌ Permission denied to kill PID {pid}. Try running script with sudo.")
        else:
            print(f"✅ Port {port} is free.")

if __name__ == "__main__":
    if os.geteuid() != 0:
        print("ℹ️ Script is not running as root. Some processes owned by other users might not be visible or killable.\n")
    
    clean_docker()
    kill_processes()
    print("\n🚀 System is ready for 'docker compose up'!")

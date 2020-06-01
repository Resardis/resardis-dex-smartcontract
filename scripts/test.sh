#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

# Ports
ganache_port=8545

cleanup() {
    # Kill the ganache instance that we started (if we started one and if it's still running).
    if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
        kill -9 $ganache_pid
        echo "Killed ganache instance (pid=$ganache_pid)"
    fi

    echo "Cleaning Truffle Builds"
    rm -rf build
}

# Checks if a port is already in use
port_occupied() {
    nc -z localhost $1
}

start_ganache() {
    # Run client as a background job
    # Send standard output to void/null file
    node_modules/.bin/ganache-cli --port "$ganache_port" --host "127.0.0.1" > /dev/null &
    # Get the process ID of the last background process
    ganache_pid=$!
    sleep 3s  # Wait until ganache fully fires up
}

# Exit if these ports are in use
if port_occupied $ganache_port; then
    echo "Ganache port $ganache_port already in use"
    exit 1
fi


echo "Starting a new ganache instance"
start_ganache

# echo "Deploying to ganache"
# node_modules/.bin/truffle migrate --reset --network ganache_local

# Feed command line options to truffle test
node_modules/.bin/truffle test "$@"

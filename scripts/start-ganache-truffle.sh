#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

# Paths
BUILD_DIR="build"

# Ports
GANACHE_PORT=8545

echo "Cleaning Old Truffle Builds"
rm -rf $BUILD_DIR

cleanup() {
    # Kill the ganache instance that we started (if we started one and if it's still running).
    if [ -n "$GANACHE_PID" ] && ps -p $GANACHE_PID > /dev/null; then
        kill -9 $GANACHE_PID
        echo "Killed ganache instance (pid=$GANACHE_PID)"
    fi

    echo "Cleaning Truffle Builds"
    rm -rf $BUILD_DIR
}

# Checks if a port is already in use
port_occupied() {
    nc -z localhost $1
}

start_ganache() {
    # Run client as a background job
    # Send standard output to void/null file
    node_modules/.bin/ganache-cli --port "$GANACHE_PORT" --host "127.0.0.1" > /dev/null &
    # Get the process ID of the last background process
    GANACHE_PID=$!
    sleep 3s  # Wait until ganache fully fires up
}

# Exit if these ports are in use
if port_occupied $GANACHE_PORT; then
    echo "Ganache port $GANACHE_PORT already in use"
    exit 1
fi


echo "Starting a new ganache instance"
start_ganache

# Feed command line options to truffle
node_modules/.bin/truffle "$@"

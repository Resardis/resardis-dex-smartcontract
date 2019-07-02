#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

# Ports
ganache_port=8545
dappchain_port=46658

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
    echo "Killed ganache instance (pid=$ganache_pid)"
  fi
  # Kill the loom instance
  if [ -n "$loom_pid" ] && ps -p $loom_pid > /dev/null; then
    kill -9 $loom_pid
    sleep 3s  # loom takes a bit time to be killed
    echo "Killed loom instance (pid=$loom_pid)"
  fi

  echo "Cleaning loom binary and keys"
  rm -rf loom loom_local_private_key loom_local_public_key

  echo "Cleaning DAppChain"
  rm -rf genesis.json app.db chaindata

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

gen_keys_loom() {
  ./loom genkey -k loom_local_private_key -a loom_local_public_key
}

start_loom() {
  ./loom init -f
  sleep 5s  # Wait until loom fully fires up
  ./loom reset
  ./loom run > /dev/null 2>&1 &
  loom_pid=$!
  sleep 15s
}

if grep -i Microsoft /proc/version > /dev/null 2>&1; then
  platform=linux
elif grep -iE "ubuntu|debian|centos" /proc/version > /dev/null 2>&1; then
  platform=linux
elif uname | grep -i darwin > /dev/null 2>&1; then
  platform=osx
else
  echo "Unable to detect OS..."
  exit 1
fi

echo "Downloading loom executable..."
if \which curl > /dev/null 2>&1; then
  download_command="curl -sL -o"
elif \which wget > /dev/null 2>&1; then
  download_command="wget -q -O"
fi

$download_command loom https://private.delegatecall.com/loom/${platform}/stable/loom
echo "Loom binary downloaded"
chmod +x loom
./loom version

# Exit if these ports are in use
if port_occupied $ganache_port; then
  echo "Ganache port $ganache_port already in use"
  exit 1
fi

if port_occupied $dappchain_port; then
  echo "DAppChain port $dappchain_port already in use"
  exit 1
fi

echo "Generating loom keys"
gen_keys_loom

echo "Starting a new ganache instance"
start_ganache

# echo "Deploying to ganache"
# node_modules/.bin/truffle migrate --reset --network ganache_local

echo "Starting loom"
start_loom

# echo "Deploying to loom"
# node_modules/.bin/truffle migrate --reset --network loom_local

# Feed command line options to truffle test
node_modules/.bin/truffle test "$@"

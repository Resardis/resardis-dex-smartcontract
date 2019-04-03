#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

ganache_port=9545

ganache_running() {
  nc -z localhost "$ganache_port"
}

start_ganache() {
  # Run client as a background job
  # Send standard output to void/null file
  node_modules/.bin/ganache-cli --port "$ganache_port" --host "127.0.0.1" > /dev/null &
  # Get the process ID of the last background process
  ganache_pid=$!
}

if ganache_running; then
  echo "Ganache port is in use"
  echo "If it is another program using the same port, please close it"
  echo "Assuming it is ganache, using existing ganache instance"
else
  echo "Starting a new ganache instance"
  start_ganache
fi

# Feed command line options to truffle test
node_modules/.bin/truffle test "$@"

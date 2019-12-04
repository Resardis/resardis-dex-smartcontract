#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

LOOM_BIN_NAME="loom"
LOOM_BIN_PATH="./$LOOM_BIN_NAME"

if [ ! -f "$LOOM_BIN_PATH" ]
then
    echo "Loom binary does not exist."
    if grep -i Microsoft /proc/version > /dev/null 2>&1; then
        PLATFORM=linux
    elif grep -iE "ubuntu|debian|centos" /proc/version > /dev/null 2>&1; then
        PLATFORM=linux
    elif uname | grep -i darwin > /dev/null 2>&1; then
        PLATFORM=osx
    else
        echo "Unable to detect OS..."
        exit 1
    fi

    echo "Downloading loom executable..."
    if \which curl > /dev/null 2>&1; then
        DOWNLOAD_COMMAND="curl -sL -o"
    elif \which wget > /dev/null 2>&1; then
        DOWNLOAD_COMMAND="wget -q -O"
    fi

    $DOWNLOAD_COMMAND "$LOOM_BIN_NAME" https://private.delegatecall.com/loom/${PLATFORM}/stable/loom
    echo "Loom binary downloaded"
    chmod +x "$LOOM_BIN_PATH"
    "$LOOM_BIN_PATH" version
elif [ -f "$LOOM_BIN_PATH" ] && [ ! -x "$LOOM_BIN_PATH" ]
then
    echo "Loom binary exists w/o an executable bit."
    echo "Setting an executable bit on the loom binary"
    chmod +x "$LOOM_BIN_PATH"
    "$LOOM_BIN_PATH" version
else
    echo "Loom bin already exists, but might not be the latest stable release."
fi

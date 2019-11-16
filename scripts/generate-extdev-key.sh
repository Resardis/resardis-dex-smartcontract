#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

PRIVATE_FOLDER="./private" # add to gitignore
LOOM_BIN_NAME="loom"
LOOM_BIN_PATH="./$LOOM_BIN_NAME"
EXTDEV_PRIVKEY_NAME="loom_extdev_private_key"
EXTDEV_PRIVKEY_PATH="$PRIVATE_FOLDER/$EXTDEV_PRIVKEY_NAME"
EXTDEV_PUBKEY_NAME="loom_extdev_public_key"
EXTDEV_PUBKEY_PATH="$PRIVATE_FOLDER/$EXTDEV_PUBKEY_NAME"

if [ ! -d "$PRIVATE_FOLDER" ]
then
    echo "Creating private directory"
    mkdir "$PRIVATE_FOLDER"
else
    echo "Private directory already exists"
fi

if [ -f "$LOOM_BIN_PATH" ]
then
    chmod +x "$LOOM_BIN_PATH"
    "$LOOM_BIN_PATH" genkey -k "$EXTDEV_PRIVKEY_PATH" -a "$EXTDEV_PUBKEY_PATH"
else
    echo "Loom bin does not exist at the specified path"
    exit 1
fi

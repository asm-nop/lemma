#!/usr/bin/env sh

# Default values for host, port, and chain id
HOST="127.0.0.1"
PORT="8545"
CHAIN_ID="31337"
CONTRACT="Lemma"

# Start Anvil in the background
anvil --chain-id ${CHAIN_ID} --block-time 2 --host ${HOST} --port ${PORT} &

ANVIL_PID=$!
export ETH_WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Create contract
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast

# Wait for anvil to finish
wait $ANVIL_PID

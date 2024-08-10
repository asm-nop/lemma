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

PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 # Private key of theorem creator
EA=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 # Expected address
SIG='createChallenge(string,uint256,uint256)'

TS=$(( $(date +%s) + 172800 ))

cast send --private-key $PK $EA $SIG "another challenge" $TS 10
cast send --private-key $PK $EA $SIG "yet another challenge" $TS 20
cast send --private-key $PK $EA $SIG "my special challenge" $TS 120

# Wait for anvil to finish
wait $ANVIL_PID

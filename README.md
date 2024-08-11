![Header](marketing/cover.png)

**Lemma** is a ZK theorem proving framework that enables individuals to post unsolved theorem definitions accompanied by a bounty for anyone that can submit a valid Mathematical proof which solves the theorem. These proofs are validated on chain, and the bounties are trustlessly released to the solver.

## Overview

This project includes the following components:

- **Smart Contracts:**

  - Can be deployed on any EVM compatible chain
  - Responsible for theorem submission, verification, and bounty payout

- **Relay:**

  - Relays proof generation requests to bonsai
  - Bonsai y u no cors ლ(ಠ_ಠლ)

- **Frontend:**

  - Responsible for interaction with smart contracts
  - Generates proving requests and submits them to the relay

- **Risc0 Proost Validation Circuit:**
  - Parses valid `Proost` syntax
  - Runs the theorem against the solution and asserts validity
- **Risc0 Bonsai:**
  - Integrates with Bonsai, Risc0's ZK CoProcessor

## Showcase

![Market](marketing/screenshots/market.png)
![Submit Bounty](marketing/screenshots/submit_bounty.png)
![Submit Proof](marketing/screenshots/submit_proof.png)

## Dependencies

First, [install Rust] and [Foundry], and then restart your terminal.

```sh
# Install Rust
curl https://sh.rustup.rs -sSf | sh
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
```

Next, you will need to install the `cargo risczero` tool.
We'll use [`cargo binstall`][cargo-binstall] to get `cargo-risczero` installed, and then install the `risc0` toolchain.
See [RISC Zero installation] for more details.

```sh
cargo install cargo-binstall
cargo binstall cargo-risczero
cargo risczero install
```

Now you have all the tools you need to develop and deploy an application with [RISC Zero].

## Quick Start

### Build the Code

- Builds for zkVM program, the publisher app, and any other Rust code.

  ```sh
  cargo build
  ```

- Build your Solidity smart contracts

  > NOTE: `cargo build` needs to run first to generate the `ImageID.sol` contract.

  ```sh
  forge build
  ```

### Run the Tests

```sh
cargo test
```

- Test the Solidity contracts, integrated with the zkVM program.

  ```sh
  RISC0_DEV_MODE=true forge test -vvv
  ```

- Run the same tests, with the full zkVM prover rather than dev-mode, by setting `RISC0_DEV_MODE=false`.

  ```sh
  RISC0_DEV_MODE=false forge test -vvv
  ```

  Producing the [Groth16 SNARK proofs][Groth16] for this test requires running on an x86 machine with [Docker] installed, or using [Bonsai](#configuring-bonsai). Apple silicon is currently unsupported for local proving, you can find out more info in the relevant issues [here](https://github.com/risc0/risc0/issues/1520) and [here](https://github.com/risc0/risc0/issues/1749).

### Configuring Bonsai

**_Note:_** _To request an API key [complete the form here](https://bonsai.xyz/apply)._

With the Bonsai proving service, you can produce a [Groth16 SNARK proof][Groth16] that is verifiable on-chain.
You can get started by setting the following environment variables with your API key and associated URL.

```bash
export BONSAI_API_KEY="YOUR_API_KEY" # see form linked above
export BONSAI_API_URL="BONSAI_URL" # provided with your api key
```

Now if you run `forge test` with `RISC0_DEV_MODE=false`, the test will run as before, but will additionally use the fully verifying `RiscZeroGroth16Verifier` contract instead of `MockRiscZeroVerifier` and will request a SNARK receipt from Bonsai.

```bash
RISC0_DEV_MODE=false forge test -vvv
```

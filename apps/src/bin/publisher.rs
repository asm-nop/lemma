// Copyright 2024 RISC Zero, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This application demonstrates how to send an off-chain proof request
// to the Bonsai proving service and publish the received proofs directly
// to your deployed app contract.

use alloy_primitives::{Address, U256};
use alloy_sol_types::{sol, SolInterface, SolValue};
use anyhow::{Context, Result};
use clap::Parser;
use ethers::prelude::*;
use lemma_core::{Inputs, Outputs};
use methods::LEMMA_ELF;
use risc0_ethereum_contracts::groth16;
use risc0_zkvm::{default_prover, ExecutorEnv, ProverOpts, VerifierContext};

// `ILemma` interface automatically generated via the alloy `sol!` macro.
sol! {
    interface ILemma {
        function submitSolution(uint256 challengeId, bytes32 solutionHash, bytes calldata seal);
    }
}

/// Wrapper of a `SignerMiddleware` client to send transactions to the given
/// contract's `Address`.
pub struct TxSender {
    chain_id: u64,
    client: SignerMiddleware<Provider<Http>, Wallet<k256::ecdsa::SigningKey>>,
    contract: Address,
}

impl TxSender {
    /// Creates a new `TxSender`.
    pub fn new(chain_id: u64, rpc_url: &str, private_key: &str, contract: &str) -> Result<Self> {
        let provider = Provider::<Http>::try_from(rpc_url)?;
        let wallet: LocalWallet = private_key.parse::<LocalWallet>()?.with_chain_id(chain_id);
        let client = SignerMiddleware::new(provider.clone(), wallet.clone());
        let contract = contract.parse::<Address>()?;

        Ok(TxSender {
            chain_id,
            client,
            contract,
        })
    }

    /// Send a transaction with the given calldata.
    pub async fn send(&self, calldata: Vec<u8>) -> Result<Option<TransactionReceipt>> {
        let tx = TransactionRequest::new()
            .chain_id(self.chain_id)
            .to(self.contract.to_string())
            .from(self.client.address())
            .data(calldata);

        log::info!("Transaction request: {:?}", &tx);

        let tx = self.client.send_transaction(tx, None).await?.await?;

        log::info!("Transaction receipt: {:?}", &tx);

        Ok(tx)
    }
}

/// Arguments of the publisher CLI.
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Args {
    /// Ethereum chain ID
    #[clap(long)]
    chain_id: u64,

    /// Ethereum Node endpoint.
    #[clap(long, env)]
    eth_wallet_private_key: String,

    /// Ethereum Node endpoint.
    #[clap(long)]
    rpc_url: String,

    /// Application's contract address on Ethereum
    #[clap(long)]
    contract: String,

    /// The input to provide to the guest binary
    #[clap(short, long)]
    input: Option<String>,
}

fn main() -> Result<()> {
    env_logger::init();
    // Parse CLI Arguments: The application starts by parsing command-line arguments provided by the user.
    let args = Args::parse();

    // Create a new transaction sender using the parsed arguments.
    let tx_sender = TxSender::new(
        args.chain_id,
        &args.rpc_url,
        &args.eth_wallet_private_key,
        &args.contract,
    )?;

    // ABI encode input: Before sending the proof request to the Bonsai proving service,
    // the input number is ABI-encoded to match the format expected by the guest code running in the zkVM.
    let test_input = Inputs {
        sender: Address::default(),
        theorem: r#"
                def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C

                def and_comm (A B: Prop): (And A B) -> (And B A) := "#
            .to_string(),
        solution:
            "fun (f: And A B) (C: Prop) (bac: B -> A -> C) => f C (fun (a: A) (b: B) => bac b a)"
                .to_string(),
    };

    let input = match args.input {
        Some(input) => serde_json::from_str::<Inputs>(&input)?,
        None => test_input,
    };

    let env = ExecutorEnv::builder()
        .write_slice(&input.abi_encode())
        .build()?;

    let receipt = default_prover()
        .prove_with_ctx(
            env,
            &VerifierContext::default(),
            LEMMA_ELF,
            &ProverOpts::groth16(),
        )?
        .receipt;

    // Encode the seal with the selector.
    let seal = groth16::encode(receipt.inner.groth16()?.seal.clone())?;

    // Extract the journal from the receipt.
    let journal = receipt.journal.bytes.clone();

    // Decode Journal: Upon receiving the proof, the application decodes the journal to extract
    // the verified number. This ensures that the number being submitted to the blockchain matches
    // the number that was verified off-chain.
    let _ = Outputs::abi_decode(&journal, true).context("decoding journal data")?;

    // Construct function call: Using the IEvenNumber interface, the application constructs
    // the ABI-encoded function call for the set function of the EvenNumber contract.
    // This call includes the verified number, the post-state digest, and the seal (proof).
    let calldata = ILemma::ILemmaCalls::submitSolution(ILemma::submitSolutionCall {
        challengeId: U256::from(0),
        solutionHash: [0u8; 32].into(),
        seal: seal.into(),
    })
    .abi_encode();

    // Initialize the async runtime environment to handle the transaction sending.
    let runtime = tokio::runtime::Runtime::new()?;

    // Send transaction: Finally, the TxSender component sends the transaction to the Ethereum blockchain,
    // effectively calling the set function of the EvenNumber contract with the verified number and proof.
    runtime.block_on(tx_sender.send(calldata))?;

    Ok(())
}

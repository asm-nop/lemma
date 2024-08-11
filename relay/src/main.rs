use std::path::PathBuf;

use alloy_sol_types::SolValue;
use axum::routing::{post, put};
use axum::Json;
use axum::{routing::get, Router};
use clap::Parser;
use color_eyre::Result;
use configuration::RelayConfig;
pub use ethers::types::{Bytes, H256, U256};
use lemma_core::Inputs;
use risc0_zkvm::Receipt;
use risc0_zkvm::{default_prover, ExecutorEnv, ProverOpts, VerifierContext};
use serde::{Deserialize, Serialize};
use serde_json::Value;
pub mod configuration;

#[derive(Serialize, Deserialize)]
pub struct ProveRequest {
    pub inputs: Inputs,
    pub elf: Vec<u8>,
}

#[derive(Serialize, Deserialize)]
pub struct ProveResponse {
    pub receipt: Receipt,
}

#[tokio::main]
async fn main() -> Result<()> {
    color_eyre::install()?;
    let config = load_config()?;
    let app = Router::new().route("/prove", post(move |body| prove(body)));

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}

fn load_config() -> Result<configuration::RelayConfig> {
    let mut settings = config::Config::builder();

    let settings = settings
        .add_source(config::Environment::default().try_parsing(true))
        .build()?;

    Ok(settings.try_deserialize::<configuration::RelayConfig>()?)
}

async fn prove(Json(payload): Json<ProveRequest>) -> Json<ProveResponse> {
    let env = ExecutorEnv::builder()
        .write_slice(&payload.inputs.abi_encode())
        .build()
        .unwrap();

    let receipt = default_prover()
        .prove_with_ctx(
            env,
            &VerifierContext::default(),
            payload.elf.as_slice(),
            &ProverOpts::groth16(),
        )
        .unwrap()
        .receipt;
    Json(ProveResponse { receipt })
}

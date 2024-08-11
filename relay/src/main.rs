use alloy_sol_types::SolValue;
use axum::http::Method;
use axum::routing::{post, put};
use axum::Json;
use clap::Parser;
use color_eyre::eyre;
use color_eyre::eyre::eyre;
use configuration::RelayConfig;
use lemma_core::Inputs;
use risc0_zkvm::Receipt;
use risc0_zkvm::{default_prover, ExecutorEnv, ProverOpts, VerifierContext};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::PathBuf;
pub mod configuration;
use axum::{
    body::{self, Bytes},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use tower_http::cors::{Any, CorsLayer};

#[derive(Serialize, Deserialize)]
pub struct ProveRequest {
    pub inputs: Inputs,
    pub elf: Vec<u8>,
}

#[derive(Serialize, Deserialize)]
pub struct ProveResponse {
    pub receipt: Receipt,
}

#[derive(Debug)]
struct AppError(color_eyre::eyre::Report);

type AppResult<T> = Result<T, AppError>;

// Tell axum how to convert `AppError` into a response.
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Something went wrong: {}", self.0),
        )
            .into_response()
    }
}

impl<E> From<E> for AppError
where
    E: Into<color_eyre::eyre::Report>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

#[tokio::main]
async fn main() -> eyre::Result<()> {
    color_eyre::install()?;
    let config = load_config()?;

    let cors = CorsLayer::new()
        // allow `GET` and `POST` when accessing the resource
        .allow_methods([Method::GET, Method::POST])
        // allow requests from any origin
        .allow_origin(Any);

    let app = Router::new().layer(cors).route("/prove", post(prove));

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}

fn load_config() -> eyre::Result<configuration::RelayConfig> {
    let mut settings = config::Config::builder();

    let settings = settings
        .add_source(config::Environment::default().try_parsing(true))
        .build()?;

    Ok(settings.try_deserialize::<configuration::RelayConfig>()?)
}

async fn prove(Json(payload): Json<ProveRequest>) -> AppResult<Json<ProveResponse>> {
    let env = ExecutorEnv::builder()
        .write_slice(&payload.inputs.abi_encode())
        .build()
        .map_err(|e| eyre!(e))?;

    let receipt = default_prover()
        .prove_with_ctx(
            env,
            &VerifierContext::default(),
            payload.elf.as_slice(),
            &ProverOpts::groth16(),
        )
        .map_err(|e| eyre!(e))?
        .receipt;
    Ok(Json(ProveResponse { receipt }))
}

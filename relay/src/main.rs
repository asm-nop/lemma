use std::path::PathBuf;

use axum::Json;
use axum::{routing::get, Router};
use clap::Parser;
use color_eyre::Result;
use configuration::RelayConfig;
pub use ethers::types::{Bytes, H256, U256};
use serde_json::Value;
pub mod configuration;

#[tokio::main]
async fn main() -> Result<()> {
    color_eyre::install()?;
    let config = load_config()?;
    let app = Router::new().route("/prove", get(prove));

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

async fn prove() -> Json<Value> {
    // Json(json!({ "data": 42 }))
    todo!()
}

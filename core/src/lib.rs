use risc0_zkvm::sha::Digest;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Inputs {
    pub sender: String,
    pub theorem_template: String,
    pub solution: String,
}

#[derive(Serialize, Deserialize)]
pub struct Outputs {
    pub sender: String,
    pub solution_hash: Digest,
}

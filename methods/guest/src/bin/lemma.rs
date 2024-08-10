// Copyright 2023 RISC Zero, Inc.
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

use risc0_zkvm::sha::Digest;
use serde::{Deserialize, Serialize};

use mini_proost::process_input;

use risc0_zkvm::{
    guest::env,
    sha::{Impl, Sha256},
};

#[derive(Serialize, Deserialize)]
pub struct Inputs {
    sender: String,
    theorem_template: String,
    solution: String,
}

#[derive(Serialize, Deserialize)]
pub struct Outputs {
    sender: String,
    solution_hash: Digest,
}

fn main() {
    let inputs: Inputs = env::read();

    let statement = inputs.theorem_template + &inputs.solution;

    let sha = *Impl::hash_bytes(statement.as_bytes());
    let statement = r#"def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C"#;

    // Run the computation.
    // In this case, asserting that the provided number is even.
    let mdln = include_str!("../../../../mdln/examples/irrelevance.mdln");
    let _ = process_input(&mdln).expect("invalid proof");

    // Commit the journal that will be received by the application contract.
    // Journal is encoded using Solidity ABI for easy decoding in the app contract.
    let outputs = Outputs {
        solution_hash: sha,
        sender: inputs.sender,
    };
    env::commit(&outputs);
}

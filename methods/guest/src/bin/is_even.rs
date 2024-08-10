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

use std::io::Read;

use alloy_primitives::U256;
use alloy_sol_types::SolValue;
use serde::{Serialize, Deserialize};
use risc0_zkvm::sha::Digest;

use risc0_zkvm::{
    guest::env,
    sha::{Impl, Sha256},
};

// use parser::command::{parse, Command};
// use proost::evaluator::Evaluator;

#[derive(Serialize, Deserialize)]
pub struct Inputs {
    theorem_template: String,
    solution: String,
}

#[derive(Serialize, Deserialize)]
pub struct Outputs {
    solution_hash: Digest,
}

fn main() {
    // Read the input data for this application.
    // let mut input_bytes = Vec::<u8>::new();
    // env::stdin().read_to_end(&mut input_bytes).unwrap();
    // // Decode and parse the input
    // let number = <U256>::abi_decode(&input_bytes, true).unwrap();
    let inputs: Inputs = env::read();
    
    let statement = inputs.theorem_template + &inputs.solution;
    
    let sha = *Impl::hash_bytes(&statement.as_bytes());

    // Run the computation.
    // In this case, asserting that the provided number is even.
    assert!(true, "number is not even");
    // let mdln = include_str!("../../../../mdln/examples/eq.mdln");
    //let command = parse::file(mdln);
    //let evaluator = Evaluator::new();

    // Commit the journal that will be received by the application contract.
    // Journal is encoded using Solidity ABI for easy decoding in the app contract.
    let outputs = Outputs {
        solution_hash: sha,
    };
    env::commit(&outputs);
}

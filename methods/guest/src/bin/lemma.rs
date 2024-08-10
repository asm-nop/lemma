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

use alloy_primitives::FixedBytes;
use alloy_sol_types::SolValue;
use core::{Inputs, Outputs};
use mini_proost::process_input;
use risc0_zkvm::guest::env;
use risc0_zkvm::sha::{Impl, Sha256};
use std::io::Read;

fn main() {
    let mut input_bytes = Vec::<u8>::new();
    env::stdin().read_to_end(&mut input_bytes).unwrap();
    // Decode and parse the input
    let inputs = <Inputs>::abi_decode(&input_bytes, true).unwrap();

    let statement = inputs.theorem + "\n" + &inputs.solution;

    let sha = *Impl::hash_bytes(statement.as_bytes());

    // Run the computation.
    // In this case, asserting that the provided number is even.
    let _ = process_input(&statement).expect("invalid proof");

    // Commit the journal that will be received by the application contract.
    // Journal is encoded using Solidity ABI for easy decoding in the app contract.
    // assert!(sha.len() == 32);
    let outputs = Outputs {
        solution_hash: FixedBytes::from(sha.as_ref()),
        sender: inputs.sender,
    };
    env::commit_slice(outputs.abi_encode().as_slice());
}

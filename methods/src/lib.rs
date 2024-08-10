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

//! Generated crate containing the image ID and ELF binary of the build guest.

include!(concat!(env!("OUT_DIR"), "/methods.rs"));

use risc0_zkvm::sha::Digest;
use serde::{Deserialize, Serialize};

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

#[cfg(test)]
mod tests {
    use alloy_primitives::U256;
    use alloy_sol_types::SolValue;
    use risc0_zkvm::{default_executor, ExecutorEnv};

    use crate::Inputs;

    #[test]
    fn proves_valid_theorem() {
        let inputs = Inputs {
            sender: "0x1234".to_string(),
            theorem_template: r#"def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C

def and_comm (A B: Prop): (And A B) -> (And B A) :=
  fun f: (And A B), C: Prop, bac: (B -> A -> C) => f C (fun a:A, b:B => bac b a)"#
                .to_string(),
            solution: "".to_string(),
        };

        let env = ExecutorEnv::builder()
            .write(&inputs)
            .unwrap()
            .build()
            .unwrap();

        // NOTE: Use the executor to run tests without proving.
        let session_info = default_executor().execute(env, super::LEMMA_ELF).unwrap();

        // let x = U256::abi_decode(&session_info.journal.bytes, true).unwrap();
        // assert_eq!(x, even_number);
    }

    // #[test]
    // #[should_panic(expected = "number is not even")]
    // fn rejects_invalid_theorem() {
    //     let odd_number = U256::from(75);
    //
    //     let env = ExecutorEnv::builder()
    //         .write_slice(&odd_number.abi_encode())
    //         .build()
    //         .unwrap();
    //
    //     // NOTE: Use the executor to run tests without proving.
    //     default_executor().execute(env, super::LEMMA_ELF).unwrap();
    // }
}

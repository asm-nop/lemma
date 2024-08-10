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

#[cfg(test)]
mod tests {
    use alloy_primitives::U256;
    use alloy_sol_types::SolValue;
    use risc0_zkvm::{default_executor, ExecutorEnv};

    use core::{Inputs, Outputs};

    #[test]
    fn proves_valid_theorem() {
        let inputs = Inputs {
            sender: "0x1234".to_string(),
            theorem: r#"
                def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C

                def and_comm (A B: Prop): (And A B) -> (And B A) := "#.to_string(),
            solution: "fun (f: And A B) (C: Prop) (bac: B -> A -> C) => f C (fun (a: A) (b: B) => bac b a)".to_string(),
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

    #[test]
    #[should_panic(expected = "invalid proof")]
    fn rejects_invalid_theorem() {
        let inputs = Inputs {
            sender: "0x1234".to_string(),
            theorem: r#"
                def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C

                def and_comm (A B: Prop): (And A B) -> (And B A) := "#
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
    }
}

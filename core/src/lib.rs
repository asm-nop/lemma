use alloy_sol_types::sol;
// use risc0_zkvm::sha::Digest;
use serde::{Deserialize, Serialize};

sol! {
    #[derive(Serialize, Deserialize)]
    struct Inputs {
        address sender;
        string theorem;
        string solution;
    }

    #[derive(Serialize, Deserialize)]
    struct Outputs {
        address sender;
        bytes32 solution_hash;
    }
}
// #[derive(Serialize, Deserialize)]
// pub struct Inputs {
//     pub sender: String,
//     pub theorem_template: String,
//     pub solution: String,
// }
//
// #[derive(Serialize, Deserialize)]
// pub struct Outputs {
//     pub sender: String,
//     pub solution_hash: Digest,
// }

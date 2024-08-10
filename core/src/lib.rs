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

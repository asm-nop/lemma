use alloy_sol_types::sol;
use serde::{Deserialize, Serialize};
pub use std::convert;

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

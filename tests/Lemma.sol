
// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.20;

import {RiscZeroCheats} from "risc0/test/RiscZeroCheats.sol";
import {console2} from "forge-std/console2.sol";
import {Test} from "forge-std/Test.sol";
import {Lemma} from "../contracts/Lemma.sol";
import {IRiscZeroVerifier} from "risc0/IRiscZeroVerifier.sol";


contract LemmaTest is RiscZeroCheats, Test {
    Lemma public lemma;

    function setUp() public {
        IRiscZeroVerifier verifier = deployRiscZeroVerifier();
        lemma = new Lemma(verifier);
    }

    function test_AddChallenge() public {
    }
}

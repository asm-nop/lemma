// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.20;

import {RiscZeroCheats} from "risc0/test/RiscZeroCheats.sol";
import {console2} from "forge-std/console2.sol";
import {Test} from "forge-std/Test.sol";
import {Lemma} from "../contracts/Lemma.sol";
import {IRiscZeroVerifier} from "risc0/IRiscZeroVerifier.sol";
import {Elf} from "./Elf.sol"; // auto-generated contract after running `cargo build`.

contract LemmaTest is RiscZeroCheats, Test {
    Lemma public lemma;

    function setUp() public {
        IRiscZeroVerifier verifier = deployRiscZeroVerifier();
        lemma = new Lemma(verifier);
    }

    function test_AddChallenge() public {
        uint256 ts = vm.getBlockTimestamp() + 1 days;
        uint256 challengeId = lemma.createChallenge(
            "My challenge",
            ts,
            1 ether
        );

        Lemma.Challenge memory challenge = lemma.getChallenge(challengeId);

        assertEq(challenge.challengeId, challengeId);
        assertEq(challenge.prompt, "My challenge");
        assertEq(challenge.bounty, 1 ether);
        assertEq(challenge.expirationTimestamp, ts);
    }

    function test_SolveChallenge() public {
        (bytes memory journal, bytes memory seal) = prove(
            Elf.LEMMA_PATH,
            abi.encode(number)
        );
    }

    // function test_SetEven() public {
    //     uint256 number = 12345678;
    //     (bytes memory journal, bytes memory seal) = prove(
    //         Elf.IS_EVEN_PATH,
    //         abi.encode(number)
    //     );

    //     evenNumber.set(abi.decode(journal, (uint256)), seal);
    //     assertEq(evenNumber.get(), number);
    // }

    // function test_SetZero() public {
    //     uint256 number = 0;
    //     (bytes memory journal, bytes memory seal) = prove(
    //         Elf.IS_EVEN_PATH,
    //         abi.encode(number)
    //     );

    //     evenNumber.set(abi.decode(journal, (uint256)), seal);
    //     assertEq(evenNumber.get(), number);
    // }
}

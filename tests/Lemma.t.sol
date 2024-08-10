// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.20;

import {RiscZeroCheats} from "risc0/test/RiscZeroCheats.sol";
import {console2} from "forge-std/console2.sol";
import {Test} from "forge-std/Test.sol";
import {Lemma} from "../contracts/Lemma.sol";
import {IRiscZeroVerifier} from "risc0/IRiscZeroVerifier.sol";
import {Elf} from "./Elf.sol"; // auto-generated contract after running `cargo build`.
import {ILemma} from "interfaces/ILemma.sol";

contract LemmaTest is RiscZeroCheats, Test {
    Lemma public lemma;

    function setUp() public {
        uint256 minimumBounty = 1000 wei;
        uint256 minimumChallengeDuration = 1 days;
        uint256 solutionExpirationTime = 1 hours;
        IRiscZeroVerifier verifier = deployRiscZeroVerifier();
        lemma = new Lemma(
            verifier,
            minimumBounty,
            minimumChallengeDuration,
            solutionExpirationTime
        );
    }

    // function test_AddChallenge() public {
    //     uint256 ts = vm.getBlockTimestamp() + 1 days;
    //     uint256 challengeId = lemma.createChallenge(
    //         "My challenge",
    //         ts,
    //         1 ether
    //     );

    //     Lemma.Challenge memory challenge = lemma.getChallenge(challengeId);

    //     assertEq(challenge.challengeId, challengeId);
    //     assertEq(challenge.prompt, "My challenge");
    //     assertEq(challenge.bounty, 1 ether);
    //     assertEq(challenge.expirationTimestamp, ts);
    // }

    // function test_SolveChallenge() public {
    //     (bytes memory journal, bytes memory seal) = prove(
    //         Elf.LEMMA_PATH,
    //         abi.encode(number)
    //     );
    // }

    // TODO: test create challenge

    function test_createChallenge() public {
        vm.deal(address(this), type(uint128).max);
        string memory challengeName = "And Commutativity";
        string
            memory theorem = "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C def and_comm (A B: Prop): (And A B) -> (And B A) := ";

        uint256 expirationTimestamp = vm.getBlockTimestamp() + 1 days;
        uint256 bounty = 1 ether;

        uint256 challengeId = lemma.createChallenge{value: bounty}(
            theorem,
            challengeName,
            expirationTimestamp
        );

        Lemma.Challenge memory challenge = lemma.getChallenge(challengeId);

        assertEq(challenge.challengeId, challengeId);
        assertEq(challenge.theorem, theorem);
        assertEq(challenge.bounty, bounty);
        assertEq(challenge.expirationTimestamp, expirationTimestamp);
        assertEq(challenge.challengeName, challengeName);

        assertEq(address(lemma).balance, bounty);
    }

    // TODO: if time test fail to create challenge

    function submitAndCommuntativityChallenge() public {
        vm.deal(address(this), type(uint128).max);
        string memory challengeName = "And Commutativity";
        string
            memory theorem = "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C def and_comm (A B: Prop): (And A B) -> (And B A) := ";

        uint256 expirationTimestamp = vm.getBlockTimestamp() + 1 days;
        uint256 bounty = 1 ether;

        uint256 challengeId = lemma.createChallenge{value: bounty}(
            theorem,
            challengeName,
            expirationTimestamp
        );

        Lemma.Challenge memory challenge = lemma.getChallenge(challengeId);

        assertEq(challenge.challengeId, challengeId);
        assertEq(challenge.theorem, theorem);
        assertEq(challenge.bounty, bounty);
        assertEq(challenge.expirationTimestamp, expirationTimestamp);
        assertEq(challenge.challengeName, challengeName);

        assertEq(address(lemma).balance, bounty);
    }

    function test_submitSolution() public {
        submitAndCommuntativityChallenge();

        ILemma.Risc0Inputs memory inputs = ILemma.Risc0Inputs({
            sender: address(this),
            theorem: "And Commutativity",
            solution: "def and_comm (A B: Prop): (And A B) -> (And B A) := "
        });

        (bytes memory journal, bytes memory seal) = prove(
            Elf.LEMMA_PATH,
            abi.encode(inputs)
        );

        // TODO: get proof
    }

    // TODO: if time, test fail to submit solution

    // TODO: test claim bounty

    // TODO: if time, test fail to claim bounty

    // TODO: test terminate challenge

    // TODO: if time, test fail to terminate challenge
}

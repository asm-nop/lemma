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

    function test_createChallenge() public {
        vm.deal(address(this), type(uint128).max);
        string memory challengeName = "And Commutativity";
        string
            memory theorem = "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C def and_comm (A B: Prop): (And A B) -> (And B A) := ";

        uint256 expirationTimestamp = vm.getBlockTimestamp() + 1 days;
        uint256 bounty = 1 ether;

        vm.expectEmit(true, true, true, true);
        emit Lemma.ChallengeCreated(0, expirationTimestamp, address(this));
        uint256 challengeId = lemma.createChallenge{value: bounty}(
            challengeName,
            theorem,
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

    function test_createChallenge_RevertIfMinimumBountyNotMet() public {
        vm.deal(address(this), type(uint128).max);
        string memory challengeName = "And Commutativity";
        string
            memory theorem = "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C def and_comm (A B: Prop): (And A B) -> (And B A) := ";
        uint256 expirationTimestamp = vm.getBlockTimestamp() + 1 days;
        uint256 bounty = 100 wei;

        vm.expectRevert(Lemma.MinimumBounty.selector);
        lemma.createChallenge{value: bounty}(
            challengeName,
            theorem,
            expirationTimestamp
        );
    }

    function test_createChallenge_RevertIfMinimumChallengeDurationNotMet()
        public
    {
        vm.deal(address(this), type(uint128).max);
        string memory challengeName = "And Commutativity";
        string
            memory theorem = "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C def and_comm (A B: Prop): (And A B) -> (And B A) := ";
        uint256 expirationTimestamp = vm.getBlockTimestamp() + 1 hours;
        uint256 bounty = 1 ether;

        vm.expectRevert(Lemma.MinimumChallengeDuration.selector);
        lemma.createChallenge{value: bounty}(
            challengeName,
            theorem,
            expirationTimestamp
        );
    }

    function submitMockAndCommuntativityChallenge() public {
        vm.deal(address(this), type(uint128).max);
        string memory challengeName = "And Commutativity";
        string
            memory theorem = "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C\ndef and_comm (A B: Prop): (And A B) -> (And B A) :=";
        uint256 expirationTimestamp = vm.getBlockTimestamp() + 1 days;
        uint256 bounty = 1 ether;

        uint256 challengeId = lemma.createChallenge{value: bounty}(
            challengeName,
            theorem,
            expirationTimestamp
        );

        Lemma.Challenge memory challenge = lemma.getChallenge(challengeId);
    }

    function test_proveTheorem() public {
        ILemma.Risc0Inputs memory inputs = ILemma.Risc0Inputs({
            sender: address(this),
            theorem: "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C\ndef and_comm (A B: Prop): (And A B) -> (And B A) :=",
            solution: "fun (f: And A B) (C: Prop) (bac: B -> A -> C) => f C (fun (a: A) (b: B) => bac b a)"
        });

        vm.setEnv("RISC0_DEV_MODE", "true");

        (bytes memory journal, bytes memory seal) = prove(
            Elf.LEMMA_PATH,
            abi.encode(inputs)
        );
    }

    function test_submitSolution() public {
        submitMockAndCommuntativityChallenge();

        ILemma.Risc0Inputs memory inputs = ILemma.Risc0Inputs({
            sender: address(this),
            theorem: "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C\ndef and_comm (A B: Prop): (And A B) -> (And B A) :=",
            solution: "fun (f: And A B) (C: Prop) (bac: B -> A -> C) => f C (fun (a: A) (b: B) => bac b a)"
        });

        vm.setEnv("RISC0_DEV_MODE", "true");

        (bytes memory journal, bytes memory seal) = prove(
            Elf.LEMMA_PATH,
            abi.encode(inputs)
        );

        ILemma.Risc0Outputs memory outputs = abi.decode(
            journal,
            (ILemma.Risc0Outputs)
        );

        lemma.submitSolution(0, outputs.solutionHash, seal);

        Lemma.Solution memory solution = lemma.getSolution(0);

        assertEq(solution.solutionHash, outputs.solutionHash);
        assertEq(
            solution.expirationTimestamp,
            vm.getBlockTimestamp() + lemma.solutionExpirationTime()
        );
        assertEq(solution.sender, address(this));
    }

    function submitMockSolution() public returns (string memory) {
        ILemma.Risc0Inputs memory inputs = ILemma.Risc0Inputs({
            sender: address(this),
            theorem: "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C\ndef and_comm (A B: Prop): (And A B) -> (And B A) :=",
            solution: "fun (f: And A B) (C: Prop) (bac: B -> A -> C) => f C (fun (a: A) (b: B) => bac b a)"
        });

        vm.setEnv("RISC0_DEV_MODE", "true");

        (bytes memory journal, bytes memory seal) = prove(
            Elf.LEMMA_PATH,
            abi.encode(inputs)
        );

        ILemma.Risc0Outputs memory outputs = abi.decode(
            journal,
            (ILemma.Risc0Outputs)
        );

        Lemma.Challenge memory challenge = lemma.getChallenge(0);

        lemma.submitSolution(0, outputs.solutionHash, seal);

        return inputs.solution;
    }

    function test_submitSolution_RevertsIfChallengeDoesNotExist() public {
        ILemma.Risc0Inputs memory inputs = ILemma.Risc0Inputs({
            sender: address(this),
            theorem: "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C\ndef and_comm (A B: Prop): (And A B) -> (And B A) :=",
            solution: "fun (f: And A B) (C: Prop) (bac: B -> A -> C) => f C (fun (a: A) (b: B) => bac b a)"
        });

        vm.setEnv("RISC0_DEV_MODE", "true");

        (bytes memory journal, bytes memory seal) = prove(
            Elf.LEMMA_PATH,
            abi.encode(inputs)
        );

        ILemma.Risc0Outputs memory outputs = abi.decode(
            journal,
            (ILemma.Risc0Outputs)
        );

        vm.expectRevert(Lemma.ChallengeDoesNotExist.selector);
        lemma.submitSolution(0, outputs.solutionHash, seal);
    }

    function test_submitSolution_RevertsIfSolutionAlreadyExists() public {
        submitMockAndCommuntativityChallenge();
        submitMockSolution();

        address newSender = address(1);
        ILemma.Risc0Inputs memory inputs = ILemma.Risc0Inputs({
            sender: newSender,
            theorem: "def And (A B: Prop): Prop := (C: Prop) -> (A -> B -> C) -> C\ndef and_comm (A B: Prop): (And A B) -> (And B A) :=",
            solution: "fun (f: And A B) (C: Prop) (bac: B -> A -> C) => f C (fun (a: A) (b: B) => bac b a)"
        });

        vm.setEnv("RISC0_DEV_MODE", "true");

        (bytes memory journal, bytes memory seal) = prove(
            Elf.LEMMA_PATH,
            abi.encode(inputs)
        );

        ILemma.Risc0Outputs memory outputs = abi.decode(
            journal,
            (ILemma.Risc0Outputs)
        );

        Lemma.Solution memory solution = lemma.getSolution(0);
        bytes memory errorData = abi.encodeWithSelector(
            Lemma.SolutionAlreadyExists.selector,
            solution.expirationTimestamp
        );

        vm.expectRevert(errorData);
        vm.prank(newSender);
        lemma.submitSolution(0, outputs.solutionHash, seal);
    }

    function test_claimBounty() public {
        submitMockAndCommuntativityChallenge();
        string memory solution = submitMockSolution();
        uint256 balanceBefore = address(this).balance;

        lemma.claimBounty(0, solution);

        uint256 balanceAfter = address(this).balance;
        assertEq(balanceAfter - balanceBefore, 1 ether);

        Lemma.Challenge memory challenge = lemma.getChallenge(0);
        assertEq(challenge.expirationTimestamp, 0);
    }

    // TODO: if time, test fail to claim bounty

    function test_terminateChallenge() public {
        submitMockAndCommuntativityChallenge();
        submitMockSolution();

        uint256 expirationTimestamp = lemma.getChallenge(0).expirationTimestamp;

        vm.warp(expirationTimestamp + 1);

        lemma.terminateChallenge(0);

        Lemma.Challenge memory challenge = lemma.getChallenge(0);
        assertEq(challenge.expirationTimestamp, 0);
    }

    // TODO: if time, test fail to terminate challenge

    fallback() external payable {}
}

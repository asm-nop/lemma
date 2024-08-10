// Copyright 2024 RISC Zero, Inc.
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
//
// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.20;

import {IRiscZeroVerifier} from "risc0/IRiscZeroVerifier.sol";

/// @title A starter application using RISC Zero.
/// @notice This basic application holds a number, guaranteed to be even.
/// @dev This contract demonstrates one pattern for offloading the computation of an expensive
///      or difficult to implement function to a RISC Zero guest running on Bonsai.
contract Lemma {
    /// @notice RISC Zero verifier contract address.
    IRiscZeroVerifier public immutable verifier;

    // TODO: This should map the the auto-generated contract id or something
    bytes32 public constant imageId = 0;

    constructor(IRiscZeroVerifier _verifier) {
        verifier = _verifier;
    }

    uint256 public challengeNonce = 0;
    uint256 minimumBounty;
    uint256 minimumChallengeDuration;

    event ChallengeCreated(
        uint256 challengeId,
        uint256 expirationTimestamp,
        address sender
    );

    event ChallengeDeleted(uint256 challengeId);

    //TODO: pack this struct
    struct Challenge {
        uint256 challengeId;
        string prompt;
        uint256 bounty;
        uint256 expirationTimestamp;
        address creator;
    }

    error ChallengeNotExpired();
    error MinimumBounty();
    error MinBountyNotSatisfied();
    error MinimumChallengeDuration();
    error MsgSenderIsNotChallengeCreator();
    error ChallengeDoesNotExist();

    /// @notice Challenge nonce to challenge
    mapping(uint256 => Challenge) public challenges;

    /// @notice Solution hash to solution
    // mapping(uint256 => Solution) public solutions;

    function getChallenge(uint256 challengeId) public view returns (Challenge memory) {
        return challenges[challengeId];
    }

    /// @notice Creates a new challenge, returns its id
    function createChallenge(
        string calldata prompt,
        uint256 expirationTimestamp,
        uint256 bounty
    ) public payable returns (uint256) {
        if (expirationTimestamp < block.timestamp + minimumChallengeDuration) {
            revert MinimumChallengeDuration();
        }

        if (msg.value < minimumBounty) {
            revert MinBountyNotSatisfied();
        }

        uint256 challengeId = challengeNonce;

        challenges[challengeId] = Challenge(
            challengeId,
            prompt,
            bounty,
            expirationTimestamp,
            msg.sender
        );

        challengeNonce = challengeId + 1;

        emit ChallengeCreated(
            challengeId,
            expirationTimestamp,
            msg.sender
        );

        return challengeId;
    }

    function submitSolution(uint256 challengeId, uint256 solutionHash, bytes calldata seal) public {
        if (challengeId < challengeNonce) {
            revert ChallengeDoesNotExist();
        }

        Challenge storage challenge = challenges[challengeId];
        if (challenge.creator == address(0)) {
            revert ChallengeDoesNotExist();
        }

        bytes memory journal = abi.encode(solutionHash, msg.sender);
        verifier.verify(seal, imageId, sha256(journal));
    }

    // TODO: add non reentrant
    /// @notice Terminates a challenge
    /// Reclaims the bounty for the challenge creator
    function terminateChallenge(uint256 challengeId) internal {
        Challenge storage challenge = challenges[challengeId];

        if (challenge.creator != msg.sender) {
            revert MsgSenderIsNotChallengeCreator();
        }

        if (challenge.expirationTimestamp < block.timestamp) {
            revert ChallengeNotExpired();
        }

        uint256 bounty = challenge.bounty;
        delete challenges[challengeId];

        emit ChallengeDeleted(challengeId);

        // Pay out bounty
        (bool sent, bytes memory data) = msg.sender.call{value: bounty}("");

        require(sent, "Failed to send Ether");
    }

    //TODO: some function to get your eth back if you created a challenge and no one solved it in time

    // TODO: maybe have some challengeId to nonce.

    // TODO: make it a two step where you have some solution, hash the solution as a public input, actual solution as a private input

    // TODO: Then if the proof is validated, it will record the hash with your address as the sender, maybe need a solutions mapping
    // TODO: then you can submit the solution, and it will check if the hash is in the solutions mapping, and if it is, it will record the solution as the solution for that hash

    // TODO: and you have n time to claim until it expires and then someone else can claim it.

    // TODO: some function to submit a challenge
}

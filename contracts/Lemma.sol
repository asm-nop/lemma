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

    constructor(IRiscZeroVerifier _verifier) {
        verifier = _verifier;
    }

    uint256 challengeNonce;
    uint256 minimumBounty;
    uint256 minimumChallengeDuration;

    event ChallengeCreated(
        uint256 challengeId,
        bytes32 imageId,
        bytes32 solutionHash,
        uint256 expiration,
        address sender
    );

    event ChallengeExpired(uint256 challengeId);

    //TODO: pack this struct
    struct Challenge {
        uint32 challengeId;
        string prompt;
        uint128 bounty;
        uint128 expirationTimestamp;
        address creator;
    }

    error ChallengeExpired();
    error ChallengeNotExpired();
    error MinimumBounty();
    error MinimumChallengeDuration();
    error MsgSenderIsNotChallengeCreator();

    /// @notice Challenge nonce to challenge
    //TODO: make this public
    mapping(uint256 => Challenge) public challenges;

    function createChallenge(
        string calldata prompt,
        uint128 expirationTimestamp
    ) public payable {
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
            imageId,
            solutionHash,
            expiration,
            msg.sender
        );
    }

    // TODO: add non reentrant
    function reclaimBounty(uint256 challengeId) public {
        Challenge memory challenge = challenges[challengeId];

        // TODO: check if challenge exists

        if (challenge.creator != msg.sender) {
            revert MsgSenderIsNotChallengeCreator();
        }

        if (challenge.expirationTimestamp < block.timestamp) {
            revert ChallengeNotExpired();
        }

        // TODO: remove challenge before sending ether to avoid reentrancy

        emit ChallengeExpired(challengeId);

        // TODO: safeTransfer(msg.sender, challenge.bounty);
    }

    function removeChallenge(uint256 challengeId) internal {
        delete challenges[challengeId];
    }

    //TODO: some function to get your eth back if you created a challenge and no one solved it in time

    // TODO: maybe have some challengeId to nonce.

    // TODO: make it a two step where you have some solution, hash the solution as a public input, actual solution as a private input

    // TODO: Then if the proof is validated, it will record the hash with your address as the sender, maybe need a solutions mapping
    // TODO: then you can submit the solution, and it will check if the hash is in the solutions mapping, and if it is, it will record the solution as the solution for that hash

    // TODO: and you have n time to claim until it expires and then someone else can claim it.

    // TODO: some function to submit a challenge
}

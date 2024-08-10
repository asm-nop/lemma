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
import {ImageID} from "./ImageID.sol"; // auto-generated contract after running `cargo build`.

/// @title A starter application using RISC Zero.
/// @notice This basic application holds a number, guaranteed to be even.
/// @dev This contract demonstrates one pattern for offloading the computation of an expensive
///      or difficult to implement function to a RISC Zero guest running on Bonsai.
contract Lemma {
    /// @notice RISC Zero verifier contract address.
    IRiscZeroVerifier public immutable verifier;
    bytes32 public constant imageId = ImageID.LEMMA_ID;

    constructor(
        IRiscZeroVerifier _verifier,
        uint256 _minimumBounty,
        uint256 _minimumChallengeDuration,
        uint256 _solutionExpirationTime
    ) {
        verifier = _verifier;
        minimumBounty = _minimumBounty;
        minimumChallengeDuration = _minimumChallengeDuration;
        solutionExpirationTime = _solutionExpirationTime;
    }

    uint256 public challengeNonce = 0;
    uint256 public immutable minimumBounty;
    uint256 public immutable minimumChallengeDuration;
    uint256 public immutable solutionExpirationTime;

    event ChallengeCreated(
        uint256 challengeId,
        uint256 expirationTimestamp,
        address sender
    );
    event ChallengeDeleted(uint256 challengeId);
    event ChallengeSolved(uint256 challengeId, address sender);

    //TODO: pack this struct
    struct Challenge {
        address creator;
        uint256 challengeId;
        string theorem;
        string challengeName;
        uint256 bounty;
        uint256 expirationTimestamp;
    }

    error ChallengeNotExpired();
    error MinimumBounty();
    error MinimumChallengeDuration();
    error MsgSenderIsNotChallengeCreator();
    error ChallengeDoesNotExist();
    error SolutionAlreadyExists(uint256 expirationeTimestamp);
    error SolutionDoesNotExist();
    error InvalidSolution();
    error InvalidSender();

    /// @notice Challenge nonce to challenge
    mapping(uint256 => Challenge) public challenges;

    //TODO: pack structs
    struct Solution {
        bytes32 solutionHash;
        uint256 expirationTimestamp;
        address sender;
    }

    /// @notice Challenge Id to solution
    mapping(uint256 => Solution) public solutions;

    function getChallenge(
        uint256 challengeId
    ) public view returns (Challenge memory) {
        return challenges[challengeId];
    }

    function getSolution(
        uint256 challengeId
    ) public view returns (Solution memory) {
        return solutions[challengeId];
    }

    function getChallengeNonce() public view returns (uint256) {
        return challengeNonce;
    }

    /// @notice Creates a new challenge, returns its id

    /// @dev note that theorem is theorem template
    function createChallenge(
        string calldata challengeName,
        string calldata theorem,
        uint256 expirationTimestamp
    ) public payable returns (uint256) {
        if (expirationTimestamp < block.timestamp + minimumChallengeDuration) {
            revert MinimumChallengeDuration();
        }

        if (msg.value < minimumBounty) {
            revert MinimumBounty();
        }

        uint256 challengeId = challengeNonce;

        challenges[challengeId] = Challenge(
            msg.sender,
            challengeId,
            theorem,
            challengeName,
            msg.value,
            expirationTimestamp
        );

        challengeNonce = challengeId + 1;

        emit ChallengeCreated(challengeId, expirationTimestamp, msg.sender);

        return challengeId;
    }

    function submitSolution(
        uint256 challengeId,
        bytes32 solutionHash,
        bytes calldata seal
    ) public {
        /// @notice Check if the challenge exists
        Challenge memory challenge = challenges[challengeId];
        if (challenge.expirationTimestamp == 0) {
            revert ChallengeDoesNotExist();
        }

        /// @notice Check if an active solution exists
        uint256 solutionExpirationTimestamp = solutions[challengeId]
            .expirationTimestamp;

        if (solutionExpirationTimestamp > block.timestamp) {
            revert SolutionAlreadyExists(solutionExpirationTimestamp);
        }

        bytes memory journal = abi.encode(msg.sender, solutionHash);
        verifier.verify(seal, imageId, sha256(journal));

        solutions[challengeId] = Solution(
            solutionHash,
            block.timestamp + solutionExpirationTime,
            msg.sender
        );
    }

    function claimBounty(uint256 challengeId, string calldata solution) public {
        /// @notice Check if the challenge exists
        /// @dev It is possible that the challenge expiration timestamp elapsed before the bounty was claimed
        Challenge storage challenge = challenges[challengeId];
        if (challenge.expirationTimestamp == 0) {
            revert ChallengeDoesNotExist();
        }

        if (challenge.expirationTimestamp < block.timestamp) {
            revert ChallengeNotExpired();
        }

        Solution memory existingSolution = solutions[challengeId];

        if (existingSolution.expirationTimestamp == 0) {
            revert SolutionDoesNotExist();
        }

        bytes32 solutionHash = keccak256(abi.encode(solution));
        if (existingSolution.solutionHash != solutionHash) {
            revert InvalidSolution();
        }

        if (existingSolution.sender != msg.sender) {
            revert InvalidSender();
        }

        // TODO: pay bounty

        // Delete the challenge
        delete challenges[challengeId];
        delete solutions[challengeId];

        emit ChallengeSolved(challengeId, msg.sender);
    }

    // TODO: add non reentrant
    /// @notice Terminates a challenge
    /// Reclaims the bounty for the challenge creator
    function terminateChallenge(uint256 challengeId) internal {
        Challenge storage challenge = challenges[challengeId];

        // TODO: check if expired and then if so you can terminate the challenge, anyone can terminate the challenge if it is expired

        if (challenge.creator != msg.sender) {
            revert MsgSenderIsNotChallengeCreator();
        }

        if (challenge.expirationTimestamp < block.timestamp) {
            revert ChallengeNotExpired();
        }

        uint256 bounty = challenge.bounty;
        delete challenges[challengeId];
        emit ChallengeDeleted(challengeId);

        // TODO: use safe transfer
        (bool sent, bytes memory data) = msg.sender.call{value: bounty}("");
        require(sent, "Failed to send Ether");
    }
}

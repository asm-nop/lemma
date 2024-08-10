//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Lemma} from "contracts/Lemma.sol";

interface ILemma {
    struct Risc0Inputs {
        address sender;
        string theorem;
        string solution;
    }

    struct Risc0Outputs {
        address sender;
        bytes32 solution_hash;
    }

    function getChallenge(
        uint256 challengeId
    ) external view returns (Lemma.Challenge memory);

    function createChallenge(
        string calldata challengeName,
        string calldata theorem,
        uint256 expirationTimestamp,
        uint256 bounty
    ) external returns (uint256);

    function submitSolution(
        uint256 challengeId,
        bytes32 solutionHash,
        bytes calldata seal
    ) external;

    function claimBounty(
        uint256 challengeId,
        string calldata solution
    ) external;

    function terminateChallenge(uint256 challengeId) external;
}

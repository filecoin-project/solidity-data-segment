// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./Verifier.sol";

contract TestVerifier {
    function CIDToPieceCommitmentV1(bytes memory cid)
        public
        view
        returns (bytes memory)
    {
        return Verifier.CIDToPieceCommitmentV1(cid);
    }

    function PieceCommitmentV1ToCID(bytes memory pc)
        public
        view
        returns (bytes memory)
    {
        return Verifier.PieceCommitmentV1ToCID(pc);
    }

    function ComputeExpectedAuxData(Verifier.InclusionVerifierData memory data)
        public
        view
        returns (Verifier.InclusionAuxData memory)
    {
        return Verifier.ComputeExpectedAuxData(data);
    }

    function ComputeRoot(Verifier.ProofData memory data, bytes16 node)
        external
        view
        returns (bytes16)
    {
        return Verifier.ComputeRoot(data, node);
    }

    function SerializeFr32(Verifier.SegmentDescIdx memory sdi)
        public
        view
        returns (bytes memory)
    {
        return Verifier.SerializeFr32(sdi);
    }

    function serializeFr32Entry(Verifier.SegmentDescIdx memory entry)
        public
        view
        returns (bytes memory)
    {
        return Verifier.serializeFr32Entry(entry);
    }

    function computeChecksum(Verifier.SegmentDescIdx memory sdi)
        public
        view
        returns (bytes16)
    {
        return Verifier.computeChecksum(sdi);
    }

    function computeNode(bytes16 left, bytes16 right)
        public
        view
        returns (bytes16)
    {
        return Verifier.computeNode(left, right);
    }
}

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const chai = require("chai");
const { expect } = chai;
const { solidity } = require("ethereum-waffle");

chai.use(solidity);

function leftPad(arr, length) {
  const res = new Uint8Array(length);
  res.fill(0);
  res.set(arr, res.length - arr.length);
  return res;
}

function hexToArray(hexStr) {
  return Uint8Array.from(Buffer.from(hexStr.slice(2), "hex"));
}

describe("Verifier", function () {
  async function deployVerifierFixture() {
    const libFactory = await ethers.getContractFactory("Verifier");
    const lib = await libFactory.deploy();

    const contractFactory = await ethers.getContractFactory("TestVerifier", {
      libraries: {
        Verifier: lib.address,
      },
    });
    const contract = await contractFactory.deploy();
    return { lib, contract };
  }
  it("should deploy the library", async function () {
    await loadFixture(deployVerifierFixture);
  });
  it("should convert the cid to pcid and vice versa", async function () {
    const { contract } = await loadFixture(deployVerifierFixture);
    const cid = new Uint8Array([
      1, 129, 226, 3, 146, 32, 32, 63, 70, 188, 100, 91, 7, 163, 234, 44, 4,
      240, 102, 249, 57, 221, 247, 226, 105, 221, 119, 103, 31, 158, 30, 97,
      163, 163, 121, 126, 102, 81, 3,
    ]);
    const pc = new Uint8Array([
      63, 70, 188, 100, 91, 7, 163, 234, 44, 4, 240, 102, 249, 57, 221, 247,
      226, 105, 221, 119, 103, 31, 158, 30, 97, 163, 163, 121, 126, 102, 81, 39,
    ]);
    const pcActual = await contract.CIDToPieceCommitmentV1(cid);
    expect(hexToArray(pcActual)).to.deep.equal(pc);

    const cidActual = await contract.PieceCommitmentV1ToCID(pc);
    expect(hexToArray(cidActual)).to.deep.equal(cid);
  });
  it("should serialize fr32", async function () {});
  it("should serialize fr32 entry", async function () {});
  it("should compute root", async function () {
    const { contract } = await loadFixture(deployVerifierFixture);

    async function testComputeRoot({ proofData, subtree, ans, shouldRevert }) {
      if (shouldRevert) {
        return await expect(contract.ComputeRoot(proofData, subtree)).to.be
          .reverted;
      }
      const root = await contract.ComputeRoot(proofData, subtree);
      expect(hexToArray(root)).to.deep.equal(ans);
    }

    const testcases = [
      {
        subtree: leftPad([0x1], 16),
        proofData: {
          path: [leftPad([0x2], 16), leftPad([0x3], 16)],
          index: 0,
        },
        ans: new Uint8Array([
          0xaa, 0x96, 0x27, 0x47, 0xb, 0x12, 0x9f, 0xab, 0xd, 0xb1, 0x26, 0xd,
          0xa8, 0x0, 0x65, 0xa1, 0xbd, 0xd3, 0x1b, 0x4a, 0xcc, 0x4c, 0x79, 0x12,
          0x1f, 0x2e, 0x1b, 0xa8, 0x48, 0x7d, 0x1f, 0x30,
        ]),
        shouldRevert: false,
      },
      {
        subtree: leftPad([0x1], 16),
        proofData: {
          path: [leftPad([0x2], 16), leftPad([0x3], 16)],
          index: 1,
        },
        ans: new Uint8Array([
          0x47, 0x5a, 0x97, 0x98, 0xaf, 0x48, 0xc5, 0x36, 0x28, 0x33, 0xcd,
          0x64, 0x51, 0xa8, 0xfa, 0x8a, 0x5f, 0x4f, 0x4c, 0x1c, 0xe6, 0x1d,
          0x3a, 0xcb, 0xd4, 0xf5, 0xc7, 0x30, 0xf, 0xe1, 0xe, 0x6,
        ]),
        shouldRevert: false,
      },
      {
        subtree: leftPad([0xff], 16),
        proofData: {
          path: [leftPad([0x2], 16), leftPad([0x3], 16)],
          index: 1,
        },
        ans: new Uint8Array([
          0xfd, 0xb3, 0x7a, 0xef, 0x9d, 0x22, 0xce, 0xcd, 0xc0, 0x58, 0xc9,
          0x9e, 0xbf, 0x94, 0xa3, 0x4c, 0xe1, 0x65, 0x88, 0x2b, 0x1e, 0x2d,
          0x3a, 0x81, 0x56, 0xae, 0x2, 0x22, 0x2d, 0xde, 0x8a, 0x28,
        ]),
        shouldRevert: false,
      },
      {
        subtree: leftPad([0x1], 16),
        proofData: {
          path: [leftPad([0x2], 16), leftPad([0x3], 16)],
          index: 3,
        },
        ans: new Uint8Array([
          0xd4, 0x71, 0x6c, 0xaf, 0x3f, 0xa7, 0x1, 0xea, 0x26, 0x96, 0x2e, 0x53,
          0x4, 0x71, 0x67, 0xbb, 0x25, 0xb0, 0x38, 0x13, 0x8f, 0xb6, 0x51, 0xfb,
          0xff, 0xe, 0xd2, 0x1d, 0x9b, 0x1c, 0x88, 0x22,
        ]),
        shouldRevert: false,
      },
      {
        subtree: leftPad([0x1], 16),
        proofData: {
          path: [leftPad([0x2], 16), leftPad([0x3], 16)],
          index: 4,
        },
        ans: null,
        shouldRevert: true,
      },
      {
        subtree: leftPad([1], 16),
        proofData: {
          path: [leftPad([2], 16), leftPad([3], 16), leftPad([4], 16)],
          index: 8,
        },
        ans: null,
        shouldRevert: true,
      },
      {
        subtree: leftPad([0x1], 16),
        proofData: {
          path: Array(64).fill(leftPad([], 16)),
          index: 8,
        },
        ans: null,
        shouldRevert: true,
      },
    ];

    await Promise.all(
      testcases.map(async (tc) => {
        return await testComputeRoot(tc);
      })
    );
  });
  it("should compute checksum", async function () {});
  it("should compute node", async function () {
    const { contract } = await loadFixture(deployVerifierFixture);

    async function testComputeNode(left, right, ans) {
      const resHex = await contract.computeNode(left, right);
      expect(hexToArray(resHex)).to.deep.equal(ans);
    }
    await testComputeNode(
      leftPad(new Uint8Array([0x2]), 16),
      leftPad(new Uint8Array([0x1]), 16),
      new Uint8Array([
        0xf5, 0xa5, 0xfd, 0x42, 0xd1, 0x6a, 0x20, 0x30, 0x27, 0x98, 0xef, 0x6e,
        0xd3, 0x9, 0x97, 0x9b, 0x43, 0x0, 0x3d, 0x23, 0x20, 0xd9, 0xf0, 0xe8,
        0xea, 0x98, 0x31, 0xa9, 0x27, 0x59, 0xfb, 0xb,
      ])
    );
  });
  describe("CBOR", function () {
    it("should serialize and deserialize ProofData", async function () {});
    it("should serialize and deserialize InclusionProof", function () {});
    it("should serialize and deserialize DataAggregationProof", function () {});
  });
});

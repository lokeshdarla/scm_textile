require("@matterlabs/hardhat-zksync-solc");
require("@matterlabs/hardhat-zksync-verify");
require("dotenv").config();  // Add this to load environment variables
require("@nomicfoundation/hardhat-ethers");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  defaultNetwork: "running",

  networks: {
    hardhat: {
      chainId: 1337,
    },

    running: {
      url: "http://localhost:8545",
      chainId: 1337,
    },
  },
};


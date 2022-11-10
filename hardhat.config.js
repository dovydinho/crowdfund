require('@nomicfoundation/hardhat-toolbox');
const keys = require('./keys.json');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${keys.ALCHEMY_API_KEY}`,
      accounts: {
        mnemonic: keys.MNEMONIC
      }
    },
    hardhat: {}
  },
  solidity: '0.8.17',
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './public/artifacts'
  }
};

let MyContract = artifacts.require('MyContract')
let LinkToken = artifacts.require('LinkToken')
let ContinuousToken = artifacts.require('ContinuousToken')
let Oracle = artifacts.require('Oracle')

const DECIMALS = 2;
const INITIAL_SUPPLY = web3.utils.toWei('1', 'ether');
const RESERVE_RATIO = 100000;
const GOVT = "0x8CFd0ae2538CDcdD2601915f77d72deCedcbBA8d";

module.exports = (deployer, network) => {
  // Local (development) networks need their own deployment of the LINK
  // token and the Oracle contract
  if (!network.startsWith('live')) {
    deployer.deploy(LinkToken).then(() => {
      return deployer.deploy(Oracle, LinkToken.address).then(() => {
        return deployer.deploy(ContinuousToken, 'Air Token', 'AIR', DECIMALS, INITIAL_SUPPLY, RESERVE_RATIO, GOVT).then(() => {
          return deployer.deploy(MyContract, LinkToken.address, ContinuousToken.address)
        })
      })
    })
  } else {
    // For live networks, use the 0 address to allow the ChainlinkRegistry
    // contract automatically retrieve the correct address for you
    deployer.deploy(ContinuousToken, 'Air Token', 'AIR', DECIMALS, INITIAL_SUPPLY, RESERVE_RATIO, GOVT).then(() => {
      return deployer.deploy(MyContract, '0x0000000000000000000000000000000000000000', ContinuousToken.address)
    })
  }
}

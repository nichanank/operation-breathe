const Token = artifacts.require('ContinuousToken')

/*
  This script makes it easy to read the data variable
  of the requesting contract.
*/

module.exports = async callback => {
  const t = await Token.deployed()
  const tx = await t.setTarget(400)
  callback(tx.tx)
}
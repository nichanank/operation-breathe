const MyContract = artifacts.require('MyContract')
const ContinuousToken = artifacts.require('ContinuousToken')
/*
  This script allows for a Chainlink request to be created from
  the requesting contract. Defaults to the Chainlink oracle address
  on this page: https://docs.chain.link/docs/testnet-oracles
*/

const oracleAddress =
  process.env.TRUFFLE_CL_BOX_ORACLE_ADDRESS ||
  '0x14301ce4eb78b591a5437bf4d6e592ba3ab1d742'
const jobId =
  process.env.TRUFFLE_CL_BOX_JOB_ID || '5a1667305a184dc98ccc5db3d6df34d0'
const payment = process.env.TRUFFLE_CL_BOX_PAYMENT || '1000000000000000000'
const url =
  process.env.TRUFFLE_CL_BOX_URL ||
  'http://api.airvisual.com/v2/'
const path = process.env.TRUFFLE_CL_BOX_JSON_PATH || 'data.current.pollution.aqius'
const times = process.env.TRUFFLE_CL_BOX_TIMES || '2'

module.exports = async callback => {
  const mc = await MyContract.deployed()
  const res = await ContinuousToken.deployed()
  console.log('Creating request on contract:', mc.address)
  const tx = await mc.createRequestTo(
    oracleAddress,
    web3.utils.toHex(jobId),
    payment,
    url,
    path,
    times,
  )

  const tx2 = await res.mint.call({from: '0xAF06950aa322877B640d9533163a19C739DA1a1D', value:100000000000000000})
  callback(tx.tx)
}

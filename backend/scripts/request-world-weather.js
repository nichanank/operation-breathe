const MyContract = artifacts.require('MyContract')

/*
  This script allows for a Chainlink request to be created from
  the requesting contract. Defaults to the Chainlink oracle address
  on this page: https://docs.chain.link/docs/testnet-oracles
*/

const oracleAddress =
  process.env.TRUFFLE_CL_BOX_ORACLE_ADDRESS ||
  '0x14301ce4eb78b591a5437bf4d6e592ba3ab1d742'
const jobId =
  process.env.TRUFFLE_CL_BOX_JOB_ID || '90c5e1b118cf487f9bdc631992a35a8f'
const payment = process.env.TRUFFLE_CL_BOX_PAYMENT || '1000000000000000000'
const url =
  process.env.TRUFFLE_CL_BOX_URL ||
  'http://api.worldweatheronline.com/premium/v1/weather.ashx'
const path = process.env.TRUFFLE_CL_BOX_JSON_PATH || 'data.weather.0.maxtempF'
const times = process.env.TRUFFLE_CL_BOX_TIMES || '2'

module.exports = async callback => {
  const mc = await MyContract.deployed()
  console.log('Creating request on contract:', mc.address)
  const tx = await mc.createRequestTo(
    oracleAddress,
    web3.utils.toHex(jobId),
    payment,
    url,
    path,
    times,
  )
  callback(tx.tx)
}
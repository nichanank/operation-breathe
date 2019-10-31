const MyContractC = require('./contracts/MyContract.json')

const getFirstNetwork = obj => {
  const k = Object.keys(obj)[0]
  const address = obj[k].address
  return address
}

const MyContract = {
  ABI: MyContractC.abi,
  address: getFirstNetwork(MyContractC.networks)
}

export default {
  MyContract,
}
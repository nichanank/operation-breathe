import { ethers } from 'ethers'
import MY_CONTRACT_ABI from '../constants/abis/MyContract'
import { MY_CONTRACT_ADDRESS } from '../constants/'
import UncheckedJsonRpcSigner from './signer'

export function getQueryParam(windowLocation, name) {
  var q = windowLocation.search.match(new RegExp('[?&]' + name + '=([^&#?]*)'))
  return q && q[1]
}

export function convertEpochToDatetime(epoch) {
  return new Date(epoch * 1000)
}

export async function getEvents(library, filter) {
  return library.getLogs(filter)
}

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null),
        object
      )
    : null
}

export function isAddress(value) {
  try {
    return ethers.utils.getAddress(value)
  } catch {
    return false
  }
}

// get the whether a given address is an admin
export async function getIsAdmin(library, address) {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  var admin = await getContract(library, "MyContract").owner()
  return admin === address
}

// get the whether a given address is an admin
export async function getLatestOracleCall(library) {
  var timestamp = await getContract(library, "MyContract").latestCallToOracle()
  return timestamp
}

export async function getIsManager(library, id, address) {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return getContract(library, "PartnerRegistry").isManager(id, address)
}

export async function getUserSubmissions(library, address) {
  const myContract = getContract(library, "MyContract")
  const filter = myContract.filters.ClaimSubmitted(null, address, null)
  filter.fromBlock = 0
  filter.toBlock = "latest"
  return getEvents(library, filter)
}

export async function getPendingSubmissions(library) {
  const myContract = getContract(library, "MyContract")
  const allFilter = myContract.filters.ClaimSubmitted()
  allFilter.fromBlock = 0
  allFilter.toBlock = "latest"
  
  const reviewedFilter = myContract.filters.ClaimReviewed()
  reviewedFilter.fromBlock = 0
  reviewedFilter.toBlock = "latest"

  var all = await getEvents(library, allFilter)
  var reviewed = await getEvents(library, reviewedFilter)
  
  var allIds = []
  var reviewedIds = []
  
  all.map((log, k) => allIds.push(Number(log.topics[1])))
  reviewed.map((log, k) => reviewedIds.push(Number(log.topics[1])))

  return allIds.filter(id => !reviewedIds.includes(id))
  
}

// get the last token balance of an address
export async function getOwnedTokens(library, address) {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return getContract(library, "Last").ownedTokens(address)
}

// account is optional
export function getProviderOrSigner(library, account) {
  return account ? new UncheckedJsonRpcSigner(library.getSigner(account)) : library
}

export function getContract(library, contractName, account) {
  switch (contractName) {
    case "MyContract":
      return new ethers.Contract(MY_CONTRACT_ADDRESS, MY_CONTRACT_ABI, getProviderOrSigner(library, account))
    // case "AccessControl":
    //   return new ethers.Contract(contracts.AccessControl.address, contracts.AccessControl.ABI, getProviderOrSigner(library, account))
    default:
      return null
  }
}

export function shortenAddress(address, digits = 4) {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${address.substring(0, digits + 2)}...${address.substring(42 - digits)}`
}

export function calculateGasMargin(value, margin) {
  const offset = value.mul(margin).div(ethers.utils.bigNumberify(10000))
  return value.add(offset)
}

// amount must be a BigNumber, {base,display}Decimals must be Numbers
export function amountFormatter(amount, baseDecimals = 18, displayDecimals = 3, useLessThan = true) {
  if (baseDecimals > 18 || displayDecimals > 18 || displayDecimals > baseDecimals) {
    throw Error(`Invalid combination of baseDecimals '${baseDecimals}' and displayDecimals '${displayDecimals}.`)
  }

  // if balance is falsy, return undefined
  if (!amount) {
    return undefined
  }
  // if amount is 0, return
  else if (amount.isZero()) {
    return '0'
  }
  // amount > 0
  else {
    // amount of 'wei' in 1 'ether'
    const baseAmount = ethers.utils.bigNumberify(10).pow(ethers.utils.bigNumberify(baseDecimals))

    const minimumDisplayAmount = baseAmount.div(
      ethers.utils.bigNumberify(10).pow(ethers.utils.bigNumberify(displayDecimals))
    )

    // if balance is less than the minimum display amount
    if (amount.lt(minimumDisplayAmount)) {
      return useLessThan
        ? `<${ethers.utils.formatUnits(minimumDisplayAmount, baseDecimals)}`
        : `${ethers.utils.formatUnits(amount, baseDecimals)}`
    }
    // if the balance is greater than the minimum display amount
    else {
      const stringAmount = ethers.utils.formatUnits(amount, baseDecimals)

      // if there isn't a decimal portion
      if (!stringAmount.match(/\./)) {
        return stringAmount
      }
      // if there is a decimal portion
      else {
        const [wholeComponent, decimalComponent] = stringAmount.split('.')
        const roundUpAmount = minimumDisplayAmount.div(ethers.constants.Two)
        const roundedDecimalComponent = ethers.utils
          .bigNumberify(decimalComponent.padEnd(baseDecimals, '0'))
          .add(roundUpAmount)
          .toString()
          .padStart(baseDecimals, '0')
          .substring(0, displayDecimals)

        // decimals are too small to show
        if (roundedDecimalComponent === '0'.repeat(displayDecimals)) {
          return wholeComponent
        }
        // decimals are not too small to show
        else {
          return `${wholeComponent}.${roundedDecimalComponent.toString().replace(/0*$/, '')}`
        }
      }
    }
  }
}

export function checkSupportedTheme(themeName) {
  if (themeName && themeName === "LIGHT" || themeName === "DARK") {
    return themeName.toUpperCase()
  }
  return null
}
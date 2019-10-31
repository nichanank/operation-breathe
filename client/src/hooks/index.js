import { useState, useEffect, useMemo, useCallback } from 'react'
import { useWeb3Context } from 'web3-react'
import copy from 'copy-to-clipboard'
import { getContract, getEvents, getOwnedTokens } from '../utils'

export function useEvents(filter) {
  const { library } = useWeb3Context()

  return useMemo(() => {
    try {
      return getEvents(library, filter)
    } catch {
      return null
    }
  }, [library, filter])
}

// returns null on errors
export function useContract(contractName, withSignerIfPossible = true) {
  const { library, account } = useWeb3Context()

  return useMemo(() => {
    try {
      return getContract(library, contractName, withSignerIfPossible ? account : undefined)
    } catch {
      return null
    }
  }, [library, contractName, withSignerIfPossible, account])
}

export function useMyContract(withSignerIfPossible = true) {
  const { library, account } = useWeb3Context()

  return useMemo(() => {
    try {
      return getContract(library, 'MyContract', withSignerIfPossible ? account : undefined)
    } catch {
      return null
    }
  }, [library, withSignerIfPossible, account])
}

// modified from https://usehooks.com/useKeyPress/
export function useModalKeyDown(targetKey, onKeyDown, suppressOnKeyDown = false) {
  const downHandler = useCallback(
    event => {
      const {
        target: { tagName },
        key
      } = event
      if (key === targetKey && tagName === 'DIV' && !suppressOnKeyDown) {
        event.preventDefault()
        onKeyDown()
      }
    },
    [targetKey, onKeyDown, suppressOnKeyDown]
  )

  useEffect(() => {
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [downHandler])
}
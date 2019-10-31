  
import React, { useReducer, useEffect, useRef } from 'react'
import { useWeb3Context, Connectors } from 'web3-react'
import { ethers } from 'ethers'
import styled from 'styled-components'
import { darken, transparentize } from 'polished'
import Jazzicon from 'jazzicon'
import { Activity } from 'react-feather'
import { Spinner } from '../../theme'
import Circle from '../../assets/img/circle.svg'

const { Connector } = Connectors

const Web3StatusGeneric = styled.button`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  font-size: 0.9rem;
  align-items: center;
  padding: 0.5rem;
  border-radius: 2rem;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.salmonRed};
  border: 1px solid ${({ theme }) => theme.salmonRed};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.salmonRed)};
  }
`

const Web3StatusConnect = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.royalBlue};
  border: 1px solid ${({ theme }) => theme.royalBlue};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.royalBlue)};
  }
`

const Web3StatusConnected = styled(Web3StatusGeneric)`
  background-color: ${({ pending, theme }) => (pending ? theme.zumthorBlue : theme.inputBackground)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.royalBlue : theme.mercuryGray)};
  color: ${({ theme }) => theme.royalBlue};
  font-weight: 400;
  :hover {
    /* > P {
      color: ${({ theme }) => theme.uniswapPink};
    } */
    background-color: ${({pending, theme}) =>
      pending ? transparentize(0.9, theme.royalBlue) : darken(0.05, theme.inputBackground)};
    
  :focus {
    border: 1px solid
    ${({ pending, theme }) => (pending ? darken(0.1, theme.royalBlue) : darken(0.1, theme.mercuryGray))};
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 0.83rem;
`

const Identicon = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  background-color: ${({ theme }) => theme.silverGray};
`

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

const SpinnerWrapper = styled(Spinner)`
  margin: 0 0.25rem 0 0.25rem;
`

const walletModalInitialState = {
  open: false,
  error: undefined
}

const WALLET_MODAL_ERROR = 'WALLET_MODAL_ERROR'
const WALLET_MODAL_OPEN = 'WALLET_MODAL_OPEN'
const WALLET_MODAL_OPEN_ERROR = 'WALLET_MODAL_OPEN_ERROR'
const WALLET_MODAL_CLOSE = 'WALLET_MODAL_CLOSE'

function walletModalReducer(state, { type, payload }) {
  switch (type) {
    case WALLET_MODAL_ERROR: {
      const { error } = payload
      return { ...state, error }
    }
    case WALLET_MODAL_OPEN: {
      return { ...state, open: true }
    }
    case WALLET_MODAL_OPEN_ERROR: {
      const { error } = payload || {}
      return { open: true, error }
    }
    case WALLET_MODAL_CLOSE: {
      return { ...state, open: false }
    }
    default: {
      throw Error(`Unexpected action type in walletModalReducer reducer: '${type}'.`)
    }
  }
}

export default function Web3Status() {
  const { active, account, connectorName, setConnector } = useWeb3Context()

  const [{ open: walletModalIsOpen, error: walletModalError }, dispatch] = useReducer(
    walletModalReducer,
    walletModalInitialState
  )
  function setError(error) {
    dispatch({ type: WALLET_MODAL_ERROR, payload: { error } })
  }
  function openWalletModal(error) {
    dispatch({ type: WALLET_MODAL_OPEN, ...(error ? { payload: { error } } : {}) })
  }
  function closeWalletModal() {
    dispatch({ type: WALLET_MODAL_CLOSE })
  }

  useEffect(() => {
    // if the injected connector is not active...
    const { ethereum } = window
    if (connectorName !== 'Injected') {
      if (connectorName === 'Network' && ethereum && ethereum.on && ethereum.removeListener) {
        function tryToActivateInjected() {
          const library = new ethers.providers.Web3Provider(window.ethereum)
          // if calling enable won't pop an approve modal, then try to activate injected...
          library.listAccounts().then(accounts => {
            if (accounts.length >= 1) {
              setConnector('Injected', { suppressAndThrowErrors: true })
                .then(() => {
                  console.log('success')
                })
                .catch(error => {
                  // ...and if the error is that they're on the wrong network, display it, otherwise eat it
                  if (error.code === Connector.errorCodes.UNSUPPORTED_NETWORK) {
                    console.log('error: ' + error)
                  }
                })
            }
          })
        }

        ethereum.on('networkChanged', tryToActivateInjected)
        ethereum.on('accountsChanged', tryToActivateInjected)

        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener('networkChanged', tryToActivateInjected)
            ethereum.removeListener('accountsChanged', tryToActivateInjected)
          }
        }
      }
    } else {
      // ...poll to check the accounts array, and if it's ever 0 i.e. the user logged out, update the connector
      if (ethereum) {
        const accountPoll = setInterval(() => {
          const library = new ethers.providers.Web3Provider(ethereum)
          library.listAccounts().then(accounts => {
            if (accounts.length === 0) {
              setConnector('Network')
            }
          })
        }, 750)

        return () => {
          clearInterval(accountPoll)
        }
      }
    }
  }, [connectorName, setConnector])

  function onClick() {
    if (walletModalError) {
      openWalletModal()
    } else if (connectorName === 'Network' && (window.ethereum || window.web3)) {
      setConnector('Injected', { suppressAndThrowErrors: true }).catch(error => {
        if (error.code === Connector.errorCodes.UNSUPPORTED_NETWORK) {
          setError(error)
        }
      })
    } else {
      console.log('wallet clicked')
    }
  }

  const ref = useRef()
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = ''
      if (account) {
        ref.current.appendChild(Jazzicon(16, parseInt(account.slice(2, 10), 16)))
      }
    }
  }, [account, walletModalError])

  function getWeb3Status() {
    if (walletModalError) {
      // we're guaranteed that the error is a wrong network error
      return (
        <Web3StatusError onClick={onClick}>
          <NetworkIcon />
          <Text>Wrong Network</Text>
        </Web3StatusError>
      )
    } else if (!account) {
      return (
        <Web3StatusConnect onClick={onClick}>
          <Text>Connect</Text>
        </Web3StatusConnect>
      )
    } else {
      return (
          <Web3StatusConnected onClick={onClick} pending={false}>
          <Text>{account}</Text>
          <Identicon ref={ref} />
        </Web3StatusConnected>
      )
    }
  }

  return (
    active && (
      <>
        {getWeb3Status()}
      </>
    )
  )
}
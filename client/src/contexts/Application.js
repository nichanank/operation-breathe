import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import { safeAccess, getIsAdmin } from '../utils'

const BLOCK_NUMBER = 'BLOCK_NUMBER'
const ACCESS_STATUS = 'ACCESS_STATUS'

const UPDATE_BLOCK_NUMBER = 'UPDATE_BLOCK_NUMBER'
const UPDATE_ACCESS_STATUS = 'UPDATE_ACCESS_STATUS'

const ApplicationContext = createContext()

function useApplicationContext() {
  return useContext(ApplicationContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_BLOCK_NUMBER: {
      const { networkId, blockNumber } = payload
      return {
        ...state,
        [BLOCK_NUMBER]: {
          ...(safeAccess(state, [BLOCK_NUMBER]) || {}),
          [networkId]: blockNumber
        }
      }
    }
    case UPDATE_ACCESS_STATUS: {
      const { isAdmin, isCLevel, networkId, account } = payload
      return {
        ...state,
        [ACCESS_STATUS] :{
          [networkId]: {
            ...(safeAccess(state, [networkId]) || {}),
            [account]: {
              ...(safeAccess(state, [networkId, account]) || {}),
              isAdmin,
              isCLevel
            }
          }
        }
      }
    }
    default: {
      throw Error(`Unexpected action type in ApplicationContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    [BLOCK_NUMBER]: {},
  })

  const updateBlockNumber = useCallback((networkId, blockNumber) => {
    dispatch({ type: UPDATE_BLOCK_NUMBER, payload: { networkId, blockNumber } })
  }, [])

  const updateAccessStatus = useCallback((isAdmin, isCLevel, networkId, account) => {
    dispatch({ type: UPDATE_ACCESS_STATUS, payload: { isAdmin, isCLevel, networkId, account } })
  }, [])

  return (
    <ApplicationContext.Provider
      value={useMemo(() => [state, { updateBlockNumber, updateAccessStatus }], [state, updateBlockNumber, updateAccessStatus])}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function Updater() {
  const { networkId, library } = useWeb3Context()
  const [, { updateBlockNumber }] = useApplicationContext()

  // update block number
  useEffect(() => {
    if (library) {
      let stale = false

      function update() {
        library
          .getBlockNumber()
          .then(blockNumber => {
            if (!stale) {
              updateBlockNumber(networkId, blockNumber)
            }
          })
          .catch(() => {
            if (!stale) {
              updateBlockNumber(networkId, null)
            }
          })
      }

      update()
      library.on('block', update)

      return () => {
        stale = true
        library.removeListener('block', update)
      }
    }
  }, [networkId, library, updateBlockNumber])

  return null
}

export function useBlockNumber() {
  const { networkId } = useWeb3Context()

  const [state] = useApplicationContext()

  return safeAccess(state, [BLOCK_NUMBER, networkId])
}

export function useAdminStatus() {
  const { library, networkId, account } = useWeb3Context()
  const [state, { updateAccessStatus }] = useApplicationContext()
  const { isAdmin } = safeAccess(state, [ACCESS_STATUS, networkId, account]) || {}
  
  const fetchAdminStatus = async () => {
    if (!!library && !!account) {
      let updatedAdminStatus = false
      let updatedCLevelStatus = false
      const adminStatus = await getIsAdmin(library, account).catch(() => null)
      if (!!adminStatus) {
      updatedAdminStatus = adminStatus
      }
      updateAccessStatus(updatedAdminStatus, updatedCLevelStatus, networkId, account)
    }
  }
  useMemo(fetchAdminStatus, [account])
  return isAdmin
}
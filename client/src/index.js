// import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'

// const Network = new NetworkOnlyConnector({ providerURL: process.env.REACT_APP_NETWORK_URL || '' })
// const Injected = new InjectedConnector({ supportedNetworks: [Number(process.env.REACT_APP_NETWORK_ID || '1')] })
// const connectors = { Injected, Network }
// console.log(process.env.REACT_APP_NETWORK_ID)
import { connectors } from './connectors'

import Web3Provider from 'web3-react'
import ThemeProvider, { GlobalStyle } from './theme'

import App from './pages/App'
// import './i18n'

import LocalStorageContextProvider, { Updater as LocalStorageContextUpdater } from './contexts/LocalStorage'
import ApplicationContextProvider, { Updater as ApplicationContextUpdater } from './contexts/Application'
import TransactionContextProvider, { Updater as TransactionContextUpdater } from './contexts/Transactions'

require('./pages/App.css')
require('materialize-css/dist/css/materialize.min.css')
require('materialize-css')

function ContextProviders({ children }) {
  return (
    <LocalStorageContextProvider>
      <ApplicationContextProvider>
        <TransactionContextProvider>
            {children}
        </TransactionContextProvider>
      </ApplicationContextProvider>
    </LocalStorageContextProvider>
  )
}

function Updaters() {
  return (
    <>
      <LocalStorageContextUpdater />
      <ApplicationContextUpdater />
      <TransactionContextUpdater />
    </>
  )
}

ReactDOM.render(
      <Web3Provider 
        connectors={connectors}
        libraryName={"ethers.js"}>
        <ContextProviders>
          <Updaters />
          <ThemeProvider>
            <>
              <GlobalStyle />
              <App />
            </>
        </ThemeProvider>
        </ContextProviders>
      </Web3Provider>
  , document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

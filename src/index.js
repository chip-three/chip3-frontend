import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { ProSidebarProvider } from 'react-pro-sidebar';
import { polygon, polygonMumbai} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import {
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';

const { chains, provider } = configureChains(
  [ polygon, polygonMumbai],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Chip3 Platform',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider theme={darkTheme()} chains={chains}>
      <BrowserRouter>
        <React.StrictMode>
          <ProSidebarProvider>
            <App />
          </ProSidebarProvider>
        </React.StrictMode>
      </BrowserRouter>
    </RainbowKitProvider>
  </WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

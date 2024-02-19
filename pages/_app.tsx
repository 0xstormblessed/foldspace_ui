import '../styles/global.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import {
    RainbowKitProvider,
    getDefaultWallets,
    Locale,
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider } from 'wagmi';
import { optimism } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { wallets } = getDefaultWallets();

if (process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL) {
    console.log(
        'Using custom RPC URL:',
        process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL,
    );
}

const config = getDefaultConfig({
    appName: 'FoldSpace NFT',
    projectId:
        process.env.NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    wallets: [
        ...wallets,
        {
            groupName: 'Other',
            wallets: [argentWallet, trustWallet, ledgerWallet],
        },
    ],
    chains: [
        {
            ...optimism,
            rpcUrls: {
                default: {
                    http: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL
                        ? [process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL]
                        : ['https://mainnet.optimism.io'],
                },
            },
        },
    ],
    ssr: true,
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
    const { locale } = useRouter() as { locale: Locale };
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider initialChain={10} locale={locale}>
                    <Component {...pageProps} />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default MyApp;

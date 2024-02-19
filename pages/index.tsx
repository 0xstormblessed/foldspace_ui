import React, { useEffect, useState } from 'react';
import * as dotenv from 'dotenv';
dotenv.config();
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import {
    type BaseError,
    useAccount,
    useBalance,
    useReadContracts,
    useWriteContract,
    useWaitForTransactionReceipt,
} from 'wagmi';
import { formatEther, Address } from 'viem';
import ListCards from '../components/ListCards';
import {
    foldspaceContractConfig,
    farcasterIdRegistryConfig,
    getTokenIdsFromOwner,
    getTokensInfo,
} from '../utils/foldspace';
import { TokenInfo } from '../utils/types';

const FOLDSPACE_CONTRACT = process.env.NEXT_PUBLIC_FOLDSPACE_ADDRESS;

console.log('FOLDSPACE_CONTRACT:', FOLDSPACE_CONTRACT);

const Home: NextPage = () => {
    const { address, isConnected } = useAccount();
    // Adjust useBalance to conditionally fetch based on address availability
    const {
        data: balance,
        isError,
        isLoading,
    } = useBalance({
        address: address,
    });

    const [tokenIds, setTokenIds] = useState<bigint[]>();
    const [tokensInfo, setTokensInfo] = useState<TokenInfo[]>();
    const [isTokenIdsLoading, setIsTokenIdsLoading] = useState(false);
    const [isTokensInfoLoading, setIsTokensInfoLoading] = useState(false);

    const {
        data,
        error: readError,
        isPending: isPendingRead,
    } = useReadContracts({
        contracts: [
            {
                ...foldspaceContractConfig,
                functionName: 'balanceOf',
                args: [address],
            },
            {
                ...foldspaceContractConfig,
                functionName: 'price',
                args: [],
            },
            {
                ...farcasterIdRegistryConfig,
                functionName: 'idOf',
                args: [address],
            },
        ],
    });
    const [balanceOfResult, priceResult, fidOfAddress] = data || [];

    let price: bigint | undefined = undefined;
    let balanceOf: bigint | undefined = 0n;
    let fid: bigint | undefined = 0n;

    if (priceResult && priceResult.result) {
        price = priceResult.result as bigint;
    }
    if (balanceOfResult && balanceOfResult.result) {
        balanceOf = balanceOfResult.result as bigint;
    }

    if (fidOfAddress && fidOfAddress.result) {
        fid = fidOfAddress.result as bigint;
    }

    const fetchTokenIds = async () => {
        if (address && balanceOf) {
            try {
                setIsTokenIdsLoading(true);
                const ids = await getTokenIdsFromOwner(address, balanceOf);
                setTokenIds(ids);
                setIsTokenIdsLoading(false);
            } catch (error) {
                setIsTokenIdsLoading(false);
                console.error('Failed to fetch token IDs', error);
            }
        } else {
            // reset token IDs or handle the disconnected state
            setTokenIds([]);
        }
    };

    const fetchTokensInfo = async () => {
        if (tokenIds && tokenIds.length > 0) {
            try {
                setIsTokensInfoLoading(true);
                const info = await getTokensInfo(tokenIds);
                setTokensInfo(info);
                setIsTokensInfoLoading(false);
            } catch (error) {
                setIsTokensInfoLoading(false);
            }
        } else {
            setTokensInfo([]);
        }
    };

    useEffect(() => {
        fetchTokenIds();
    }, [address, balanceOf]); // Re-run this effect if the 'address' changes

    // Effect to fetch token info whenever tokenIds are updated
    useEffect(() => {
        fetchTokensInfo();
    }, [tokenIds]); // Depends on tokenIds

    const { data: hash, isPending, error, writeContract } = useWriteContract();

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (FOLDSPACE_CONTRACT === undefined) {
            throw new Error('FOLDSPACE_CONTRACT is not defined');
        }
        if (price === undefined) {
            throw new Error('unable to fetch price');
        }

        if (price) {
            writeContract({
                ...foldspaceContractConfig,
                functionName: 'mint',
                args: [],
                value: price,
            });
        }
        fetchTokenIds();
    }

    const updateTokenCallback = () => {
        fetchTokenIds();
    };

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: 12,
                }}
            >
                <ConnectButton showBalance={true} />
            </div>
            <Container maxWidth="sm">
                {isConnected && address && (
                    <>
                        <h1>My FoldSpace NFTs</h1>
                        {isPendingRead ||
                        isTokenIdsLoading ||
                        isTokensInfoLoading ? (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '20px',
                                }}
                            >
                                <CircularProgress />
                            </div>
                        ) : readError ? (
                            <div>
                                Error fetching account info. Please reload
                            </div>
                        ) : (
                            <>
                                {
                                    <div>
                                        {fid && fid > 0n
                                            ? `Connected Wallet Registered FID: ${fid}`
                                            : `Wallet has no registered FID`}
                                        <div>
                                            Number of FoldSpace NFTs Owned:{' '}
                                            {balanceOf.toString()}
                                        </div>
                                    </div>
                                }{' '}
                                {isLoading ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            padding: '20px',
                                        }}
                                    >
                                        <CircularProgress />
                                    </div>
                                ) : (
                                    <>
                                        {price && (
                                            <div>
                                                Price to Mint in ETH:{' '}
                                                {formatEther(price)}
                                            </div>
                                        )}
                                        <form onSubmit={submit}>
                                            <button
                                                disabled={isPending}
                                                type="submit"
                                            >
                                                {isPending
                                                    ? 'Confirming...'
                                                    : 'Mint'}
                                            </button>
                                            {hash && (
                                                <div>
                                                    Transaction:
                                                    https://optimistic.etherscan.io/tx/
                                                    {hash}
                                                </div>
                                            )}
                                        </form>
                                    </>
                                )}
                                {isConfirming && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            padding: '20px',
                                        }}
                                    >
                                        <CircularProgress />
                                    </div>
                                )}
                                {isConfirmed && (
                                    <div>Transaction confirmed.</div>
                                )}
                                {error && (
                                    <div>
                                        Error:{' '}
                                        {(error as BaseError).stack ||
                                            error.message}
                                    </div>
                                )}
                                {tokensInfo && (
                                    <ListCards
                                        tokensInfo={tokensInfo}
                                        tokenUpdateCallback={
                                            updateTokenCallback
                                        }
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
};

export default Home;

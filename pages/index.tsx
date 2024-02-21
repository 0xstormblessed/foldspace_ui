import React, { useEffect, useState } from 'react';
import * as dotenv from 'dotenv';
dotenv.config();
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import {
    Box,
    Tab,
    Tabs,
    Typography,
    Container,
    CircularProgress,
} from '@mui/material';
import {
    type BaseError,
    useAccount,
    useBalance,
    useReadContracts,
    useWriteContract,
    useWaitForTransactionReceipt,
} from 'wagmi';
import { formatEther, Address, isAddress, getAddress } from 'viem';
import {
    foldspaceContractConfig,
    farcasterIdRegistryConfig,
    getTokenIdsFromOwner,
    getTokensInfo,
} from '../utils/foldspace';
import { TokenInfo } from '../utils/types';
import MintForm from '../components/MintForm';
import MyNFTs from '../components/MyNFTs';

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

    const [tabValue, setTabValue] = useState(0);

    const [tokenIds, setTokenIds] = useState<bigint[]>();
    const [tokensInfo, setTokensInfo] = useState<TokenInfo[]>();
    const [isTokenIdsLoading, setIsTokenIdsLoading] = useState(false);
    const [isTokensInfoLoading, setIsTokensInfoLoading] = useState(false);
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [isRecipentAddressValid, setIsRecipientAddressValid] =
        useState<boolean>(true);
    const [isPendingValidAddress, setIsPendingValidAddress] = useState(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleAddressChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ): void => {
        const inputAddress: string = event.target.value.trim();
        setRecipientAddress(inputAddress);

        // If the address is empty, it's considered valid (optional field)
        if (!inputAddress && inputAddress.length === 0) {
            setIsRecipientAddressValid(true);
            return;
        }

        // Validate the address format if it's not empty
        try {
            if (isAddress(inputAddress)) {
                setIsRecipientAddressValid(true);
            } else {
                setIsRecipientAddressValid(false);
            }
        } catch {
            setIsRecipientAddressValid(false);
        }
    };

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
        console.log('click submit');

        if (FOLDSPACE_CONTRACT === undefined) {
            throw new Error('FOLDSPACE_CONTRACT is not defined');
        }
        if (price === undefined) {
            throw new Error('unable to fetch price');
        }

        let recipient = address;

        if (
            recipientAddress &&
            recipientAddress.length > 0 &&
            isRecipentAddressValid
        ) {
            recipient = getAddress(recipientAddress);
            console.log('recipient:', recipient);
        }

        if (price) {
            writeContract({
                ...foldspaceContractConfig,
                functionName: 'mintFor',
                args: [recipient],
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
                        <Box sx={{ typography: 'h2' }}>FoldSpace NFTs</Box>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                aria-label="FoldSpace NFTs tabs"
                            >
                                <Tab label="Mint" />
                                <Tab label="My NFTs" />
                            </Tabs>
                        </Box>
                        {tabValue === 0 && (
                            <>
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
                                        Error fetching account info. Please
                                        reload
                                    </div>
                                ) : (
                                    <>
                                        {
                                            <div>
                                                {/* use box for typography */}
                                                {fid && fid > 0n ? (
                                                    <Box
                                                        sx={{
                                                            typography:
                                                                'paragraph',
                                                        }}
                                                    >{`Connected Wallet Registered FID: ${fid}`}</Box>
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            typography:
                                                                'paragraph',
                                                        }}
                                                    >{`Wallet has no registered FID`}</Box>
                                                )}
                                                <div>
                                                    <Box
                                                        sx={{
                                                            typography:
                                                                'paragraph',
                                                        }}
                                                    >
                                                        Number of FoldSpace NFTs
                                                        Owned:{' '}
                                                        {balanceOf.toString()}{' '}
                                                    </Box>
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
                                                    <Box
                                                        sx={{
                                                            typography:
                                                                'paragraph',
                                                        }}
                                                    >
                                                        Price to Mint in ETH:{' '}
                                                        {formatEther(price)}
                                                    </Box>
                                                )}

                                                <MintForm
                                                    isPending={isPending}
                                                    isRecipentAddressValid={
                                                        isRecipentAddressValid
                                                    }
                                                    recipientAddress={
                                                        recipientAddress
                                                    }
                                                    handleAddressChange={
                                                        handleAddressChange
                                                    }
                                                    submit={submit}
                                                />
                                                {hash && (
                                                    <div>
                                                        Transaction:
                                                        https://optimistic.etherscan.io/tx/
                                                        {hash}
                                                    </div>
                                                )}
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
                                    </>
                                )}
                            </>
                        )}
                        {tabValue === 1 && (
                            <MyNFTs
                                tokensInfo={tokensInfo}
                                updateTokenCallback={updateTokenCallback}
                            />
                        )}
                    </>
                )}
            </Container>
        </div>
    );
};

export default Home;

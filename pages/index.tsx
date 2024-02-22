import React, { useEffect, useState } from 'react';
import * as dotenv from 'dotenv';
dotenv.config();
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import { Box, Tab, Tabs, Container, CircularProgress } from '@mui/material';
import {
    type BaseError,
    useAccount,
    useBalance,
    useReadContracts,
    useWriteContract,
    useWaitForTransactionReceipt,
} from 'wagmi';
import { isAddress, getAddress } from 'viem';
import {
    foldspaceContractConfig,
    farcasterIdRegistryConfig,
    getTokenIdsFromOwner,
    getTokensInfo,
} from '../utils/foldspace';
import { TokenInfo } from '../utils/types';
import MintForm from '../components/MintForm';
import MyNFTs from '../components/MyNFTs';
import MintHeaderInfo from '../components/MintHeaderInfo';
import TrxStatusModal from '../components/TrxStatusModal';

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

    const [isOpenTrxStatusModalMint, setIsOpenTrxStatusModalMint] =
        useState(false);

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
            setIsOpenTrxStatusModalMint(true);
        }
        fetchTokenIds();
    }

    const updateTokenCallback = () => {
        fetchTokenIds();
    };

    const handleTrxStatusModalMintClose = () => {
        setIsOpenTrxStatusModalMint(false);
        updateTokenCallback();
    };

    /*     const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        }); */

    useEffect(() => {
        fetchTokenIds();
    }, [address, balanceOf]); // Re-run this effect if the 'address' changes

    // Effect to fetch token info whenever tokenIds are updated
    useEffect(() => {
        fetchTokensInfo();
    }, [tokenIds]); // Depends on tokenIds

    return (
        <div>
            <Container maxWidth="lg">
                {' '}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: 12,
                    }}
                >
                    <ConnectButton showBalance={true} />
                </div>
                <Box
                    sx={{
                        typography: 'h2',
                        textAlign: 'center',
                        marginTop: '20px',
                    }}
                >
                    FoldSpace NFT
                </Box>
                {!isConnected && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginTop: '20px',
                        }}
                    >
                        <Box
                            sx={{
                                typography: 'body1', // Use 'body1' or 'body2' for paragraph text as 'paragraph' is not a valid value
                                textAlign: 'center',
                                marginTop: '20px',
                            }}
                        >
                            Connect your wallet to foldspace into Farcaster
                        </Box>
                        <Box
                            component="img"
                            src="/images/gate.webp"
                            alt="FoldSpace Landing Image"
                            sx={{
                                width: '100%', // Make the image responsive
                                maxWidth: '600px', // Adjust this value based on your design requirements
                                height: 'auto', // Maintain aspect ratio
                                marginTop: '20px',
                            }}
                        />
                    </div>
                )}
            </Container>
            <Container maxWidth="sm">
                {isConnected && address && (
                    <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                aria-label="FoldSpace NFT tabs"
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
                                                    <MintHeaderInfo
                                                        fid={fid}
                                                        balanceOf={balanceOf}
                                                        price={price}
                                                    />
                                                )}

                                                <MintForm
                                                    isLoading={
                                                        isLoading || isPending
                                                    }
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
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {tabValue === 1 && (
                            <MyNFTs
                                tokensInfo={tokensInfo}
                                hasFid={fid && fid > 0n ? true : false}
                                updateTokenCallback={updateTokenCallback}
                            />
                        )}
                    </>
                )}
                {hash && (
                    <TrxStatusModal
                        isOpen={isOpenTrxStatusModalMint}
                        onClose={handleTrxStatusModalMintClose}
                        hash={hash}
                        confirmingText="Confirming mint transaction..."
                        confirmedText="Mint Transaction confirmed!"
                    />
                )}
            </Container>
        </div>
    );
};

export default Home;

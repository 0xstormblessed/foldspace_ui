import * as React from 'react';
import * as dotenv from 'dotenv';
dotenv.config();
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import { 
    type BaseError,
    useAccount, 
    useBalance, 
    useReadContract,
    useWriteContract, 
    useWaitForTransactionReceipt 
} from 'wagmi';
import { formatEther, parseEther } from 'viem'
import FoldSpace from "../abi/FoldSpace.json";


const FOLDSPACE_CONTRACT = process.env.NEXT_PUBLIC_FOLDSPACE_ADDRESS;

console.log('FOLDSPACE_CONTRACT:', FOLDSPACE_CONTRACT);


const Home: NextPage = () => {
    const { address, isConnected } = useAccount();
    // Adjust useBalance to conditionally fetch based on address availability
    const { data: balance, isError, isLoading } = useBalance({
        address: address
    });

    const wagmiContractConfig = {
        address: FOLDSPACE_CONTRACT as `0x${string}`,
        abi: FoldSpace.abi,
    };

    const { data, isLoading: isLoadingPrice } = useReadContract({
        ...wagmiContractConfig,
        functionName: 'price',
        args: [],
    })
    
    const price: bigint = data as bigint;

    const { data: hash, isPending, error, writeContract } = useWriteContract();

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (FOLDSPACE_CONTRACT === undefined) {
            throw new Error('FOLDSPACE_CONTRACT is not defined');
        }
        console.log(`sending transaction with price: ${price}...`);
        console.log('wagmiContractConfig:', wagmiContractConfig);
        
        writeContract({
            ...wagmiContractConfig,
            functionName: 'mint',
            args: [],
            value: BigInt(price),
        });
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } = 
        useWaitForTransactionReceipt({ 
        hash, 
     }) 

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: 12,
                }}
            >
                <ConnectButton />
            </div>
            <Container maxWidth="sm">
                {isConnected && address && (
                    <>
                        <div>Account: {address}</div>
                        {isLoading ? (
                            <div>Loading balance...</div>
                        ) : isError ? (
                            <div>Error fetching balance.</div>
                        ) : (
                            <div>Balance: {balance?.formatted} ETH</div>
                        )}
                        {price && <div>Minting Price ETH: {formatEther(price)}</div>} 
                        <form onSubmit={submit}>
                            <button disabled={isPending} type="submit">
                                { isPending ? 'Confirming...' : 'Mint'} 
                            </button>
                            { hash && <div>Transaction: https://optimistic.etherscan.io/tx/{hash}</div>}
                            {isConfirming && <div>Waiting for confirmation...</div>} 
                            {isConfirmed && <div>Transaction confirmed.</div>} 
                            {error && ( 
                                <div>Error: {(error as BaseError).stack || error.message}</div> 
                            )}
                        </form>
                        
                    </>
                )}
            </Container>
        </div>
    );
};

export default Home;

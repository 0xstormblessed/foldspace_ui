import React, { useEffect, useState } from 'react';
import * as dotenv from 'dotenv';
dotenv.config();
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import { 
    type BaseError,
    useAccount, 
    useBalance, 
    useReadContracts,
    useReadContract,
    useWriteContract, 
    useWaitForTransactionReceipt 
} from 'wagmi';
import { formatEther } from 'viem'
import ListCards from '../components/ListCards';
import { foldspaceContractConfig, getTokenIdsFromOwner } from '../utils/foldspace';



const FOLDSPACE_CONTRACT = process.env.NEXT_PUBLIC_FOLDSPACE_ADDRESS;

console.log('FOLDSPACE_CONTRACT:', FOLDSPACE_CONTRACT);


const Home: NextPage = () => {
    const { address, isConnected } = useAccount();
    // Adjust useBalance to conditionally fetch based on address availability
    const { data: balance, isError, isLoading } = useBalance({
        address: address
    });

    const [tokenIds, setTokenIds] = useState<bigint[]>();
    
    const { 
        data,
        error: readError,
        isPending: isPendingRead
      } = useReadContracts({ 
        contracts: [{ 
          ...foldspaceContractConfig,
          functionName: 'balanceOf',
          args: [address],
        }, { 
          ...foldspaceContractConfig, 
          functionName: 'price', 
          args: [], 
        }] 
      }) 
    const  [balanceOfResult, priceResult] = data || [] 

    let price: bigint | undefined = undefined;
    let balanceOf: bigint | undefined = undefined;
    
    if (priceResult && priceResult.result) {
        price = priceResult.result as bigint;
    }
    if (balanceOfResult && balanceOfResult.result) {
        balanceOf = balanceOfResult.result as bigint;
    }
        


    useEffect(() => {
        async function fetchTokenIds() {
            if (address && balanceOf) {
                try {
                    const ids = await getTokenIdsFromOwner(address, balanceOf);
                    setTokenIds(ids);
                } catch (error) {
                    console.error('Failed to fetch token IDs', error);
                    // handle the error state here
                }
            } else {
                // reset token IDs or handle the disconnected state
                setTokenIds([]);
            }
        }
    
        fetchTokenIds();
    }, [address, balanceOf]); // Re-run this effect if the 'address' changes
    

    
 
    
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
                        <h1>My FoldSpace NFTs</h1>
                        {isPendingRead && <div>Loading Account info...</div>}
                        {readError && <div>Error fetching account info. Please reload</div>}
                        {balanceOf && <div>Number of FoldSpace NFTs Owned: {balanceOf.toString()}</div>}
                        {tokenIds && <ListCards tokenIds={tokenIds} />    }
                        {price && <div>Price to Mint in ETH: {formatEther(price)}</div>} 
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

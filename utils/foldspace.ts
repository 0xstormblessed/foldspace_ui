import { createPublicClient, http } from 'viem'
import { optimism } from 'viem/chains'
import FoldSpace from "../abi/FoldSpace.json";

let FOLDSPACE_CONTRACT = process.env.NEXT_PUBLIC_FOLDSPACE_ADDRESS;
let rpcURL = process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL ? process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL : 'https://mainnet.optimism.io';
 
const publicClient = createPublicClient({ 
    batch: {
        multicall: true, 
    },
  chain: optimism,
  transport: http(rpcURL)
})

const foldspaceContractConfig = {
    address: FOLDSPACE_CONTRACT as `0x${string}`,
    abi: FoldSpace.abi,
};

async function getTokenIdsFromOwner(owner: string, balanceOf: bigint) : Promise<bigint[]> {
    let tokenIds: bigint[] = [];
    if (balanceOf === 0n) {
        return tokenIds;
    }
    
    const tokenIdsCall: { address: `0x${string}`; abi: AbiFunction; functionName: string; args: (string | number)[] }[] = [];

    for (let i = 0; i < balanceOf; i++) {
        tokenIdsCall.push({
            ...foldspaceContractConfig,
            functionName: 'tokenOfOwnerByIndex',
            args: [owner, i],
        });
    }
    const results = await publicClient.multicall({
        contracts: tokenIdsCall,
    })

    results.filter(result => result.status === 'success').forEach(result => {
        if (result.result) {
            tokenIds.push(result.result as bigint);
        }
    });

    return tokenIds;
}



export { 
    publicClient, 
    foldspaceContractConfig,
    getTokenIdsFromOwner
}
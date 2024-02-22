import {
    createPublicClient,
    http,
    hexToBytes,
    SignTypedDataParameters,
    WalletClient,
} from 'viem';
import { optimism } from 'viem/chains';
import { ResultAsync, Result, err } from 'neverthrow';
import { MyAsyncResult, MyResult } from './error';
import { TokenInfo } from './types';
import FoldSpace from '../abi/FoldSpace.json';
import FarcasterIdRegistry from '../abi/FarcasterIdRegistry.json';

let FOLDSPACE_CONTRACT = process.env.NEXT_PUBLIC_FOLDSPACE_ADDRESS;
let rpcURL = process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL
    ? process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL
    : 'https://mainnet.optimism.io';

const publicClient = createPublicClient({
    batch: {
        multicall: true,
    },
    chain: optimism,
    transport: http(rpcURL),
});

const foldspaceContractConfig = {
    address: FOLDSPACE_CONTRACT as `0x${string}`,
    abi: FoldSpace.abi,
};

const farcasterIdRegistryConfig = {
    address: '0x00000000Fc6c5F01Fc30151999387Bb99A9f489b' as `0x${string}`,
    abi: FarcasterIdRegistry.abi,
};

async function getTokenIdsFromOwner(
    owner: string,
    balanceOf: bigint,
): Promise<bigint[]> {
    let tokenIds: bigint[] = [];
    if (balanceOf === 0n) {
        return tokenIds;
    }

    const tokenIdsCall: {
        address: `0x${string}`;
        abi: any;
        functionName: string;
        args: (string | number)[];
    }[] = [];

    for (let i = 0; i < balanceOf; i++) {
        tokenIdsCall.push({
            ...foldspaceContractConfig,
            functionName: 'tokenOfOwnerByIndex',
            args: [owner, i],
        });
    }
    const results = await publicClient.multicall({
        contracts: tokenIdsCall,
    });

    results
        .filter((result) => result.status === 'success')
        .forEach((result) => {
            if (result.result) {
                tokenIds.push(result.result as bigint);
            }
        });

    return tokenIds;
}

async function getTokensInfo(tokenIds: bigint[]): Promise<TokenInfo[]> {
    const tokenInfoCall: {
        address: `0x${string}`;
        abi: any;
        functionName: string;
        args: (string | number)[];
    }[] = [];
    const info: TokenInfo[] = []; // Use the TokenInfo type for the info array
    const len = tokenIds.length;

    if (len === 0) {
        return info;
    }

    tokenIds.forEach((tokenId) => {
        tokenInfoCall.push({
            ...foldspaceContractConfig,
            functionName: 'tokenURI',
            args: [tokenId.toString()],
        });
    });

    tokenIds.forEach((tokenId) => {
        tokenInfoCall.push({
            ...foldspaceContractConfig,
            functionName: 'getFidFor',
            args: [tokenId.toString()],
        });
    });

    tokenIds.forEach((tokenId) => {
        tokenInfoCall.push({
            ...foldspaceContractConfig,
            functionName: 'claimed',
            args: [tokenId.toString()],
        });
    });

    const results = await publicClient.multicall({
        contracts: tokenInfoCall,
    });

    // Construct the info array using the TokenInfo structure
    for (let i = 0; i < len; i++) {
        const tokenId = tokenIds[i];
        const uri = results[i].result as string;
        const fid = results[i + len].result as bigint;
        const claimed = results[i + len * 2].result as boolean;
        info.push({ tokenId, FID: fid, URI: uri, claimed }); // Create an object for each TokenInfo
    }

    return info;
}

async function _signTypedData(
    wallet: WalletClient,
    params: Omit<SignTypedDataParameters, 'account'>,
): MyAsyncResult<Uint8Array> {
    const account = wallet.account;
    if (!account) {
        return err(new Error('wallet not connected'));
    }
    const hexSignature = await ResultAsync.fromPromise(
        wallet.signTypedData({ ...params, account }),
        (e) => new Error('error on signing', e as Error),
    );
    return hexSignature.andThen((hex) => hexStringToBytes(hex));
}

export const hexStringToBytes = (hex: string): MyResult<Uint8Array> => {
    return Result.fromThrowable(
        (hex: string) =>
            hexToBytes(
                hex.startsWith('0x') ? (hex as `0x${string}`) : `0x${hex}`,
            ),
        (e) => new Error('unknown', e as Error),
    )(hex);
};

export {
    publicClient,
    foldspaceContractConfig,
    getTokenIdsFromOwner,
    getTokensInfo,
    farcasterIdRegistryConfig,
};

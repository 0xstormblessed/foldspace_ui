
import * as dotenv from 'dotenv'
dotenv.config()
import { getContract, createPublicClient, http, getAddress } from 'viem'
import { abi as FoldSpaceAbi } from '../abi/FoldSpace.json'
import { optimism } from 'viem/chains'


async function main() {
    console.log("example calling foldspace contract in RPC URL\n")
    console.log("RPC URL: ", process.env.OPTIMISM_RPC_URL)
    console.log("FoldSpace Contract Address: ", process.env.NEXT_PUBLIC_FOLDSPACE_ADDRESS)

    const foldSpaceContractAddress = getAddress(process.env.NEXT_PUBLIC_FOLDSPACE_ADDRESS || '')

    // create a public client
    const publicClient = createPublicClient({
        batch: {
            // this optimizing calls to RPC and batches them
            // see https://viem.sh/docs/clients/public#eth_call-aggregation-via-multicall
            multicall: true, 
        },
        chain: optimism,
        transport: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL),
    })

    const blockNumber = await publicClient.getBlockNumber() 
    console.log("Block Number: ", blockNumber)

    // FETCHING EXAMPLE USING BATCH CALL

    //  Create contract instance
    const foldSpaceContract = getContract({
        address: foldSpaceContractAddress,
        abi: FoldSpaceAbi,
        // 1a. Insert a single client
        client: publicClient,
        // 1b. Or public and/or wallet clients
        // client: { public: publicClient, wallet: walletClient }
    })
    // example wallet
    const vitalikAddress = getAddress(`0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`);

    // The below will send a single request to the RPC Provider. (BATCHING)
    const [name, totalSupply, symbol, balance, proxyTemplateAddress] = await Promise.all([
        foldSpaceContract.read.name(),
        foldSpaceContract.read.totalSupply(),
        foldSpaceContract.read.symbol(),
        // number of NFTS a wallet owns
        foldSpaceContract.read.balanceOf([vitalikAddress]),
        // foldSpaceContract.read.ownerOf([1n]),<- reverts if no owner for tokenId
        foldSpaceContract.read.PROXY_TEMPLATE() // constant in contract
    ])

    console.log("FoldSpace Contract Name: ", name)
    console.log("FoldSpace Contract Total Supply: ", totalSupply)
    console.log("FoldSpace Contract Symbol: ", symbol)
    console.log("Wallet's Balance: ", balance)
    //console.log("Owner of tokenId 1: ", ownerOfId1)
    console.log("Proxy Template Address: ", proxyTemplateAddress)
    
    const balanceOfRandom = await publicClient.getBalance({
        address: '0x527deA12Db3ffe01d396215305426c362879bd3B',
    })

    console.log("Wallet's Balance random: ", balanceOfRandom);
    // FETCHING EXAMPLE for getting tokenIds owned by a wallet


    /* if (balance) > 0 {
        // The below will send a single request to the RPC Provider. (BATCHING)
        const [tokenId] = await Promise.all([
            foldSpaceContract.read.tokenOfOwnerByIndex([vitalikAddress, 0])
        ])

        console.log("Wallet's TokenId: ", tokenId)
    } */
    

}

main()
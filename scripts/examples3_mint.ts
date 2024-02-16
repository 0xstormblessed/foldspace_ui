
import * as dotenv from 'dotenv'
dotenv.config()
import { createPublicClient, createWalletClient, http, getAddress } from 'viem'
import { abi as FoldSpaceAbi } from '../abi/FoldSpace.json'
import { optimism } from 'viem/chains'


async function main() {
    console.log("example calling foldspace contract in RPC URL\n")
    console.log("RPC URL: ", process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL)
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
    const foldSpaceContract = {
        address: foldSpaceContractAddress,
        abi: FoldSpaceAbi
    } as const

    // example wallet
    const vitalikAddress = getAddress(`0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`);

    const results = await publicClient.multicall({
        contracts: [
         {
                ...foldSpaceContract,
                functionName: 'name',
          },
          {
            ...foldSpaceContract,
            functionName: 'totalSupply',
          },
          {
            ...foldSpaceContract,
            functionName: 'symbol'
          },

            {
                ...foldSpaceContract,
                functionName: 'balanceOf',
                args: [vitalikAddress]
            },
            {
                ...foldSpaceContract,
                functionName: 'ownerOf',
                args: [1n]
            },
            {
                ...foldSpaceContract,
                functionName: 'PROXY_TEMPLATE'
            },
            {
                ...foldSpaceContract,
                functionName: 'tokenOfOwnerByIndex',
                args: [vitalikAddress, 0] // ask for the first tokenId owned by example address
            }
          
        ]
      })

    const [
        name, 
        totalSupply, 
        symbol, 
        balance, 
        ownerOf, 
        proxyTemplateAddress,
        tokenId
    ] = results.map((v) => v.result)  

    console.log("FoldSpace Contract Name: ", name)
    console.log("FoldSpace Contract Total Supply: ", totalSupply)
    console.log("FoldSpace Contract Symbol: ", symbol)
    console.log("Wallet's Balance: ", balance)
    console.log("Owner of tokenId 1: ", ownerOf) // here ownerOf returns undefinded since it failed
    console.log(`First Token Id owned by Wallet ${vitalikAddress} : `, tokenId)
    console.log("Proxy Template Address: ", proxyTemplateAddress)    

}

main()
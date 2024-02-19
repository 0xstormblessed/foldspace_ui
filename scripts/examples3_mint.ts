
import * as dotenv from 'dotenv'
dotenv.config()
import { createPublicClient, createWalletClient, http, getAddress, formatGwei } from 'viem'
import { abi as FoldSpaceAbi } from '../abi/FoldSpace.json'
import { optimism } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts'

 
const mnemonic = generateMnemonic(english)
console.log("mnemonic: ", mnemonic);
const account = mnemonicToAccount(mnemonic)
console.log("mnemonic: ", account.address)


async function main() {
    console.log("mint example\n")
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

    // SETUP WALLET CLIENT
    const privateKey = process.env.TEST_PKEY as `0x${string}`; // private key of the account;
    if (!privateKey) {
        throw new Error('TEST_PKEY is not defined');
    }

    const testAccount = privateKeyToAccount(privateKey)   
    console.log("testAccount: ", testAccount.address);

    const walletClient = createWalletClient({
        chain: optimism,
        transport: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL),
        account: testAccount,
    });


    // FETCHING Account BALANCE
    const balanceOfTestAccount = await publicClient.getBalance({
        address: testAccount.address,
    })

    console.log("Balance of Test Account: ", balanceOfTestAccount);

    //  Create contract instance
    const foldSpaceContract = {
        address: foldSpaceContractAddress,
        abi: FoldSpaceAbi
    } as const

    // get price from contract
    const price = await publicClient.readContract({
        ...foldSpaceContract,
        functionName: 'price',
        args: [],
    })

    console.log(`Cost to rent storage: ${price}`);

    // calling mint from contract with wallet account
    const hash = await walletClient.writeContract({
        ...foldSpaceContract,
        functionName: 'mint',
        args: [],
        value: price as bigint,
    })

    console.log("Transaction Hash: ", hash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    console.log("Transaction Receipt: ", receipt);

    console.log("MINTED SUCCESSFULLY!")
    console.log("Minted token id: ", receipt.logs[0].topics[3]);

}

main()
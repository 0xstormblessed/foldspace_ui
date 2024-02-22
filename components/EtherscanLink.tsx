import React from 'react';
import { Typography, Link } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface EtherscanLinkProps {
    transactionHash: string;
    network?: 'mainnet' | 'optimism'; // Optional prop for specifying the network
}

const EtherscanLink: React.FC<EtherscanLinkProps> = ({
    transactionHash,
    network = 'mainnet',
}) => {
    // Base URLs for different networks on Etherscan
    const etherscanBaseUrl = {
        mainnet: 'https://etherscan.io/tx/',
        optimism: 'https://optimistic.etherscan.io/tx/',
    };

    // Construct the full Etherscan URL
    const etherscanUrl = `${etherscanBaseUrl[network]}${transactionHash}`;

    return (
        <Typography
            variant="body2"
            sx={{ mt: 2, display: 'flex', alignItems: 'center' }}
        >
            <Link
                href={etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                View on Etherscan
                <OpenInNewIcon
                    sx={{ ml: 0.5, width: '0.75em', height: '0.75em' }}
                />{' '}
            </Link>
        </Typography>
    );
};

export default EtherscanLink;

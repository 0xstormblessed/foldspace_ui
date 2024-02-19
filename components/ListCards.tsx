import React, { useCallback, useState } from 'react';
import Grid from '@mui/material/Grid';
import FoldSpaceCard from './FoldSpaceCard';
import { TokenInfo } from '../utils/types';

interface ListCardsProps {
    tokensInfo: TokenInfo[];
    onTokensUpdate: () => void; // Prop to trigger a refresh from the parent component
}

const ListCards: React.FC<ListCardsProps> = ({
    tokensInfo,
    onTokensUpdate,
}) => {
    // State to force re-render
    const [, setTick] = useState(0);

    const forceUpdate = useCallback(() => {
        setTick((tick) => tick + 1); // This will re-render the component
        onTokensUpdate(); // Callback to parent component to fetch the latest tokensInfo
    }, [onTokensUpdate]);

    const handleTransfer = async (tokenId: bigint) => {
        console.log(`Transfer initiated for Token ID: ${tokenId}`);
        // Implement transfer logic here
        // On successful transfer, you might want to force an update or refetch the tokensInfo
        forceUpdate();
    };

    const handleClaim = async (tokenId: bigint) => {
        console.log(`Claim initiated for Token ID: ${tokenId}`);
        // Implement claim logic here
    };

    return (
        <Grid container spacing={2}>
            {tokensInfo.map((tokenInfo, index) => (
                <Grid
                    item
                    key={index}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    sx={{ width: '100%', padding: 2 }}
                >
                    {' '}
                    {/* Adjusted item padding for spacing */}
                    <FoldSpaceCard
                        tokenInfo={tokenInfo}
                        onTransfer={() => handleTransfer(tokenInfo.tokenId)}
                        onClaim={() => handleClaim(tokenInfo.tokenId)}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default ListCards;

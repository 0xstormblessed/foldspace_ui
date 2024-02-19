// ListCards.tsx
import React from 'react';
import Grid from '@mui/material/Grid';
import FoldSpaceCard from './FoldSpaceCard'; // Adjust the import path as necessary

interface ListCardsProps {
    tokenIds: bigint[]; // Accepting an array of bigint for tokenIds
}

const FoldSpaceCards: React.FC<ListCardsProps> = ({ tokenIds }) => {
    return (
        <Grid container spacing={2}>
            {tokenIds.map((tokenId, index) => (
                <Grid item key={index}>
                    <FoldSpaceCard tokenId={tokenId} />
                </Grid>
            ))}
        </Grid>
    );
};

export default FoldSpaceCards;

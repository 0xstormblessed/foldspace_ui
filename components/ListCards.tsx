import React, { useCallback, useState } from 'react';
import Grid from '@mui/material/Grid';
import FoldSpaceCard from './FoldSpaceCard';
import { Address } from 'viem';
import { TokenInfo } from '../utils/types';

interface ListCardsProps {
    tokensInfo: TokenInfo[];
    tokenUpdateCallback: () => void;
}

const ListCards: React.FC<ListCardsProps> = ({
    tokensInfo,
    tokenUpdateCallback,
}) => {
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
                        tokenUpdateCallback={tokenUpdateCallback}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default ListCards;

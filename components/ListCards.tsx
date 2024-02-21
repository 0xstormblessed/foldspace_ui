import React, { useCallback, useState } from 'react';
import Grid from '@mui/material/Grid';
import FoldSpaceCard from './FoldSpaceCard';
import { TokenInfo } from '../utils/types';

interface ListCardsProps {
    tokensInfo: TokenInfo[];
    hasFid: boolean;
    tokenUpdateCallback: () => void;
}

const ListCards: React.FC<ListCardsProps> = ({
    tokensInfo,
    hasFid,
    tokenUpdateCallback,
}) => {
    return (
        <Grid container spacing={2}>
            {tokensInfo.map((tokenInfo, index) => (
                <Grid
                    item
                    key={index}
                    xs={12}
                    sx={{ width: '100%', padding: 2 }}
                >
                    {' '}
                    {/* Adjusted item padding for spacing */}
                    <FoldSpaceCard
                        hasFid={hasFid}
                        tokenInfo={tokenInfo}
                        tokenUpdateCallback={tokenUpdateCallback}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default ListCards;

import React from 'react';
import Grid from '@mui/material/Grid';
import FoldSpaceCard from './FoldSpaceCard';
import { TokenInfo } from '../utils/types';

interface ListCardsProps {
    tokensInfo: TokenInfo[];
}

const ListCards: React.FC<ListCardsProps> = ({ tokensInfo }) => {
    return (
        <Grid container spacing={2}>
            {tokensInfo.map((tokenInfo, index) => (
                <Grid item key={index} xs={12} sm={6} md={4} lg={3}> {/* Adjust grid sizing as needed */}
                    <FoldSpaceCard tokenInfo={tokenInfo} />
                </Grid>
            ))}
        </Grid>
    );
};

export default ListCards;


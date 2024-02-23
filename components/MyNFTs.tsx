// MyNFTs.tsx
import React from 'react';
import ListCards from '../components/ListCards';
import { TokenInfo } from '../utils/types';

interface MyNFTsProps {
    tokensInfo: TokenInfo[] | undefined;
    hasFid: boolean;
    updateTokenCallback: () => void;
}

const MyNFTs: React.FC<MyNFTsProps> = ({
    hasFid,
    tokensInfo,
    updateTokenCallback,
}) => {
    if (tokensInfo && tokensInfo.length === 0) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                }}
            >
                <h2>Click mint to enter FoldSpace</h2>
            </div>
        );
    }
    return (
        <>
            {tokensInfo && (
                <ListCards
                    hasFid={hasFid}
                    tokensInfo={tokensInfo}
                    tokenUpdateCallback={updateTokenCallback}
                />
            )}
        </>
    );
};

export default MyNFTs;

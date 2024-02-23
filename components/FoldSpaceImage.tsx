import React from 'react';

interface FoldSpaceImageProps {
    encodedUri?: string; // The base64-encoded URI of the image, now optional
    altText?: string; // Optional alt text for the image
    placeholder?: string; // Optional placeholder image URI
}

interface DecodedURI {
    image: string;
}

const FoldSpaceImage: React.FC<FoldSpaceImageProps> = ({
    encodedUri,
    altText,
    placeholder,
}) => {
    let decodedImage = placeholder; // Default to placeholder if no valid image is found

    if (encodedUri) {
        try {
            const decodedUri = JSON.parse(
                atob(encodedUri.split(',')[1]),
            ) as DecodedURI; // Decode the base64-encoded URI
            decodedImage = decodedUri.image;
        } catch (error) {
            // Log parsing errors and fall back to the placeholder
            console.error('Error parsing encodedUri:', error);
        }
    }

    return (
        <img
            src={decodedImage} // Use the decoded image or fallback to placeholder
            alt={altText || 'FoldSpace Image'} // Use provided alt text or default
            style={{ maxWidth: '100%', height: 'auto' }} // Ensure the image is responsive
        />
    );
};

export default FoldSpaceImage;

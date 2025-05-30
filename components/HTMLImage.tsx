import React from 'react';
import { Modal, SafeAreaView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

interface HTMLImageProps {
    isVisible: boolean;
    imageUri: string;
    onClose: () => void;
}

const HTMLImage: React.FC<HTMLImageProps> = ({ isVisible, imageUri, onClose }) => {
    const images = [{ url: imageUri }]; // ImageViewer accepts an array of image objects

    return (
        <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
            <SafeAreaView style={styles.modalContainer}>
                <ImageViewer
                    imageUrls={images}
                    enableSwipeDown={true}
                    onSwipeDown={onClose}
                    saveToLocalByLongPress={false} // Disable save option on long press
                    renderIndicator={() => null} // Hide the "1/1" indicator
                    renderHeader={() => (
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        padding: 10,
        zIndex: 10,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#333',
    },
});

export default HTMLImage;

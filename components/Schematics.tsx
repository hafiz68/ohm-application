import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    StatusBar,
    useColorScheme,
    Image
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { SafeAreaView } from 'react-native-safe-area-context';



const generateRandomId = () => {
    return Math.floor(Math.random() * (9999999999 - 1000 + 1)) + 1000;
};


const Schematics = ({ procedure }: { procedure: ProcedureNode }) => {
    const [isImageViewerVisible, setImageViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const theme = useColorScheme();
    const styles = themedStyles(theme);
    // Process images for both FlatList and ImageViewer
    const imageItems = procedure.images.map(item => ({
        id: generateRandomId(),
        url: item.src,
        title: item.name || 'Untitled Image',
    })).filter(Boolean);

    // Format images for ImageViewer component
    const imageUrls = imageItems.map(item => ({
        url: item.url,
        title: item.title,
    }));

    const handleImagePress = (index: Image) => {
        setCurrentImageIndex(index);
        setImageViewerVisible(true);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <Text style={styles.title}>Schematics for {procedure.name}</Text>

            <FlatList
                data={imageItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => handleImagePress(index)}
                    >
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.text}>{item.title}</Text>
                    </TouchableOpacity>
                )}
            />

            <Modal
                visible={isImageViewerVisible}
                transparent={true}
                onRequestClose={() => setImageViewerVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <ImageViewer
                        imageUrls={imageUrls}
                        index={currentImageIndex}
                        enableSwipeDown={true}
                        onSwipeDown={() => setImageViewerVisible(false)}
                        enablePreload={true}
                        saveToLocalByLongPress={false}
                        renderHeader={() => (
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setImageViewerVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        )}
                        renderIndicator={(currentIndex, allSize) => (
                            <View style={styles.indicator}>
                                <Text style={styles.indicatorText}>
                                    {currentIndex}/{allSize}
                                </Text>
                            </View>
                        )}
                    />
                </SafeAreaView>
            </Modal>
        </View>
        
    );
};

const themedStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: theme === 'dark' ? '#000000' : '#fff',
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 10,
            color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        listItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
            padding: 10,
            backgroundColor: theme === 'dark' ? '#333333' : '#f8f8f8',
            borderRadius: 8,
        },
        bullet: {
            color: theme === 'dark' ? '#ffffff' : 'black',
            fontSize: 30,
            marginRight: 10,
        },
        text: {
            color: theme === 'dark' ? '#007AFF' : '#007AFF',
            fontSize: 18,
        },
        modalContainer: {
            flex: 1,
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'black',
        },
        closeButton: {
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 999,
            padding: 10,
        },
        closeButtonText: {
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
        },
        indicator: {
            position: 'absolute',
            top: 45,
            alignSelf: 'center',
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            borderRadius: 15,
            padding: 8,
            paddingHorizontal: 15,
        },
        indicatorText: {
            color: '#fff',
            fontSize: 14,
        },
    });


export default Schematics;
import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// SplashScreen component
const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    useEffect(() => {
        // Navigate to the Login screen after 2 seconds
        const timer = setTimeout(() => {
            navigation.replace('Login');  // Use replace to avoid going back to SplashScreen
        }, 2000);

        // Cleanup the timer when the component unmounts
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/splash_screen.jpg')} // Update with your image path
                style={styles.image}
                resizeMode="cover" // Changed to 'cover' to ensure full screen coverage
            />
        </View>
    );
};

// Styles for the splash screen
const styles = StyleSheet.create({
    container: {
        flex: 1, // Use flex to ensure container takes full screen
        width: width,
        height: height,
        backgroundColor: '#23283A',
        position: 'absolute', // Position absolute to ensure full coverage
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    image: {
        flex: 1, // Use flex to ensure image takes full container space
        width: width,
        height: height,
    },
});

export default SplashScreen;
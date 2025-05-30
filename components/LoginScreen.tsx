import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [email, setEmail] = useState('test@test.com');
    const [password, setPassword] = useState('123456');
    const [loading, setLoading] = useState(false);

    const theme = useColorScheme();
    const styles = themedStyles(theme);
    const handleSignIn = async () => {
        setLoading(true);

        const userCredentials = {
            email,
            password,
        };

        try {
            // Make the API call
            const response = await fetch('http://13.53.120.90:8000/api/v1/user/user-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userCredentials),
            });

            const data = await response.json();

            if (data.success) {
                // Store user data in AsyncStorage
                await AsyncStorage.setItem('user', JSON.stringify(data));

                // Navigate to MainScreen
                navigation.replace('Main'); // Use replace to prevent going back to Login screen
            } else {
                Alert.alert('Login failed! Please check your credentials.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Image */}
            <Image
                source={require('../assets/ohm_logo_white.png')} // Replace with actual logo path
                style={styles.logo}
                resizeMode="contain"
            />

            {/* Welcome text */}
            <Text style={styles.headerText}>Let's Sign You In.</Text>
            <Text style={styles.subHeaderText}>Welcome back.</Text>


            {/* Email input */}
            <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#BDBCBC"
                keyboardType="email-address"
               // value={email}
                onChangeText={setEmail}

            />

            {/* Password input */}
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#BDBCBC"
                secureTextEntry
               // value={password}
                onChangeText={setPassword}
            />

            {/* Sign in button */}

            <TouchableOpacity
                style={styles.closeButton}
                onPress={handleSignIn}
            >
                <Text style={styles.closeText}>Sign In</Text>
            </TouchableOpacity>
            {/* Loading indicator */}
            {loading && <ActivityIndicator size="large" color="#FF5733" style={styles.loadingIndicator} />}
        </View>
    );
};

const themedStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#23283A',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: "80%",
        height: 100,
        marginBottom: 30,
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    subHeaderText: {
        fontSize: 28,
        color: '#BDBCBC',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#2D3541',
        color: 'white',
        marginVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    loadingIndicator: {
        marginTop: 20,
    },
    closeButton: {
        backgroundColor: theme === 'dark' ? 'white' : 'white',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 15,
        alignSelf: 'center',
    },
    closeText: {
        color: theme === 'dark' ? 'black' : 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default LoginScreen;

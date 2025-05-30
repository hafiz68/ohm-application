import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, Button, TouchableOpacity, Image, useColorScheme, ActivityIndicator, PermissionsAndroid, ToastAndroid, Platform } from 'react-native';
import PagerView from 'react-native-pager-view';
import CustomModal from './CustomModal';
import { useProcedureContext } from '../context/ProcedureProvider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';


// Define your navigation type
type RootStackParamList = {
    ' Procedure': undefined;
    'Table of Content': undefined;
    'Schematics': undefined;
    'Process Info': undefined;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProcessInfo = ({ procedure }: { procedure: ProcedureNode }) => {
    const handleDownloadBarcode = async () => {
        console.log("handleDownloadBarcode: Function called");
    
        try {
            // Step 1: Check and request storage permission if on Android
            if (Platform.OS === 'android') {
                console.log("handleDownloadBarcode: Checking storage permission...");
                
                // Different permission handling based on Android version
                const isAndroid13OrHigher = Platform.Version >= 33;
                let hasPermission = false;
                
                if (isAndroid13OrHigher) {
                    // For Android 13+, check READ_MEDIA_IMAGES
                    hasPermission = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    );
                    
                    if (!hasPermission) {
                        console.log("handleDownloadBarcode: No media images permission, requesting...");
                        const granted = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                            {
                                title: "Photos Permission",
                                message: "App needs access to your photos to save QR code images",
                                buttonNeutral: "Ask Me Later",
                                buttonNegative: "Cancel",
                                buttonPositive: "OK",
                            }
                        );
                        
                        hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
                    }
                } else {
                    // For Android 12 and below, check WRITE_EXTERNAL_STORAGE
                    hasPermission = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                    );
                    
                    if (!hasPermission) {
                        console.log("handleDownloadBarcode: No storage permission, requesting...");
                        const granted = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                            {
                                title: "Storage Permission",
                                message: "App needs access to storage to save QR code images",
                                buttonNeutral: "Ask Me Later",
                                buttonNegative: "Cancel",
                                buttonPositive: "OK",
                            }
                        );
                        
                        hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
                    }
                }
    
                console.log(`handleDownloadBarcode: Permission result - ${hasPermission}`);
    
                if (!hasPermission) {
                    console.warn("handleDownloadBarcode: Required permission denied");
                    ToastAndroid.show("Storage permission denied", ToastAndroid.SHORT);
                    return;
                }
    
                console.log("handleDownloadBarcode: Permission granted");
            }
    
            // Step 2: Determine download directory based on Android version
            let downloadDir;
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                // For Android 13+, use pictures directory
                downloadDir = RNFS.PicturesDirectoryPath;
            } else {
                // For older Android versions, use download directory
                downloadDir = RNFS.DownloadDirectoryPath;
            }
            
            console.log(`handleDownloadBarcode: Using directory - ${downloadDir}`);
            
            const dirExists = await RNFS.exists(downloadDir);
            if (!dirExists) {
                console.log(`handleDownloadBarcode: Creating directory - ${downloadDir}`);
                await RNFS.mkdir(downloadDir);
            }
            
            // Step 3: Define download path with a timestamp to avoid overwriting
            const timestamp = new Date().getTime();
            const downloadPath = `${downloadDir}/barcode_${timestamp}.png`;
            console.log(`handleDownloadBarcode: Download path - ${downloadPath}`);
    
            // Step 4: Start file download
            console.log(`handleDownloadBarcode: Starting download from URL - ${procedure.url}`);
            const downloadOptions = {
                fromUrl: procedure.url,
                toFile: downloadPath,
                background: true, // Enable background downloading
                discretionary: true, // Allow the OS to control the timing and speed
                progressDivider: 10, // Report download progress at 10% intervals
            };
    
            const { jobId, promise } = RNFS.downloadFile(downloadOptions);
            const result = await promise;
    
            console.log(`handleDownloadBarcode: Download result - ${JSON.stringify(result)}`);
    
            // Step 5: Check result status
            if (result.statusCode === 200) {
                console.log("handleDownloadBarcode: Download successful");
                
                // Step 6: Add the file to media library so it shows up in gallery
                if (Platform.OS === 'android') {
                    try {
                        // On Android, we need to tell the media scanner about the new file
                        await RNFS.scanFile(downloadPath);
                        console.log("handleDownloadBarcode: File scanned successfully");
                    } catch (scanError) {
                        console.error("handleDownloadBarcode: Error scanning file:", scanError);
                        // Continue anyway since the file was saved
                    }
                }
                
                // Display different messages based on save location
                const location = Platform.OS === 'android' && Platform.Version >= 33 ? 'Pictures' : 'Downloads';
                ToastAndroid.show(`Barcode saved to ${location} as barcode_${timestamp}.png`, ToastAndroid.LONG);
            } else {
                console.warn(`handleDownloadBarcode: Download failed with status code - ${result.statusCode}`);
                ToastAndroid.show("Failed to download barcode", ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error("handleDownloadBarcode: Error occurred", error);
            console.error("Error details:", error.message, error.code);
            ToastAndroid.show("An error occurred while downloading the barcode", ToastAndroid.SHORT);
        }
    };
    const navigation = useNavigation<NavigationProp>();
    const { setCurrentProcedureIndex } = useProcedureContext();
    const handleItemPress = (index) => {
        setCurrentPage(index);
        // setSelectedItem(procedureItems[index]);
        setLoading(true)
        setTimeout(() => {
            setCurrentProcedureIndex(index);
            navigation.navigate('Procedure');
            setLoading(false); // Reset loading after navigation completes if necessary
        }, 100);
    };
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showBarCodeModal, setShowBarCodeModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const pagerViewRef = useRef<PagerView>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const theme = useColorScheme(); // Returns 'light' or 'dark'
    const styles = themedStyles(theme);
    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options); // Adjust locale as needed
    };
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('user');
                if (userDataString !== null) {
                    const data = JSON.parse(userDataString);
                    console.log('Retrieved user data:', data);
                    setUserData(data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);
    useFocusEffect(
        useCallback(() => {


            return () => {
                setModalVisible(false)
            };
        }, [])
    );
    const handleFeedbackSubmit = async () => {
        setLoading(true);

        try {
            const response = await fetch(`http://13.53.120.90:8000/api/v1/feedback/${userData?.user._id}/${procedure._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description: feedbackMessage }),
            });

            const data = await response.json();
            console.log(userData?.user._id + " = " + procedure._id)
            if (data.success) {
                setShowFeedbackModal(false);
                setFeedbackMessage('');
                Alert.alert('Feedback submitted');
            } else {
                console.log(data)
                Alert.alert('Feedback submission failed');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('An error occurred while submitting feedback');
        } finally {
            setLoading(false);
        }
        // Handle feedback submission logic here
        console.log('Feedback submitted:', feedbackMessage);

    };

    const handleFeedbackClose = () => {
        setShowFeedbackModal(false);
    };

    const handleBarCodePress = () => {
        setShowBarCodeModal(true);
        console.log("Barcode:",procedure.url )
    };

    const handleBarCodeClose = () => {
        setShowBarCodeModal(false);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };
    const generateRandomId = () => {
        return Math.floor(Math.random() * (9999999999 - 1000 + 1)) + 1000;
    };
    const navigateToPage = (pageIndex: number) => {
        // Ensure the page index is within bounds
        if (pageIndex >= 0 && pageIndex < procedureItems.length) {
            // Update both PagerView and current page state
            pagerViewRef.current?.setPage(pageIndex);
            setCurrentPage(pageIndex);
        }
    };
    const procedureItems = procedure.procedures
        .map((item) => {
            if ('steps' in item) {
                const generatedId = generateRandomId();
                return {
                    id: item._id,
                    text: item.steps.title,
                    type: 'step',
                    title: item.steps.title,
                    info: item.steps.stepInfo,
                    answer: null
                };
            } else if ('decisions' in item && 'answer' in item.decisions) {
                return {
                    id: item._id,
                    text: item.decisions.title,
                    type: 'decision',
                    title: item.decisions.title,
                    info: item.decisions.decisionInfo,
                    answer: item.decisions.answer
                };
            }
            return null;
        })
        .filter(Boolean);

    if (procedure.endProcedure) {
        const title = procedure.endProcedure.title || 'End Step';
        const stepInfo = procedure.endProcedure.stepInfo || 'Untitled End Step';

        procedureItems.push({
            id: generateRandomId().toString(),
            text: title,
            type: 'endProcedure',
            title: title,
            info: stepInfo,
            answer: null,
        });
    } else {
        // Handle the case where endProcedure is undefined
        procedureItems.push({
            id: generateRandomId().toString(),
            text: 'End Step',
            type: 'endProcedure',
            title: 'End Step',
            info: 'Untitled End Step',
            answer: null,
        });
    }
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color="#0000ff"
                />
                <Text style={styles.loadingText}>Loading Procedure...</Text>
            </View>
        );
    }
    return (
        
        <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.container}>


                {/* Procedure Information */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Procedure Name:  </Text>
                    <Text style={[styles.infoText, { flex: 1, flexWrap: 'wrap' }]}>{procedure.name}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Author:  </Text>
                    <Text style={[styles.infoText, { flex: 1, flexWrap: 'wrap' }]}>{procedure.author}</Text>
                </View>



                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Procedure Barcode:  </Text>
                    <Button title="View" onPress={handleBarCodePress} />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Published Date:  </Text>
                    <Text style={[styles.infoText, { flex: 1, flexWrap: 'wrap' }]}>{formatDate(procedure.createdAt)}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Updated at:  </Text>
                    <Text style={[styles.infoText, { flex: 1, flexWrap: 'wrap' }]}>{formatDate(procedure.updatedAt)}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Version:  </Text>
                    <Text style={[styles.infoText, { flex: 1, flexWrap: 'wrap' }]}>{procedure.__v}</Text>
                </View>
                <Text style={styles.feedbackText}>Found any Issue? Click here to provide feedback: </Text>
                <Button title="Feedback" onPress={() => setShowFeedbackModal(true)} />

                {showFeedbackModal && (
                    <Modal visible={showFeedbackModal} animationType="slide">
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Provide Feedback</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={feedbackMessage}
                                onChangeText={setFeedbackMessage}
                                multiline
                            />
                            <View style={styles.modalButtonContainer}>
                                <Button title="Submit" onPress={handleFeedbackSubmit} />
                                <Button title="Close" onPress={handleFeedbackClose} />
                            </View>
                        </View>
                    </Modal>
                )}

                <Text style={styles.processMapText}>Process Map</Text>
                {/* Start Circle */}
                <View style={styles.startCircle}>
                    <Text style={styles.startText}>Start</Text>
                </View>
                {<View style={styles.verticalLine} />}
                {showBarCodeModal && (
                    <Modal visible={showBarCodeModal} animationType="slide">
                        <View style={styles.modalContainer}>
                            <Image source={{ uri: procedure.url }} style={styles.barCodeImage} resizeMode="contain" />
                            <View style={styles.modalButtonContainer}>
                                <Button
                                    title="Download Barcode"
                                    onPress={async () => {
                                        await handleDownloadBarcode();
                                    }}
                                />
                                <Button title="Close" onPress={handleBarCodeClose} />
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Render steps and decisions */}
                {procedure.procedures.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <View style={styles.verticalLine} />}

                        {'steps' in item ? (
                            <TouchableOpacity
                                onPress={() => handleItemPress(index)}
                                style={styles.stepContainer}
                            >
                                <View style={[
                                    styles.stepRect,
                                    currentPage === index && styles.selectedBorder
                                ]}>
                                    <Text style={styles.stepRectHeading}>Step</Text>
                                    <Text
                                        numberOfLines={2}
                                        style={[styles.stepText, { flexWrap: 'wrap' }]}
                                    >
                                        {item.steps?.title}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ) : 'decisions' in item && 'answer' in item.decisions ? (
                            <TouchableOpacity
                                onPress={() => handleItemPress(index)}
                                style={styles.decisionContainer}
                            >
                                <View style={[
                                    styles.decisionRect,
                                    currentPage === index && styles.selectedBorder
                                ]}>
                                    <Text style={styles.stepRectHeading}>Decision</Text>
                                    <Text
                                        numberOfLines={2}
                                        style={[styles.stepText, { flexWrap: 'wrap' }]}
                                    >
                                        {item.decisions.title}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ) : null}
                    </React.Fragment>
                ))}

                {/* Vertical line before the end */}
                {procedure.procedures.length > 0 && <View style={styles.verticalLine} />}
                {
                    <TouchableOpacity
                        onPress={() => handleItemPress(procedure.procedures.length)}
                        style={styles.stepContainer}>
                        <View style={[
                            styles.stepRect,
                            currentPage === procedure.procedures.length && styles.selectedBorder,
                            { backgroundColor: 'orange', marginBottom: 20 }
                        ]}>
                            <Text style={styles.stepRectHeading}>End Step</Text>
                            <Text
                                numberOfLines={2}
                                style={[styles.stepText, { flexWrap: 'wrap' }]}
                            >
                                {procedure.endProcedure?.title || "Untitled End Step"}
                            </Text>
                        </View>
                    </TouchableOpacity>}

            </ScrollView>
            {selectedItem && <CustomModal
                visible={modalVisible}
                onClose={closeModal}
                procedureItems={procedureItems}
                currentPage={currentPage}
                navigateToPage={navigateToPage}
                pagerViewRef={pagerViewRef}
                setCurrentPage={setCurrentPage}
            />}
        </View>
    );
};

const themedStyles = (theme) =>
    StyleSheet.create({
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme === 'dark' ? '#000000' : 'white',
        },
        loadingText: {
            marginTop: 10,
            fontSize: 16,
            color: theme === 'dark' ? '#4fa4ff' : '#0000ff',
        },
        subTitle: {
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 10,
            color: theme === 'dark' ? '#ffffff' : 'grey',
        },
        selectedBorder: {
            borderColor: '#0000FF',
            borderWidth: 2,
        },
        mainContainer: {
            paddingBottom: "10%",
            backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
        },
        container: {
            alignItems: 'center',
            backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
        },
        infoContainer: {
            flexDirection: 'row',
            width: '95%',
            marginVertical: 8,

            backgroundColor: theme === 'dark' ? '#000' : '#ffffff',
        },
        infoLabel: {
            fontWeight: 'bold',
            fontSize: 16,
            color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        feedbackText: {
            width: "95%",
            flexDirection: 'row',
            fontSize: 20,
            marginBottom: 10,
            color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        infoText: {
            fontSize: 16,
            color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        processMapText: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme === 'dark' ? '#ffffff' : 'black',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 30,
        },
        startCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme === 'dark' ? '#444444' : 'blue',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 30,
        },
        startText: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
        },
        stepRectHeading: {
            color: 'black',
            fontWeight: 'bold',
            fontSize: 16,
        },
        stepContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 0,
        },
        stepRect: {
            width: '70%',
            height: 'auto',
            backgroundColor: 'lightgreen',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 4,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme === 'dark' ? '#444444' : '#000',
        },
        stepText: {
            color: 'black',
        },
        decisionContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 0,
        },
        decisionRect: {
            width: '70%',
            height: 'auto',
            backgroundColor: 'yellow',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 4,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme === 'dark' ? '#444444' : '#000',
        },
        decisionText: {
            color: 'black',
        },
        endCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme === 'dark' ? '#555555' : 'yellow',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 0,
        },
        endText: {
            color: 'black',
            fontWeight: 'bold',
            fontSize: 16,
        },
        verticalLine: {
            width: 2,
            height: 30,
            backgroundColor: theme === 'dark' ? '#fff' : '#000',
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
            color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        modalInput: {
            width: '80%',
            height: 120,
            borderWidth: 1,
            borderColor: theme === 'dark' ? '#666666' : '#ccc',
            borderRadius: 4,
            padding: 8,
            marginBottom: 16,
        },
        modalButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '80%',
        },
        barCodeImage: {
            width: '80%',
            height: '60%',
        },
    });



export default ProcessInfo;
import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Alert,
    ActivityIndicator,Platform
} from 'react-native';
import QRCodeScanner from './QRCodeScanner';
import { usePermissions } from './usePermission';
import FoldersAndProceduresModal from './FoldersAndProcedures';
import { useColorScheme } from 'react-native';


const DRAWER_WIDTH = Dimensions.get('window').width * 0.6; // 70% of screen width
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};
const storage = new MMKV();
const MainScreen = ({ navigation }) => {

    const [drawerOpen, setDrawerOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    //const [procedures, setProcedures] = useState<ProcedureItem[]>([]);
    const [procedures, setProcedures] = useState<ProcedureNode[]>([]);
    //const [filteredProcedures, setFilteredProcedures] = useState<ProcedureItem[]>([]);
    const [filteredProcedures, setFilteredProcedures] = useState<ProcedureNode[]>([]);
    const [searchText, setSearchText] = useState<string>(''); // New state for search text
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const { 
        cameraPermission, 
        storagePermission, 
        permissionsChecked,
        requestAllPermissions 
      } = usePermissions();
    const [isQRScannerVisible, setIsQRScannerVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const theme = useColorScheme(); // Returns 'light' or 'dark'
    const styles = themedStyles(theme);

    const openQRScanner = () => {
        if (cameraPermission) {
            console.log("requestPermission")
            setIsQRScannerVisible(true);
        } else {
            console.log("requestPermission")
            requestCameraPermission();
        }
    };

    const closeQRScanner = () => {
        setIsQRScannerVisible(false);
    };


    const handleScanSuccess = (result: string) => {
        // Handle the scanned result here
        //console.log('Scan Success Result:', result);
        //Alert.alert('Scan Success', result);
        //fetchScannedProcedure(result)
        const parsedResult = JSON.parse(result);
        const procedureNode: ProcedureNode = parsedResult[0];
        console.log("Parsed Procedure Node:", procedureNode);
        console.log("Parsed Procedure Node:", parsedResult);
        navigation.navigate('ProcedureDetailsScreen', { procedureReceived: procedureNode });
        addProcedure(procedureNode)
    };
    const addProcedure = async (newProcedure: ProcedureNode) => {
        // Filter out any existing procedure with the same _id
        const filteredList = procedures.filter(
            (procedure) => procedure._id !== newProcedure._id
        );

        // Add the new procedure at the top and maintain a maximum of 5 items
        const latestList = [newProcedure, ...filteredList].slice(0, 5);

        // Update state
        setProcedures(latestList);
        setFilteredProcedures(latestList);
        console.log('Procedures list saved!');
        // Save the updated list to AsyncStorage
        try {
            await AsyncStorage.setItem('openedProcedures', JSON.stringify(latestList));
            console.log('Procedures list saved!');
        } catch (error) {
            console.error('Failed to save procedures list:', error);
        }
    };
    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        loadLastOpenedProcedures()
        console.log('openedProceduresUpdated')
    }, []);
    useEffect(() => {
        if (userData) {
            // getProcedureDetails();
            getProceduresWithFolders();
        }
    }, [userData]);
    useEffect(() => {
        if (permissionsChecked && (!cameraPermission || !storagePermission)) {
          // This will re-request permissions if they're still not granted
          requestAllPermissions();
        }
      }, [permissionsChecked, cameraPermission, storagePermission]);
    const handleProcedureSelect = (procedure: ProcedureNode) => {
        // Navigate to ProcedureDetailsScreen with the selected procedure
        navigation.navigate('ProcedureDetailsScreen', { procedureReceived: procedure });
        console.log('addProcedure')
        addProcedure(procedure)
    };
    const getFoldersData = async () => {
        setLoading(true); // Set loading to true while fetching data
        const userId = userData?.user._id; // Replace with actual user ID
        const url = `http://13.53.120.90:8000/api/v1/folder/getfolders`;
        //console.log("Folder Data url ", url);
        try {
            // Make the GET request
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });


            //console.log("Folder Data response: ", response);
            if (response.ok) {
                const folderData: FoldersData = await response.json();
                await AsyncStorage.setItem('procedureFolders', JSON.stringify(folderData));
            } else {
                // Handle if the response is not successful
                Alert.alert('Error', 'Failed to fetch folders. Please try again.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while fetching folders.');
        } finally {
            setLoading(false); // Set loading to false after the request is done
        }
    };
    const getProceduresWithFolders = async () => {
        setLoading(true);
        const userId = userData?.user._id;
        const url = `http://13.53.120.90:8000/api/v1/procedure/get/procedures/by/user/${userId}`;
        
        try {
            const response = await fetch(url);
            const fullData = await response.json();
            
            // Store full data with MMKV
            storage.set('foldersProcedures', JSON.stringify(fullData));
        } catch (error) {
            console.error('Error fetching folders and procedures:', error);
        } finally {
            setLoading(false);
        }
    };
    // const getProceduresWithFolders = async () => {
    //     setLoading(true); // Set loading to true while fetching data
    //     const userId = userData?.user._id; // Replace with actual user ID
    //     const url = `http://13.53.120.90:8000/api/v1/procedure/get/procedures/by/user/${userId}`;
    //     console.log('procedure folders url', url);
    //     try {
    //         const response = await fetch(url);

    //         const storableData = await response.json();
    //         console.log('stored Data', storableData)
    //         await AsyncStorage.setItem('foldersProcedures', JSON.stringify(storableData));

    //     } catch (error) {
    //         console.error('Error fetching folders and procedures:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const getProcedureDetails = async () => {
        setLoading(true); // Set loading to true while fetching data
        const userId = userData?.user._id; // Replace with actual user ID
        const url = `http://13.53.120.90:8000/api/v1/procedure/proceduregetbyuser/${userId}`;
        //console.log("Procedures Details url ", url);
        try {
            // Make the GET request
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            // console.log("Procedures Details response: ", response);
            if (response.ok) {
                const proceduresList: RootObject = await data
                // setProcedureDetailsList(proceduresList.procedures)
                //await AsyncStorage.setItem('userProcedures', JSON.stringify(data));
                getFoldersData()
            } else {
                // Handle if the response is not successful
                Alert.alert('Error', 'Failed to fetch procedures. Please try again.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while fetching data.');
        } finally {
            setLoading(false); // Set loading to false after the request is done
        }
    };

    const loadLastOpenedProcedures = async () => {
        const openedProcedures = await AsyncStorage.getItem('openedProcedures');
        if (openedProcedures !== null) {
            const data = JSON.parse(openedProcedures);
            setProcedures(data);
            setFilteredProcedures(data);
        }
    }

    // Function to fetch procedures
    const loadUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('user');

            if (userDataString !== null) {
                const data = JSON.parse(userDataString);
                console.log('Retrieved user data:', data);
                setUserData(data);
            }

        } catch (error) {
            console.error('Error retrieving data from AsyncStorage:', error);
        }
    };


    // Handle search input and filter procedures
    const handleSearch = (text: string) => {
        setSearchText(text);
        const filtered = procedures.filter(procedure =>
            procedure.name.toLowerCase().includes(text.toLowerCase()) // Case insensitive search
        );
        console.log(text)
        setFilteredProcedures(filtered);
    };

    const toggleDrawer = () => {
        const toValue = drawerOpen ? -DRAWER_WIDTH : 0;
        Animated.timing(slideAnim, {
          toValue,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // This callback ensures state is updated after animation completes
          setDrawerOpen(!drawerOpen);
        });
      };
    const findProcedureById = async (procedureId: string): Promise<ProcedureNode | null> => {
        setLoading(true); // Ensure loading state starts
        try {
            const storedData = await AsyncStorage.getItem('openedProcedures');
            if (storedData !== null) {
                const data = JSON.parse(storedData);
                const procedure = data.find((item: ProcedureNode) => item._id === procedureId);
                if (procedure) {
                    return procedure;
                }
            }
            return null; // Return null if procedure not found
        } catch (error) {
            console.error('Error retrieving or parsing stored data:', error);
            return null; // Handle errors gracefully
        } finally {
            setLoading(false); // Reset loading state regardless of success or failure
        }
    };
    const renderProcedure = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleProcedurePress(item)}
            disabled={loading}
        >
            <View style={styles.row}>
                <View style={styles.nameColumn}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{item.name}</Text>
                </View>
                <View style={styles.dateColumn}>
                    <Text style={styles.label}>Created At</Text>
                    <Text style={styles.value}>{formatDate(item.createdAt)}</Text>
                </View>
            </View>

        </TouchableOpacity>
    );
    const handleProcedurePress = async (item: ProcedureNode) => {
        setLoading(true);
        const procedure = await findProcedureById(item._id);
        if (procedure) {
            console.log('Procedure sending', procedure);
            navigation.navigate('ProcedureDetailsScreen', { procedureReceived: procedure });
            addProcedure(procedure)
        } else {
            console.error('Procedure not found');
        }
        setLoading(false);
    };
    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Logout cancelled'),
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    onPress: async () => {
                        // Clear AsyncStorage
                        await AsyncStorage.removeItem('user');
                        await AsyncStorage.removeItem('userProcedures');
                        // Reset the navigation stack to Login screen
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                },
            ],
            { cancelable: false }
        );
    };
    const logoSource = theme === 'dark'
        ? require('../assets/ohm_logo_black.png')
        : require('../assets/ohm_logo_white.png');
    const handleDrawerAction = (action) => {
        toggleDrawer(); // Close drawer after action
        switch (action) {
            case 'role':
                console.log('Profile clicked');
                setModalVisible(true);
                break;
            case 'scanqr':
                console.log('Settings clicked');
                openQRScanner()
                break;
            case 'logout':
                handleLogout()
                //navigation.navigate('Login');
                break;
        }
    };
    const EmptyListMessage = () => (
        <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No Recent Procedures Opened. Please go to the Menu to access Procedures and Folders.</Text>
        </View>
    );
    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.containerInner}>
            {/* Main Content */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.button, styles.menuButton]}
                    onPress={toggleDrawer}
                    disabled={loading}
                >
                    <Text style={styles.menuText}>Menu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.qrButton]}
                    onPress={openQRScanner}
                    disabled={!cameraPermission}
                    
                >
                    <Image
                        style={[styles.qrImage, !cameraPermission && styles.disabledImage]}
                        source={require('../assets/qr-code_icon.png')}
                    />
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Welcome {userData?.user.firstName}</Text>
            <View style={styles.proceduresHeader}>
                <Text style={styles.proceduresText}>Last 5 opened Procedures</Text>

            </View>
            <FlatList
                data={filteredProcedures}
                renderItem={renderProcedure}
                keyExtractor={(item) => item._id}
                contentContainerStyle={[styles.list,{ flexGrow: 1 } ]}
                ListEmptyComponent={EmptyListMessage}
                    style={{
                        backgroundColor: theme === 'dark' ? '#121212' : '#fff',
                        zIndex: drawerOpen ? 1 : 5, 
                }}
            />

            {drawerOpen && (
            <TouchableWithoutFeedback  onPress={toggleDrawer}accessible={true} >
            <View 
                style={styles.overlay} 
                pointerEvents="auto" // Ensure clicks are registered
            />
            </TouchableWithoutFeedback>
            )}

            {/* Custom Drawer */}
            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }],zIndex: 1000, }]}>
                <View style={styles.drawerHeader}>
                    <Image
                        source={logoSource}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerAction('role')}>
                    <Text style={styles.drawerItemText}>Procedures & Folders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerAction('scanqr')}>
                    <Text style={styles.drawerItemText}>Scan QR code</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerAction('logout')}>
                    <Text style={styles.drawerItemText}>Logout</Text>
                </TouchableOpacity>
            </Animated.View>
            {loading && <ActivityIndicator size="large" color="#FF5733" style={styles.loadingIndicator} />}
            {isQRScannerVisible && (
                <QRCodeScanner
                    onClose={closeQRScanner}
                    onScanSuccess={handleScanSuccess}
                />
                
            )}
            {modalVisible && <FoldersAndProceduresModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                onProcedureSelect={handleProcedureSelect}
            />}
        </View>
        </SafeAreaView>
    );

};

const themedStyles = (theme) => StyleSheet.create({
    // First, make sure your overlay is properly capturing touches on iOS
    container: {
        flex: 1,
        backgroundColor: theme === 'dark' ? '#121212' : '#fff',
        padding: 0,
        zIndex: 1, // Lower than drawer
        position: 'relative', // Ensure proper stacking context
        height: '100%', // Make sure it fills the screen on iOS
      },
      containerInner: {
        flex: 1,
        backgroundColor: theme === 'dark' ? '#121212' : '#fff',
        padding: 10,
        zIndex: 1, // Lower than drawer
        position: 'relative', // Ensure proper stacking context
        height: '100%', // Make sure it fills the screen on iOS
      },
      proceduresHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: Platform.OS === 'ios' ? 5 : 0,
        paddingHorizontal: Platform.OS === 'ios' ? 5 : 0,
        zIndex: 2, // Make sure it's visible
      },
overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999, // High zIndex but below drawer
  },
  
  // Update the drawer style with iOS-specific properties
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    elevation: 5,
    shadowColor: theme === 'dark' ? '#fff' : '#000',
    shadowOffset: {
        width: 2,
        height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
},
  
  // Make sure drawerItem borders are visible on iOS
  drawerItem: {
    padding: 15,
    borderBottomWidth: Platform.OS === 'ios' ? 1 : 1,
    borderBottomColor: Platform.OS === 'ios' ? '#d0d0d0' : theme === 'dark' ? '#444' : '#eee',
    backgroundColor: Platform.OS === 'ios' ? (theme === 'dark' ? '#1a1a1a' : '#f8f8f8') : 'transparent',
  },
  
  // Make text more visible
  drawerItemText: {
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
    color: Platform.OS === 'ios' ? (theme === 'dark' ? '#ffffff' : '#333333') : theme === 'dark' ? '#bbb' : '#333',
  },
  
  // Make sure proceduresText is visible
  proceduresText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Platform.OS === 'ios' ? (theme === 'dark' ? '#ffffff' : '#000000') : theme === 'dark' ? '#fff' : '#000',
  },
    header: {
        flexDirection: 'row',
        width: '100%',
        height: 40,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // Example background color
        borderWidth: 1,
        borderColor: '#ccc',
    },
    menuButton: {
        backgroundColor: theme === 'dark' ? 'white' : '#343434',
        borderRadius: 7,
        marginRight: 2

    },
    menuText: {
        color: theme === 'dark' ? 'black' : 'white',
        fontSize: 18,
    },
    qrButton: {
        backgroundColor: theme === 'dark' ? 'white' : '#343434',
        borderRadius: 7,
        marginLeft: 2
    },
    qrImage: {
        width: 40, // Adjust size as needed
        height: 40,
        resizeMode: 'contain',
        tintColor: theme === 'dark' ? 'black' : 'white'
    },
    disabledImage: {
        opacity: 0.5,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyListText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    disabledButton: {
        opacity: 0.5
    },
    
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 15,
        color: theme === 'dark' ? '#fff' : '#000',
    },
   
   
    seeAllText: {
        color: theme === 'dark' ? '#bb86fc' : '#ff3366',
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 10,
    },
    nameColumn: {
        flex: 7,
        marginRight: 10,
    },
    dateColumn: {
        flex: 3,
    },
    label: {
        fontWeight: 'bold',
        color: theme === 'dark' ? 'white' : 'black',
        marginBottom: 5,
    },
    value: {
        flexWrap: 'wrap',
        alignSelf: 'flex-start',
        color: theme === 'dark' ? '#fff' : '#000',
    },
    drawerHeader: {
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? '#444' : '#eee',
        backgroundColor: theme === 'dark' ? 'white' : '#343434',
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme === 'dark' ? '#bb86fc' : '#fff',
    },
    
    loadingIndicator: {
        marginTop: 20,
    },
    logo: {
        width: DRAWER_WIDTH - 30,
        height: 100,
        padding: 10
    },
    camera: {
        flex: 1,
    },
    
});

export default MainScreen;

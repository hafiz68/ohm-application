import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    Modal,
    StatusBar,
    ScrollView,
    Image
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import TableOfContent from './TableOfContent';
import Procedure from './Procedure';
import Schematics from './Schematics';
import ProcessInfo from './ProcessInfo';
import { ProcedureProvider } from '../context/ProcedureProvider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


type ProcedureDetailsRouteParams = {
    procedureReceived: ProcedureNode;
};

const Tab = createMaterialTopTabNavigator();




const ProcedureDetailsScreen = () => {
    const route = useRoute<RouteProp<{ params: ProcedureDetailsRouteParams }>>();
    const navigation = useNavigation();
    const { procedureReceived } = route.params;

    const [loading, setLoading] = useState(true);
    //const [openedProcedure, setProcedure] = useState<ProcedureNode | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const theme = useColorScheme(); // Returns 'light' or 'dark'
    const styles = themedStyles(theme);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        //findProcedureById(procedureId);
        //setProcedure(procedureReceived)
        console.log("Set Procedure", procedureReceived)
        setLoading(false);
    }, [procedureReceived]);

    const findProcedureById = async (procedureId: string) => {
        try {
            const storedData = await AsyncStorage.getItem('userProcedures');
            if (storedData !== null) {
                const data = JSON.parse(storedData);
                const procedure = data.procedures.find((item: ProcedureNode) => item._id === procedureId);
                if (procedure) {
                    //  setProcedure(procedure);
                }
            }
        } catch (error) {
            console.error('Error retrieving or parsing stored data:', error);
        } finally {
            setLoading(false);
        }
    };

    const TabNavigator = () => (
     
        <ProcedureProvider>
            <Tab.Navigator
                backBehavior="none"
                screenOptions={{
                    tabBarStyle: styles.tabBar,
                    tabBarIndicatorStyle: styles.tabIndicator,
                    tabBarLabelStyle: styles.tabLabel,
                    tabBarItemStyle: {
                        marginHorizontal: -10, // Reduce horizontal spacing
                        paddingHorizontal: 5, // Adjust padding if needed
                    },
                    tabBarActiveTintColor: '#007AFF',
                    tabBarInactiveTintColor: '#8E8E93',
                }}
            >
                <Tab.Screen
                    name="Procedure"
                    children={() => <Procedure procedure={procedureReceived} />}
                />
                <Tab.Screen
                    name="Table of Contents"
                    children={() => <TableOfContent procedure={procedureReceived} />}
                />
                <Tab.Screen
                    name="Schematics"
                    children={() => <Schematics procedure={procedureReceived} />}
                />
                <Tab.Screen
                    name="Process Info"
                    children={() => <ProcessInfo procedure={procedureReceived} />}
                />
            </Tab.Navigator>
        </ProcedureProvider>
        
    );

    if (loading) {
        return (
            <View style={styles.loadingIndicator}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!procedureReceived) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Procedure not found.</Text>
            </View>
        );
    }

    const handleGoBack = () => {
        // This will remove the current screen from the navigation stack
        navigation.goBack();
    };

    return (
   
        <SafeAreaView style={styles.container}>
         <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Back Button Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                >
                    <Image
                        source={require('../assets/back.png')}
                        style={styles.backButtonImage}
                    />
                </TouchableOpacity>
            </View>

            {/* Tab Navigator */}
            <View style={styles.tabContainer}>
                <NavigationIndependentTree>
                    <NavigationContainer>
                        <TabNavigator />
                    </NavigationContainer>
                </NavigationIndependentTree>
            </View>

            {/* Safety Notes Button */}
            <TouchableOpacity
                style={styles.safetyNotesButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.safetyNotesText}>Safety Notes</Text>
            </TouchableOpacity>

            
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
              <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Safety Notes</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.contentSection}>
                            <Text style={styles.sectionTitle}>{procedureReceived.procedureSafetyNote.title}</Text>
                            <Text style={styles.sectionText}>
                                {procedureReceived.procedureSafetyNote.procedureNoteInfo.replace(/<p>/g, '').replace(/<\/p>/g, '')}
                            </Text>
                        </View>
                    </ScrollView>
                    </SafeAreaView>
            </Modal>
           
            </View>
        </SafeAreaView>
   
      
    );
};

const themedStyles = (theme, insets) => StyleSheet.create({    header: {
        position: 'absolute', // Make it overlay
       height:64,
         // Align to the top-left corner
        zIndex: 1000, // Ensure it stays above other components
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme === 'dark' ? '#212121' : 'white',
    },
    backButton: {
        padding: 0, // Add padding for a larger touchable area
    },
    backButtonImage: {
        width: 30,
        height: 20,

        tintColor: theme === 'dark' ? '#AA1D20' : '#AA1D20',
    },
    backButtonText: {
        fontSize: 16,
        color: theme === 'dark' ? '#90caf9' : '#007bff',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme === 'dark' ? '#e0e0e0' : '#333',
        textAlign: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        color: theme === 'dark' ? '#ffffff' : '#000',
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
        color: theme === 'dark' ? '#e0e0e0' : '#000',
    },
    tabBar: {
        backgroundColor: theme === 'dark' ? '#212121' : '#fff',
        elevation: 0,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        marginLeft:27,
        height:64 
    },
    tabIndicator: {
        backgroundColor: theme === 'dark' ? '#ffffff' : '#000',
        height: 2,
    },
    tabLabel: {
        textTransform: 'none',
        fontSize: 14,
        fontWeight: '600',
        color: theme === 'dark' ? '#ffffff' : '#000',
    },
    safetyNotesButton: {
        flex: 1,
        flexDirection: 'row',
        height: "5%",
        width: "100%",
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme === 'dark' ? '#3e2723' : '#FFE4E1',
        alignItems: 'center',     // Centers items vertically
        justifyContent: 'center', // Centers items horizontally
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? '#5d4037' : '#FFB6B6',
    },
    safetyNotesText: {
        color: theme === 'dark' ? '#ffab91' : '#D32F2F',
        fontSize: Platform.OS === 'ios' ? 16 : 14,
        fontWeight: '900',
        textAlign: 'center',      // Centers the text content itself
    },
    modalContainer: {
        flex: 1,
        backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? '#424242' : '#EEEEEE',
        backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme === 'dark' ? '#ffffff' : '#000',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 30,
        tintColor: theme === 'dark' ? '#90caf9' : '#999',
    },
    modalContent: {
        flex: 1,
        backgroundColor: theme === 'dark' ? '#212121' : '#f5f5f5',
    },
    contentSection: {
        backgroundColor: theme === 'dark' ? '#424242' : '#fff',
        margin: 10,
        padding: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: theme === 'dark' ? '#ffffff' : '#333',
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 24,
        color: theme === 'dark' ? '#bdbdbd' : '#666',
    },
    warningSection: {
        backgroundColor: theme === 'dark' ? '#5d4037' : '#FFF3E0',
        borderWidth: 1,
        borderColor: theme === 'dark' ? '#8d6e63' : '#FFB74D',
    },
    warningTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme === 'dark' ? '#ffccbc' : '#E65100',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 16,
        lineHeight: 24,
        color: theme === 'dark' ? '#ffccbc' : '#E65100',
    },
    tabContainer: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: 0,
        marginTop: 0,
    },
});


export default ProcedureDetailsScreen;
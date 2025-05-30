import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    useColorScheme
} from 'react-native';
import PagerView from 'react-native-pager-view';
import CustomModal from './CustomModal';
import { useProcedureContext } from '../context/ProcedureProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

const generateRandomId = () => {
    return Math.floor(Math.random() * (9999999999 - 1000 + 1)) + 1000;
};


const Procedure = ({ procedure }: { procedure: ProcedureNode }) => {
    const { currentProcedureIndex } = useProcedureContext();
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const pagerViewRef = useRef<PagerView>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const theme = useColorScheme(); // Returns 'light' or 'dark'
    const styles = themedStyles(theme);

    const procedureItems = procedure.procedures
        .map((item) => {
            if ('steps' in item) {
                return {
                    id: item._id,
                    text: item.steps?.title,
                    type: 'step',
                    title: item.steps?.title,
                    info: item.steps?.stepInfo,
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
    // Add the endProcedure item
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
    const openItem = (index) => {
        setSelectedItem(procedureItems[index]);
        setCurrentPage(index);
        setModalVisible(true);

    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };
    useEffect(() => {
        if (currentProcedureIndex !== null) {
            pagerViewRef.current?.setPage(currentProcedureIndex);
            setCurrentPage(currentProcedureIndex);
            openItem(currentProcedureIndex); // If you want to open the modal automatically
        }
    }, [currentProcedureIndex]);
    useEffect(() => {
        // Check if there are any procedure items
        if (procedureItems.length > 0) {
            // Simulate loading process
            const loadingTimer = setTimeout(() => {
                // Open first item
                openItem(0);

                console.log("inUserEffect")
                setLoading(false);
            }, 1500); // Adjusted to 1 second for more noticeable loading

            // Clean up the timer
            return () => {
                clearTimeout(loadingTimer);
            };
        } else {
            // If no items, stop loading immediately
            console.log("inUserEffect")
            setLoading(false);
        }
    }, []);
    const navigateToPage = (pageIndex: number) => {
        // Ensure the page index is within bounds
        if (pageIndex >= 0 && pageIndex < procedureItems.length) {
            // Update both PagerView and current page state
            pagerViewRef.current?.setPage(pageIndex);
            setCurrentPage(pageIndex);
        }
    };
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
        
        <View style={styles.container}>

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
        scrollViewContainer: {
            width: '90%',
            maxHeight: '80%',
            backgroundColor: theme === 'dark' ? '#1c1c1e' : 'white',
            borderRadius: 10,

        },
        scrollViewContent: {
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            flex: 1,
            paddingBottom: "8%",
            paddingHorizontal: 20,
            backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 0,
            color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        subTitle: {
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 10,
            color: theme === 'dark' ? '#ffffff' : 'grey',
        },
        listItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        bullet: {
            color: theme === 'dark' ? '#ffffff' : 'black',
            fontSize: 18,
            marginRight: 10,
        },
        text: {
            color: theme === 'dark' ? '#4fa4ff' : 'blue',
            fontSize: 18,
        },
        modal: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            width: '100%',
            height: '85%',
            backgroundColor: theme === 'dark' ? '#1c1c1e' : 'white',
            borderRadius: 10,
            alignSelf: 'center',
            marginTop: 'auto',
            marginBottom: 'auto',
            shadowColor: theme === 'dark' ? '#ffffff' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        closeButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
        },
        closeText: {
            fontSize: 24,
            color: theme === 'dark' ? '#aaaaaa' : '#999',
        },
        viewPager: {
            flex: 1,
        },
        page: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
        },
        pageTitle: {
            color: theme === 'dark' ? '#ffffff' : 'black',
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 10,
        },
        pageInfo: {
            fontSize: 18,
            color: theme === 'dark' ? '#cccccc' : 'gray',
            textAlign: 'center',
        },
        navigationButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: theme === 'dark' ? '#2c2c2e' : '#f0f0f0',
        },
        navButton: {
            fontSize: 34,
            color: theme === 'dark' ? '#4fa4ff' : 'blue',
            fontWeight: 'bold',
            padding: 0,
        },
        disabledNavButton: {
            color: theme === 'dark' ? '#555555' : 'gray',
        },
        pageCounter: {
            fontSize: 16,
            color: theme === 'dark' ? '#cccccc' : 'black',
        },
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
    });



export default Procedure;
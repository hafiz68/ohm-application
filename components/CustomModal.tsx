import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useColorScheme, Image } from 'react-native';
import PagerView from 'react-native-pager-view';
import HTMLRenderer from './HTMLRenderer';
import { RFValue } from "react-native-responsive-fontsize"

const CustomModal = ({
    visible,
    onClose,
    procedureItems,
    currentPage,
    navigateToPage,
    pagerViewRef,
    setCurrentPage,
}) => {

    const handleAnswer = (answer: Answer) => {
        // Find the index of the procedure item where answer._id matches procedureItems[index].id
        var matchingIndex = -1
        if (answer._associate == 'endStep') {
            matchingIndex = procedureItems.length - 1
        } else {
            matchingIndex = procedureItems.findIndex(item => item.id === answer._associate);
        }
        if (matchingIndex !== -1) {
            console.log(`Matching item found at index: ${matchingIndex}`);
            navigateToPage(matchingIndex)
            // console.log('Matching item:', procedureItems[matchingIndex]);
            // Add your logic here, e.g., navigate to the page or perform an action
        } else {
            console.log('No matching item found for answer ID:', answer._associate);
        }
    };
    if (!visible) return null;
    const theme = useColorScheme(); // Returns 'dark' or 'light'
    const styles = themedStyles(theme);
    return (
        <View style={styles.overlay}>
            <View style={styles.modalContainer}>
                {/* <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity> */}
                <View style={styles.navigationButtons}>
                    {/* Previous Button */}
                    <TouchableOpacity
                        onPress={() => navigateToPage(currentPage - 1)}
                        disabled={currentPage === 0}
                    >
                        <Image
                            source={require('../assets/icon_arrow.png')}
                            style={[
                                styles.navButtonImage,
                                styles.rotatedButton, // Rotate the previous arrow
                                currentPage === 0 && styles.disabledNavButtonImage,
                            ]}
                        />
                    </TouchableOpacity>

                    {/* Page Counter */}
                    <Text style={styles.pageCounter}>
                        {currentPage + 1} / {procedureItems.length}
                    </Text>

                    {/* Next Button */}
                    <TouchableOpacity
                        onPress={() => navigateToPage(currentPage + 1)}
                        disabled={currentPage === procedureItems.length - 1}
                    >
                        <Image
                            source={require('../assets/icon_arrow.png')}
                            style={[
                                styles.navButtonImage,
                                currentPage === procedureItems.length - 1 &&
                                styles.disabledNavButtonImage,
                            ]}
                        />
                    </TouchableOpacity>
                </View>

                <PagerView
                    ref={pagerViewRef}
                    style={styles.viewPager}
                    initialPage={currentPage}
                    onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
                >
                    {procedureItems.map((item: Step | Decisions, index) => (
                        <ScrollView key={index.toString()}>
                            <View style={styles.page}>
                                <Text style={styles.pageTitle}>{item.title}</Text>
                                <HTMLRenderer htmlContent={item.info} />


                                {/* Check if item is a Decision and has answers */}
                                {item.answer?.length > 0 && (
                                    <View style={styles.answerContainer}>
                                        <Text style={styles.answerTitle}>Answersss:</Text>
                                        {item.answer.map((answer) => (
                                            <TouchableOpacity
                                                key={answer._id}
                                                style={styles.answerButton}
                                                onPress={() => handleAnswer(answer)}
                                            >
                                                <Text style={styles.answerText}>{answer._ans}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}


                            </View>
                        </ScrollView>
                    ))}
                </PagerView>
            </View>
        </View>
    );
};

const themedStyles = (theme) =>
    StyleSheet.create({
        navButtonImage: {
            width: 20,
            height: 20,
            tintColor: theme === 'dark' ? '#90caf9' : '#007bff', // Adjust if your image requires a tint
            padding: 18,
            marginVertical: 10
        },
        rotatedButton: {
            transform: [{ rotate: '180deg' }], // Rotates the image 180 degrees
        },
        disabledNavButtonImage: {
            tintColor: 'gray', // Style for disabled state
        },

        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: "7%"
        },
        modalContainer: {
            width: '100%',
            height: '100%',
            backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff',
            borderRadius: 0,
            padding: 0,
            elevation: 5,
        },
        closeButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            marginEnd: 10,
        },
        closeText: {
            fontSize: 24,

            fontWeight: 'bold',
            color: theme === 'dark' ? '#fff' : '#000',
        },
        navigationButtons: {
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            marginVertical: 0,
            backgroundColor: theme === 'dark' ? '#333333' : 'lightgray',
        },
        navButton: {
            fontSize: RFValue(40),
            fontFamily: 'bold',
            color: theme === 'dark' ? '#4fa4ff' : '#007bff',
        },
        disabledNavButton: {
            color: theme === 'dark' ? '#555555' : '#ccc',
        },
        pageCounter: {
            fontSize: 16,
            color: theme === 'dark' ? '#cccccc' : '#000000',
        },
        viewPager: {
            flex: 1,
        },
        page: {
            padding: 16,
            backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
        },
        pageTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        answerContainer: {
            marginTop: 20,
        },
        answerTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 8,
            color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        answerButton: {
            padding: 10,
            backgroundColor: '#f0f8ff',
            marginVertical: 5,
            borderRadius: 5,
        },
        answerText: {
            fontSize: 14,
            color: '#007aff',

        },
        stepContainer: {
            marginTop: 20,
        },
        stepInfo: {
            fontSize: 14,
            lineHeight: 20,
            color: '#333',
        },
    });

export default CustomModal;

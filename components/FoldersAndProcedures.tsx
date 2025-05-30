import React, { useState, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

import {
    View,
    Text,
    Modal,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Minus, Search } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const storage = new MMKV();

const FoldersAndProceduresModal = ({ modalVisible, setModalVisible, onProcedureSelect }) => {
    const [data, setData] = useState([]);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    const theme = useColorScheme();
    const styles = themedStyles(theme);

    useEffect(() => {
        if (modalVisible) {
            setLoading(true);
            loadStoredProcedures();
        }
    }, [modalVisible]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = searchProcedures(data, searchTerm.toLowerCase());
            setFilteredData(filtered);
            // Automatically expand folders containing matching procedures
            const foldersToExpand = {};
            filtered.forEach(folder => {
                markFoldersForExpansion(folder, foldersToExpand);
            });
            setExpandedFolders(prev => ({ ...prev, ...foldersToExpand }));
        } else {
            setFilteredData(data);
        }
    }, [searchTerm, data]);

    const markFoldersForExpansion = (folder, foldersToExpand) => {
        if (folder.procedures?.some(proc => proc.name.toLowerCase().includes(searchTerm.toLowerCase()))) {
            foldersToExpand[folder._id] = true;
        }
        folder.children?.forEach(child => {
            markFoldersForExpansion(child, foldersToExpand);
        });
    };

    const searchProcedures = (folders, term) => {
        return folders.map(folder => {
            const matchingProcedures = folder.procedures?.filter(
                proc => proc.name.toLowerCase().includes(term)
            ) || [];

            const matchingChildren = folder.children ?
                searchProcedures(folder.children, term) : [];

            if (matchingProcedures.length > 0 || matchingChildren.some(child =>
                child.procedures?.length > 0 || child.children?.length > 0)) {
                return {
                    ...folder,
                    procedures: matchingProcedures,
                    children: matchingChildren.filter(child =>
                        child.procedures?.length > 0 || child.children?.length > 0)
                };
            }
            return null;
        }).filter(Boolean);
    };

    const handleProcedureSelect = (procedure) => {
        onProcedureSelect(procedure);
        setModalVisible(false);
    };
    const loadStoredProcedures = () => {
        try {
            const storedData = storage.getString('foldersProcedures');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setData(parsedData.data);
                setFilteredData(parsedData.data);
            }
        } catch (err) {
            console.error('Error retrieving stored data:', err);
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    };
    // const loadStoredProcedures = async () => {
    //     try {
    //         const storedData = await AsyncStorage.getItem('foldersProcedures');
    //         if (storedData) {
    //             const parsedData = JSON.parse(storedData);
    //             setData(parsedData.data);
    //             setFilteredData(parsedData.data);
    //         }
    //     } catch (err) {
    //         console.error('Error retrieving stored data:', err);
    //     } finally {
    //         setTimeout(() => setLoading(false), 1000);
    //     }
    // };

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    const renderNestedItem = ({ item, depth = 0 }) => {
        const isExpanded = expandedFolders[item._id];

        return (
            <View style={{ marginLeft: depth * 5 }}>
                <TouchableOpacity
                    style={styles.folderContainer}
                    onPress={() => toggleFolder(item._id)}
                >
                    {isExpanded ? <Minus size={20} style={styles.iconStyle} /> : <Plus size={20} style={styles.iconStyle} />}
                    <Text style={styles.folderName}>{item.name}</Text>
                </TouchableOpacity>

                {isExpanded && (
                    <View>
                        {item.procedures && item.procedures.map((procedure) => (
                            <TouchableOpacity
                                key={procedure._id}
                                style={styles.procedureItem}
                                onPress={() => handleProcedureSelect(procedure)}
                            >
                                <Text style={styles.procedureText}>{procedure.name}</Text>
                            </TouchableOpacity>
                        ))}

                        {item.children && item.children.map((childFolder) => (
                            renderNestedItem({
                                item: childFolder,
                                depth: depth + 1
                            })
                        ))}
                    </View>
                )}
            </View>
        );
    };
    return (
        
       // <SafeAreaView style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    {!loading && (
                        <View style={styles.searchContainer}>
                            <Search size={20} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search Procedures and Folders"
                                placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                            />
                        </View>
                    )}

                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color="#FF5733"
                            style={styles.loadingIndicator}
                        />
                    ) : (
                        <FlatList
                            data={filteredData}
                            renderItem={({ item }) => renderNestedItem({ item })}
                            keyExtractor={(item) => item._id}
                        />
                    )}

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
       // </SafeAreaView>
    );
};

const themedStyles = (theme) => StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme === 'dark' ? '#2c2c2c' : '#f0f0f0',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 10,
        color: theme === 'dark' ? '#888' : '#666',
    },
    searchInput: {
        flex: 1,
        color: theme === 'dark' ? '#fff' : '#000',
        fontSize: 16,
        padding: 0,
    },
    procedureText: {
        color: theme === 'dark' ? '#fff' : '#000',
    },
    iconStyle: {
        color: theme === 'dark' ? '#f8f9fa' : '#121212',
        marginRight: 5,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa',
    },
    modalView: {
        backgroundColor: theme === 'dark' ? '#1e1e1e' : 'white',
        borderRadius: 0,
        padding: 35,
        shadowColor: theme === 'dark' ? '#fff' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: '100%',
        marginTop:16
    },
    folderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: theme === 'dark' ? '#2c2c2c' : '#f0f0f0',
    },
    folderName: {
        marginLeft: 1,
        fontWeight: 'bold',
        color: theme === 'dark' ? '#fff' : '#000',
    },
    procedureItem: {
        padding: 10,
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f9f9f9',
    },
    closeButton: {
        backgroundColor: theme === 'dark' ? 'white' : '#343434',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 15,
        alignSelf: 'center',
    },
    closeText: {
        color: theme === 'dark' ? 'black' : 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default FoldersAndProceduresModal;

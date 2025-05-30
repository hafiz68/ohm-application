import React, { useEffect, useState, useCallback } from 'react';
import {
    Platform,
    PermissionsAndroid,
    ToastAndroid,
    Alert
} from 'react-native';

// Check if running on Android 13 or higher
const isAndroid13OrHigher = Platform.OS === 'android' && Platform.Version >= 33;

export const usePermissions = () => {
    const [cameraPermission, setCameraPermission] = useState(false);
    const [storagePermission, setStoragePermission] = useState(false);
    const [permissionsChecked, setPermissionsChecked] = useState(false);

    const requestCameraPermission = useCallback(async () => {
        if (Platform.OS !== 'android') {
            setCameraPermission(true);
            return true;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message: "App needs access to your camera to scan QR code",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK",
                }
            );
            
            const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
            setCameraPermission(isGranted);
            
            if (!isGranted) {
                Alert.alert(
                    "Permission Denied", 
                    "Camera permission is required to scan QR codes",
                    [{ text: "OK" }]
                );
            }
            
            return isGranted;
        } catch (err) {
            console.error("Camera Permission Error:", err);
            setCameraPermission(false);
            return false;
        }
    }, []);

    const requestStoragePermission = useCallback(async () => {
        if (Platform.OS !== 'android') {
            setStoragePermission(true);
            return true;
        }

        try {
            // Use appropriate permissions based on Android version
            let permission;
            let message;
            
            if (isAndroid13OrHigher) {
                permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
                message = "App needs access to your photos to save QR code images";
            } else {
                permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
                message = "App needs access to storage to save QR code images";
            }
            
            const granted = await PermissionsAndroid.request(
                permission,
                {
                    title: "Storage Permission",
                    message: message,
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK",
                }
            );
            
            const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
            setStoragePermission(isGranted);
            
            if (!isGranted) {
                Alert.alert(
                    "Permission Denied", 
                    "Storage permission is required to save QR code images",
                    [{ text: "OK" }]
                );
            }
            
            return isGranted;
        } catch (err) {
            console.error("Storage Permission Error:", err);
            setStoragePermission(false);
            return false;
        }
    }, []);

    // This function requests all permissions at once
    const requestAllPermissions = useCallback(async () => {
        if (Platform.OS !== 'android') {
            setCameraPermission(true);
            setStoragePermission(true);
            setPermissionsChecked(true);
            return { camera: true, storage: true };
        }

        try {
            // Start with camera permission which is needed for all Android versions
            const permissions = [
                PermissionsAndroid.PERMISSIONS.CAMERA
            ];
            
            // Add appropriate storage permissions based on Android version
            if (isAndroid13OrHigher) {
                permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
                permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
            } else {
                permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
                permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
            }
            
            console.log("Requesting multiple permissions:", permissions);
            const results = await PermissionsAndroid.requestMultiple(permissions);
            
            // Check camera permission result
            const cameraGranted = results[PermissionsAndroid.PERMISSIONS.CAMERA] === 
                PermissionsAndroid.RESULTS.GRANTED;
            
            // Check storage permission results based on Android version
            let storageGranted = false;
            
            if (isAndroid13OrHigher) {
                const imagesGranted = results[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === 
                    PermissionsAndroid.RESULTS.GRANTED;
                const videoGranted = results[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === 
                    PermissionsAndroid.RESULTS.GRANTED;
                
                storageGranted = imagesGranted && videoGranted;
            } else {
                const writeGranted = results[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === 
                    PermissionsAndroid.RESULTS.GRANTED;
                const readGranted = results[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === 
                    PermissionsAndroid.RESULTS.GRANTED;
                
                storageGranted = writeGranted && readGranted;
            }
            
            // Update state
            setCameraPermission(cameraGranted);
            setStoragePermission(storageGranted);
            
            console.log("Permission results:", {
                camera: cameraGranted,
                storage: storageGranted
            });
            
            // Show appropriate alerts if permissions were denied
            if (!cameraGranted || !storageGranted) {
                Alert.alert(
                    "Permissions Required", 
                    "This app requires camera and storage permissions to function properly",
                    [{ 
                        text: "OK",
                        onPress: () => {
                            // Give user an option to open settings
                            if (Platform.OS === 'android') {
                                ToastAndroid.show(
                                    "Please enable permissions in app settings", 
                                    ToastAndroid.LONG
                                );
                            }
                        }
                    }]
                );
            }
            
            return { camera: cameraGranted, storage: storageGranted };
        } catch (err) {
            console.error("Permission Request Error:", err);
            setCameraPermission(false);
            setStoragePermission(false);
            return { camera: false, storage: false };
        } finally {
            setPermissionsChecked(true);
        }
    }, []);

    // Check if permissions are already granted
    const checkPermissions = useCallback(async () => {
        if (Platform.OS !== 'android') {
            setCameraPermission(true);
            setStoragePermission(true);
            setPermissionsChecked(true);
            return { camera: true, storage: true };
        }

        try {
            // Check camera permission
            const hasCameraPermission = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.CAMERA
            );
            
            // Check storage permissions based on Android version
            let hasStoragePermission = false;
            
            if (isAndroid13OrHigher) {
                const hasImagesPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                );
                const hasVideoPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
                );
                
                hasStoragePermission = hasImagesPermission && hasVideoPermission;
            } else {
                const hasWritePermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                const hasReadPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                );
                
                hasStoragePermission = hasWritePermission && hasReadPermission;
            }
            
            // Update state
            setCameraPermission(hasCameraPermission);
            setStoragePermission(hasStoragePermission);
            setPermissionsChecked(true);
            
            console.log("Current permissions:", {
                camera: hasCameraPermission,
                storage: hasStoragePermission
            });
            
            return { camera: hasCameraPermission, storage: hasStoragePermission };
        } catch (err) {
            console.error("Permission Check Error:", err);
            return { camera: false, storage: false };
        }
    }, []);

    useEffect(() => {
        // First check if permissions are already granted
        const initPermissions = async () => {
            const currentPermissions = await checkPermissions();
            
            // If any permission is missing, request all permissions
            if (!currentPermissions.camera || !currentPermissions.storage) {
                console.log("Some permissions are missing, requesting all permissions");
                // Add a slight delay to ensure React Native is fully initialized
                setTimeout(() => {
                    requestAllPermissions();
                }, 100);
            }
        };
        
        initPermissions();
    }, [checkPermissions, requestAllPermissions]);

    return { 
        cameraPermission, 
        storagePermission, 
        permissionsChecked,
        requestCameraPermission, 
        requestStoragePermission,
        requestAllPermissions,
        checkPermissions
    };
}
import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

interface CameraComponentProps {
  onCapture: (photo: string) => void;
  onClose: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, onClose }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');

  React.useEffect(() => {
    const checkPermission = async () => {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Camera Permission',
            'We need camera permission to take pictures',
            [{ text: 'OK', onPress: onClose }]
          );
        }
      }
    };

    checkPermission();
  }, [hasPermission, requestPermission, onClose]);

  const takePicture = useCallback(async () => {
    if (camera.current && isCameraReady) {
      try {
        const photo = await camera.current.takePhoto({
          qualityPrioritization: 'quality',
          flash: 'off',
        });
        
        // Pass the path to the photo to the parent
        onCapture(`file://${photo.path}`);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  }, [camera, isCameraReady, onCapture]);

  if (!hasPermission || !device) {
    return (
      <View style={styles.permissionContainer}>
        <Text>No camera permission or camera not available</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => setIsCameraReady(true)}
      />

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.captureButton} 
          onPress={takePicture}
          disabled={!isCameraReady}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default CameraComponent;
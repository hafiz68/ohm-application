import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';

interface QRScannerProps {
  onClose: () => void;
  onScanSuccess: (result: string) => void;
}

const QRCodeScanner: React.FC<QRScannerProps> = ({ onClose, onScanSuccess }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');

  useEffect(() => {
    const checkPermission = async () => {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Camera Permission',
            'We need camera permission to scan QR codes',
            [{ text: 'OK', onPress: onClose }]
          );
        }
      }
    };

    checkPermission();
  }, [hasPermission, requestPermission, onClose]);

  const handleBarCodeRead = async (scanResult) => {
    if (isScanning) {
      setIsScanning(false);
      const scannedData = scanResult.value;
      console.log('Scanned Data:', scannedData);

      // URL validation regex
      const urlRegex = /^(https?:\/\/)?([\d\.]+)(:\d+)?([\/\w\.-]*)\/?$/;

      if (urlRegex.test(scannedData)) {
        try {
          const response = await fetch(
            scannedData.startsWith('http') ? scannedData : `https://${scannedData}`,
            { method: 'GET' }
          );
          const result = await response.text();
          console.log('Fetch Result:', result);

          // Show confirmation dialog
          Alert.alert(
            'Procedure Found',
            'Procedure found for the scanned QR. Please confirm if you want to open this procedure?',
            [
              { text: 'Try Again', onPress: () => setIsScanning(true), style: 'cancel' },
              {
                text: 'Confirm', onPress: () => {
                  onScanSuccess(result);
                  onClose();
                }
              },
            ]
          );

        } catch (error) {
          Alert.alert('Error', 'Unable to fetch URL');
          console.error('Fetch Error:', error);
          onClose();
        }
      } else {
        Alert.alert('Invalid Data', 'The scanned data is not a valid URL');
        onClose();
      }
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isScanning) {
        handleBarCodeRead({ value: codes[0].value });
      }
    }
  });

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
        codeScanner={codeScanner}
        onInitialized={() => setIsCameraReady(true)}
      />

      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
            {/* QR Scanner Frame */}
            <View style={styles.frame}>
              <View style={[styles.cornerTL, styles.corner]} />
              <View style={[styles.cornerTR, styles.corner]} />
              <View style={[styles.cornerBL, styles.corner]} />
              <View style={[styles.cornerBR, styles.corner]} />
            </View>
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}>
          <Text style={styles.scanText}>Align the QR code within the box to scan</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const qrSize = width * 0.7;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    flexDirection: 'column',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    flexDirection: 'row',
    height: qrSize,
  },
  focusedContainer: {
    width: qrSize,
    height: qrSize,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: 'white',
    borderWidth: 2,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    marginHorizontal: 40,
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
  closeButton: {
    position: 'center',
    
    backgroundColor: '#AA1D20',
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

export default QRCodeScanner;
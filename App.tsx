import React, { useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BackHandler, StatusBar } from 'react-native';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import MainScreen from './components/MainScreen';
import ProcedureDetailsScreen from './components/ProcedureDetailsScreen';
import ScreenshotPrevention from './components/ScreenshotPrevention';
import { SafeAreaProvider } from 'react-native-safe-area-context';


export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  MainScreen: undefined;
  Main: undefined;
  ProcedureDetailsScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    let lastBackPressed = 0;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const currentRoute = navigation.getCurrentRoute();
        console.log("Current route:", currentRoute?.name); // Add this for debugging

        // If we're on Login screen, exit app immediately without any confirmation
        if (currentRoute?.name === 'Login') {
          // Force immediate exit without allowing default behavior
          setImmediate(() => {
            BackHandler.exitApp();
          });
          return true; // Prevent default behavior
        }

        // For other screens, handle normal back navigation
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        } else {
          BackHandler.exitApp();
          return true;
        }
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <ScreenshotPrevention
    onScreenshotTaken={() => {
      // You can add additional logic here, such as logging the attempt
      // or navigating to a warning screen
      console.log('Screenshot attempt detected');
      // Optional: Alert.alert('Security Alert', 'Screenshots are not allowed in this app.');
    }}
  >
    
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true
      }}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{
        gestureEnabled: false,
        headerLeft: null,
        headerBackVisible: false
      }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{
        gestureEnabled: false,
        headerLeft: null,
        headerBackVisible: false
      }} />
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="ProcedureDetailsScreen" component={ProcedureDetailsScreen} />
    </Stack.Navigator>
    </ScreenshotPrevention>
  );
};

const App: React.FC = () => {
  return (
    <>
     <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#23283A" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
    </>
  );
};

export default App;
// types/screenshot-prevent.d.ts
import { EmitterSubscription } from 'react-native';

declare module '@react-native-screenshots/prevent' {
    const RNScreenshotPrevent: {
        enabled(value: boolean): Promise<void>;
        addListener(callback: () => void): EmitterSubscription;
    };
    export default RNScreenshotPrevent;
}

declare module 'react-native-screenshot-detect' {
    export function addScreenshotListener(callback: () => void): EmitterSubscription;
}
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';

/** Android channel for high-priority notifications */
export async function configureNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

/** Ask permission, get Expo push token, save locally, and POST to backend (optional). */
export async function registerDeviceToken(
  backendBaseUrl: string,
  userJwt?: string
): Promise<string | null> {
  if (!Device.isDevice) return null;

  // permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  // get expo push token (SDK 53+)
  const projId =
    (Constants as any).expoConfig?.extra?.eas?.projectId ??
    (Constants as any).easConfig?.projectId;
  const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
    projectId: projId,
  });

  // persist locally
  try {
    await SecureStore.setItemAsync('pushToken', pushToken);
  } catch {}

  // send to backend (optional; ignore failures in dev)
  if (backendBaseUrl) {
    try {
      await axios.post(
        `${backendBaseUrl}/api/devices/register`,
        { pushToken, platform: Platform.OS },
        userJwt ? { headers: { Authorization: `Bearer ${userJwt}` } } : undefined
      );
    } catch {
      // ignore in dev
    }
  }
  return pushToken;
}

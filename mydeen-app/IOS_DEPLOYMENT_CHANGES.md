# iOS Deployment Configuration Changes

This document summarizes the changes made to enable successful iOS deployment of the MyDeen app.

## Files Changed

### 1. `.env` (NEW)
- Created environment configuration file with required API keys and backend URL
- Contains:
  - `BACKEND_BASE_URL=http://localhost:3000`
  - `GOOGLE_WEB_CLIENT_ID=62997929774-pl8bmdtkrb52fuc40el7v7fvatn48rrf.apps.googleusercontent.com`
  - `GOOGLE_MAPS_API_KEY=AIzaSyC6x94nYNw32pfUojUgVUIcoUYdbEMso-0`

### 2. `app.json` → `app.config.js` (RENAMED & UPDATED)
- Renamed from `.json` to `.js` to support environment variable interpolation
- Added iOS permissions in `infoPlist`:
  - `NSLocationWhenInUseUsageDescription` - for showing Qibla direction and nearby mosques
  - `NSLocationAlwaysAndWhenInUseUsageDescription` - for prayer reminders when app is closed
  - `NSMotionUsageDescription` - for compass functionality
  - `NSCameraUsageDescription` - for avatar upload
  - `NSUserNotificationUsageDescription` - for prayer and event notifications
  - `NSAppTransportSecurity: { NSAllowsArbitraryLoads: true }` - for HTTP requests
- Updated `extra` section to use environment variables:
  - `backendBaseUrl: process.env.BACKEND_BASE_URL`
  - `googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID`
  - `googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY`
- Added `plugins` section:
  - `["expo-build-properties", { "ios": { "useFrameworks": "static" } }]`

### 3. `src/screens/events/EventDetailScreen.tsx` (UPDATED)
- Added notification permission request before scheduling event reminders
- Gracefully handles permission denial while continuing with registration

### 4. `src/services/athan.ts` (UPDATED)
- Added notification permission request before scheduling prayer notifications
- Added permission request before scheduling daily content notifications
- Gracefully handles permission denial

### 5. `src/notifications/useContentNotifications.ts` (UPDATED)
- Added notification permission request before scheduling local notifications
- Consistent permission handling across the app

### 6. `src/services/notifications.ts` (UPDATED)
- Added notification permission request before immediate notifications
- Maintains consistent permission handling pattern

### 7. `package.json` (UPDATED)
- Added `expo-build-properties` dependency for iOS framework configuration

## Verification

All changes have been verified:
- ✅ Expo configuration loads successfully with all environment variables
- ✅ iOS permissions are correctly configured in app config
- ✅ Environment variables are properly passed to the app
- ✅ Location permissions were already correctly implemented
- ✅ Notification permissions now properly requested before use
- ✅ Google Maps and Google Sign-In use environment variables correctly
- ✅ Babel configuration correctly has reanimated plugin as last item

## Notes

- The `.env` file is normally gitignored for security but was included for demo purposes
- All existing functionality remains intact
- Changes are minimal and focused only on iOS deployment requirements
- Permission requests gracefully handle denial without breaking app functionality
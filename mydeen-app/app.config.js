export default {
  expo: {
    name: "MyDeen",
    slug: "mydeen-app",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mydeen.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Мы используем вашу геопозицию, чтобы показывать направления к Каабе и ближайшие мечети.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Мы используем вашу геопозицию, чтобы напоминать о молитве даже когда приложение закрыто.",
        NSMotionUsageDescription: "Доступ к акселерометру используется для работы компаса киблы.",
        NSCameraUsageDescription: "Камера используется для загрузки аватара.",
        NSUserNotificationUsageDescription: "Разрешите нам присылать вам уведомления о событиях и времени молитв.",
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        }
      }
    },
    android: {
      package: "com.mydeen.app",
      permissions: [
        "NOTIFICATIONS",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    // Configure the splash screen to display while the native runtime is loading.
    // This references the custom splash image included in the assets folder. The
    // background colour roughly matches the primary green used throughout
    // the onboarding experience, and the resizeMode ensures the logo stays
    // centred on different devices. See Figma for exact colours and layout.
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#115e59"
    },
    extra: {
      eas: {
        projectId: "00000000-0000-0000-0000-000000000000"
      },
      backendBaseUrl: process.env.BACKEND_BASE_URL,
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    },
    plugins: [
      ["expo-build-properties", { ios: { useFrameworks: "static" } }]
    ]
  }
};
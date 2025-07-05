# Expo: The Comprehensive Guide

This document provides a detailed reference for developing universal React Native applications using the Expo framework and its ecosystem.

## 1. Core Concepts

-   **Expo**: An open-source framework and platform for making universal React Native apps. It provides a suite of tools and services that simplify development, building, and deployment.
-   **Expo Go**: A sandboxed client app for quickly running and testing projects. It includes the Expo SDK but does not support custom native modules. Ideal for getting started and simple projects.
-   **Development Build**: A custom build of your own app that includes Expo's developer tools (`expo-dev-client`). This is the recommended approach for any serious development as it allows you to use *any* native library and have full control over the native side of your project.
-   **EAS (Expo Application Services)**: A suite of deeply integrated cloud services for building, submitting, and updating Expo and React Native apps.
-   **Expo Router**: A powerful file-based routing library for building universal navigation that works seamlessly across Android, iOS, and web.

---

## 2. Project Setup & Basic Commands

### Creating a New Project

Initialize a new project using the default template, which comes pre-configured with TypeScript and Expo Router.

```sh
$ bunx create-expo-app@latest my-app
$ cd my-app
```

### Starting the Development Server

The Metro bundler serves your JavaScript code and assets.

```sh
$ bunx expo start
```

**Terminal Shortcuts:**
-   `a`: Open on a connected Android device or emulator.
-   `i`: Open on a connected iOS device or simulator.
-   `w`: Open in a web browser.
-   `j`: Open the Hermes JavaScript debugger in Chrome.
-   `r`: Reload the app.
-   `m`: Open the in-app developer menu.
-   `?`: Show all commands.

### Installing Dependencies

Always use `bunx expo install` to ensure you get a version of the library that is compatible with your project's Expo SDK version.

```sh
# Install a library
$ bunx expo install expo-camera

# Install a development-only dependency
$ bunx expo install --dev jest-expo jest
```

---

## 3. Environment Setup

### Android (macOS/Linux/Windows)

1.  **Install Android Studio**: Download from the [official site](https://developer.android.com/studio). During setup, ensure you install the "Android SDK", "Android SDK Platform", and "Android Virtual Device".

2.  **Install SDK & Build Tools**: In Android Studio's SDK Manager (`More Actions > SDK Manager`):
    -   **SDK Platforms Tab**: Check the box for the latest Android API level.
    -   **SDK Tools Tab**: Ensure `Android SDK Build-Tools` (latest version), `Android Emulator`, and `Android SDK Platform-Tools` are installed.

3.  **Configure Environment Variables**:
    -   **`JAVA_HOME`**: Point to your JDK installation.
        -   macOS (Homebrew): `export JAVA_HOME=$(/usr/libexec/java_home -v 17)` (or your version)
        -   Linux/Windows: Set to the path of your JDK installation.
    -   **`ANDROID_HOME`**: Point to your Android SDK location.
        -   macOS: `export ANDROID_HOME=$HOME/Library/Android/sdk`
        -   Linux: `export ANDROID_HOME=$HOME/Android/Sdk`
        -   Windows: `%LOCALAPPDATA%\Android\Sdk`
    -   **Add to `PATH`**: Add SDK tools to your system's `PATH` for global access to `adb`.
        -   macOS/Linux (`.zshrc` or `.bash_profile`):
            ```sh
            export PATH=$PATH:$ANDROID_HOME/platform-tools
            export PATH=$PATH:$ANDROID_HOME/emulator
            ```
        -   Windows: Add `%LOCALAPPDATA%\Android\Sdk\platform-tools` and `%LOCALAPPDATA%\Android\Sdk\emulator` to your system's Path environment variable.

### iOS (macOS only)

1.  **Install Xcode**: Get it from the Mac App Store.
2.  **Install Command Line Tools**: Open Xcode, then go to `Xcode > Settings > Locations`. Select the latest version from the "Command Line Tools" dropdown.
3.  **Install an iOS Simulator**: Go to `Xcode > Settings > Components` and download a simulator for your desired iOS version.
4.  **Install CocoaPods**: `sudo gem install cocoapods`
5.  **Install Watchman**: `brew install watchman`

---

## 4. Expo Router: File-Based Routing

Expo Router maps files in the `app/` directory to navigable routes.

### Core Files & Conventions

-   **`app/`**: The root directory for all routes.
-   **`app/_layout.tsx`**: The **Root Layout**. It wraps the entire app. Use it for global context providers, loading fonts, and defining the top-level navigator.
-   **`app/index.tsx`**: The home screen or initial route of your app (matches the `/` path).
-   **`_layout.tsx`**: A file within any subdirectory of `app/` that defines a navigator (like `Stack` or `Tabs`) for all routes in that directory.
-   **Route Groups `(group-name)`**: Directories with parentheses in their names organize routes without adding segments to the URL path. Example: `app/(tabs)/home.tsx` maps to `/home`.
-   **Dynamic Routes `[param]`**: Directories or files with square brackets create routes with dynamic parameters. Example: `app/users/[id].tsx` matches `/users/123`.

### Stack Navigator

For a standard screen-by-screen navigation flow.

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  // Can add screenOptions to style all screens
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
```

### Tabs Navigator

For a bottom tab bar interface. Typically used within a route group.

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
      }}
    >
      <Tabs.Screen
        name="index" // Matches app/(tabs)/index.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings" // Matches app/(tabs)/settings.tsx
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome name="cog" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Navigation and Linking

-   **`<Link>` component**: The primary way to navigate. It's a universal component that renders as an `<a>` tag on the web.
    ```tsx
    import { Link } from 'expo-router';
    
    // Simple path
    <Link href="/settings">Go to Settings</Link>
    
    // Dynamic route with params
    <Link href={{ pathname: '/users/[id]', params: { id: '42' } }}>
      View User 42
    </Link>
    ```
-   **`useRouter` hook**: For imperative navigation (e.g., after a form submission).
    ```tsx
    import { useRouter } from 'expo-router';
    const router = useRouter();
    
    // Navigate
    router.push('/profile');
    // Go back
    router.back();
    // Replace current screen in history
    router.replace('/dashboard');
    ```

### Accessing Route Parameters

Use the `useLocalSearchParams` hook to get parameters for the currently focused route.

```tsx
// app/users/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function UserProfile() {
  const { id } = useLocalSearchParams(); // For URL /users/123, id will be "123"
  return <Text>User ID: {id}</Text>;
}
```

---

## 5. Key Development Topics

### UI & Assets

-   **Images (`expo-image`)**: Recommended over React Native's `<Image>` for better performance and caching.
    `<Image source={require('./assets/logo.png')} style={{ width: 100, height: 100 }} />`
-   **Vector Icons (`@expo/vector-icons`)**: Access thousands of icons.
    `import { Ionicons } from '@expo/vector-icons';`
    `<Ionicons name="md-checkmark-circle" size={32} color="green" />`
-   **Custom Fonts (`expo-font`)**:
    ```tsx
    import { useFonts } from 'expo-font';
    const [fontsLoaded] = useFonts({ 'Roboto-Bold': require('./assets/Roboto-Bold.ttf') });
    if (!fontsLoaded) return null; // Render loading state
    ```
-   **Safe Areas (`react-native-safe-area-context`)**:
    `<SafeAreaView style={{ flex: 1 }}>{/* App content */}</SafeAreaView>`

### Configuration (`app.json` / `app.config.js`)

Your app's central configuration file.

-   **`name`**, **`slug`**: App name and URL-friendly slug.
-   **`version`**: The user-facing version string (e.g., "1.0.0").
-   **`ios.bundleIdentifier`**, **`android.package`**: Unique identifiers for each store.
-   **`plugins`**: Configure native code modifications.
-   **`extra`**: Pass custom data to your app at runtime via `Constants.expoConfig.extra`.

**Dynamic Configuration (`app.config.js`)**
Use JavaScript for environment-based configurations.

```js
// app.config.js
module.exports = ({ config }) => {
  if (process.env.MY_ENV === 'production') {
    config.extra.api_url = 'https://prod.api.com';
  } else {
    config.extra.api_url = 'https://staging.api.com';
  }
  return config;
};
```

### Push Notifications

A multi-step process for engaging users.

1.  **Install dependencies**:
    `$ bunx expo install expo-notifications expo-device expo-constants`

2.  **Get Push Token**: Request permission and retrieve the unique `ExpoPushToken`.
    ```ts
    import * as Device from 'expo-device';
    import * as Notifications from 'expo-notifications';
    import Constants from 'expo-constants';

    async function getPushToken() {
      if (!Device.isDevice) {
        throw new Error('Push notifications are only available on physical devices.');
      }
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        throw new Error('Permission to receive push notifications was denied.');
      }
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        throw new Error('Could not find project ID. Is your app configured for EAS?');
      }
      return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    }
    ```
3.  **Configure Credentials**:
    -   **Android**: Create a Firebase project, get your **google-services.json** file, and upload your FCM Server Key to EAS.
    -   **iOS**: EAS Build can create and manage your APNs key and certificates automatically.

4.  **Send Notifications**: Send the user's `ExpoPushToken` to your backend server. Use a server-side library like `expo-server-sdk-node` to send notifications via Expo's push service.

### Testing with Jest

`jest-expo` provides a preset for testing Expo projects.

1.  **Install**: `$ bunx expo install jest-expo jest @types/jest --dev`
2.  **Configure `package.json`**:
    ```json
    "scripts": {
      "test": "jest"
    },
    "jest": {
      "preset": "jest-expo",
      "transformIgnorePatterns": [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
      ]
    }
    ```

---

## 6. EAS: Build, Submit, Update

### Setup EAS

1.  **Install EAS CLI**: `bun install -g eas-cli`
2.  **Login to your Expo account**: `eas login`
3.  **Configure project for EAS**: `eas build:configure` (this creates `eas.json`)

### Development Builds

Create a custom build of your app for development.

1.  **Install dev client**: `$ bunx expo install expo-dev-client`
2.  **Build**: `$ eas build --profile development --platform <android|ios>`
3.  Install the generated `.apk` or `.ipa` file on your device.
4.  Run `$ bunx expo start`, scan the QR code, and the project will open in your development build.

### Production Builds

Create optimized, signed builds ready for the app stores.

1.  The `production` profile in **eas.json** is configured by default.
2.  **Build**: `$ eas build --profile production --platform <android|ios|all>`
3.  EAS will guide you through setting up or using existing signing credentials.

### Submitting to Stores

Automate the process of uploading your binary to the app stores.

```sh
$ eas submit --platform <android|ios>
```

-   You must have a paid developer account for each store.
-   The first submission to Google Play must be done manually through the Play Console.

### Over-the-Air (OTA) Updates

Push updates to your app's JavaScript and assets without a new store release.

1.  **Configure updates**: `$ eas update:configure`
    -   This adds an `updates.url` to **app.json** and `channel` properties to build profiles in **eas.json**.
    -   You must create a new build after this step for updates to work.
2.  **Publish an Update**:
    `$ eas update --branch production --message "A descriptive message"`
    -   Users on builds configured with the `production` channel will receive this update the next time they open the app.

---

## 7. Troubleshooting

### Clearing Caches

This is often the first step to resolving strange bundler or dependency issues.

```sh
# Stop the dev server
$ rm -rf node_modules .expo
$ bun install
$ bunx expo start --clear
```

### Common Errors

-   **`React Native version mismatch`**: The JavaScript version from Metro doesn't match the native version in the installed app.
    -   **Cause**: Often occurs after upgrading or when connecting to a stale Metro server.
    -   **Fix**: Stop all dev servers. Run `bunx expo install --fix`. If using a development build, create a new one after upgrading.
-   **`Application "main" has not been registered`**: A critical JavaScript error is happening at the root of your application, preventing it from starting.
    -   **Cause**: This error is a symptom, not the root cause.
    -   **Fix**: Check your terminal or device logs for the *actual* error that occurred just before this one. It's often an import error or a syntax error in your root component (`_layout.tsx` or `App.tsx`).

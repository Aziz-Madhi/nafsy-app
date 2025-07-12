import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/theme";

export default function NotFoundScreen() {
  // Handle case where ThemeProvider might not be available yet
  let colors;
  try {
    const theme = useAppTheme();
    colors = theme.colors;
  } catch (error) {
    // Fallback colors when ThemeProvider is not available
    colors = {
      background: { primary: '#FFFFFF' },
      text: { primary: '#000000' },
      interactive: { primary: '#007AFF' }
    };
  }
  const styles = createStyles(colors);

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: colors.interactive.primary,
  },
});
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Token cache implementation for Clerk
// Uses SecureStore on native platforms for secure token storage
export const tokenCache = {
  async getToken(key: string) {
    try {
      if (Platform.OS === "web") {
        // Use localStorage for web
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      return null;
    }
  },
  
  async saveToken(key: string, value: string) {
    try {
      if (Platform.OS === "web") {
        // Use localStorage for web
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("SecureStore save item error: ", error);
    }
  },
  
  async deleteToken(key: string) {
    try {
      if (Platform.OS === "web") {
        // Use localStorage for web
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("SecureStore delete item error: ", error);
    }
  },
};
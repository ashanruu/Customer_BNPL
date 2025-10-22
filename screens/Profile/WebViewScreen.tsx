import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

// ✅ Updated type definitions to include route params
type RootStackParamList = {
  WebViewScreen: { url?: string; jobId?: number };
  CardAddedSuccess: { message: string };
  CardAddFailed: { message: string };
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "WebViewScreen">;
  route: RouteProp<RootStackParamList, "WebViewScreen">;
};

export default function WebViewScreen({ navigation, route }: Props) {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUrl = async () => {
      try {
        // Check if URL is passed from navigation params
        const { url: passedUrl, jobId } = route.params || {};

          // Use the URL passed from ProfileScreen
          console.log("Using passed URL:", passedUrl);
          //setUrl(passedUrl);
        
          const response = await fetch(new URL(passedUrl || ""));
          const data = await response.json();

          // The API returns nested JSON inside `json.data.link`
          const link = data?.json?.data?.link;
          if (link) {
            setUrl(link);
          }
        
      } catch (error) {
        console.error("Error initializing URL:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeUrl();
  }, [route.params]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Waiting for data...</Text>
      </View>
    );
  }

  if (!url) {
    return (
      <View style={styles.center}>
        <Text>Failed to load URL</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: url }}
      style={{ flex: 1 }}
      onNavigationStateChange={(event) => {
        if (event.url.includes("card-return.php")) {
          const params = new URLSearchParams(event.url.split("?")[1]);
          const description = params.get("description") || "";

          if (description.includes("Successful")) {
            navigation.replace("CardAddedSuccess", { message: description });
          } else {
            navigation.replace("CardAddFailed", { message: description });
          }
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

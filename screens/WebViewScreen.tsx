import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { StackNavigationProp } from "@react-navigation/stack";

// ✅ Accept navigation prop from React Navigation
type RootStackParamList = {
  WebViewScreen: undefined;
  CardAddedSuccess: { message: string };
  CardAddFailed: { message: string };
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "WebViewScreen">;
};

export default function WebViewScreen({ navigation }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await fetch("https://hexdive.com/dpay.php");
        const data = await response.json();

        // The API returns nested JSON inside `json.data.link`
        const link = data?.json?.data?.link;
        if (link) {
          setUrl(link);
        }
      } catch (error) {
        console.error("Error fetching API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, []);

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

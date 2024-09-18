import { Stack } from "expo-router";
import { Image } from 'react-native';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#56BA54',
        },
        headerTitle: '',
        headerTintColor: '#fff',
        headerLeft: () => (
          <Image
            source={require('../assets/images/fecitel-logo.png')}
            style={{ width: 150, height: 30, marginLeft: 15, }}
            resizeMode="contain"
          />
        ),
        headerRight: () => (
          <Image
            source={require('../assets/images/cossoftware-logo.png')}
            style={{ width: 50, height: 40, marginRight: 15 }}
            resizeMode="contain"
          />
        ),
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="list" />
      <Stack.Screen name="login" options={{ headerShown: false }}/>
      <Stack.Screen name="qr" />
      <Stack.Screen name="questionnaire" />
    </Stack>
  );
}

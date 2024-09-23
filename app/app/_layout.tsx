import { Stack } from "expo-router";
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
        headerRight: () => {
          const navigation = useNavigation();
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
              <Text style={{ marginRight: 10 }}>André</Text>
              <TouchableOpacity onPress={() => navigation.navigate('/logout')}>
                <Text style={{ color: 'white' }}>Sair</Text>
              </TouchableOpacity>
              <Image
                source={require('../assets/images/cossoftware-logo.png')}
                style={{ width: 50, height: 40, marginLeft: 15 }}
                resizeMode="contain"
              />
            </View>
          );
        },
      }}>
      <Stack.Screen name="list" />
      <Stack.Screen name="login" options={{ headerShown: false }}/>
      <Stack.Screen name="questionnaire"/>
    </Stack>
  );
}

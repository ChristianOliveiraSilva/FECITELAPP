import { Image, TouchableOpacity } from 'react-native';
import Index from './index';
import List from './list';
import QR from './qr';
import Login from './login';
import Questionnaire from './questionnaire/[assessmentId]';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  return (
    <Drawer.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#56BA54',
        },
        headerTitle: '',
        headerTintColor: '#fff',
        headerLeft: () => (
          <Image
            source={require('../assets/images/fecitel-logo.png')}
            style={{ width: 150, height: 30, marginLeft: 15 }}
            resizeMode="contain"
          />
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Image
              source={require('../assets/images/cossoftware-logo.png')}
              style={{ width: 50, height: 40, marginRight: 15 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen name="index" component={Index} />
      <Drawer.Screen name="list" component={List} />
      <Drawer.Screen name="qr" component={QR} />
      <Drawer.Screen name="login" component={Login} options={{ headerShown: false }}/>
      <Drawer.Screen name="questionnaire/[assessmentId]" component={Questionnaire}/>
    </Drawer.Navigator>
  );
}

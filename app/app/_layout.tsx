import { Image, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Index from './index';
import List from './list';
import QR from './qr';
import Login from './login';
import Questionnaire from './questionnaire/[assessmentId]';

const handleLogout = () => {
};

const CustomDrawerContent = ({ user }) => {
    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.userProfilePicture}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/user.png' }}
                        style={{ width: 30, height: 35 }}
                    />
                </View>
                <Text style={{ marginLeft: 15, fontSize: 17 }}>Ana Clara</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={{ marginTop: 40 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/?size=100&id=22112&format=png&color=ff0000' }}
                        style={{ width: 30, height: 30, marginRight: 15 }}
                    />
                    <Text style={{ color: '#FF0000', fontSize: 16, fontWeight: '500' }}>Sair</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const Drawer = createDrawerNavigator();

export default function RootLayout({ user }) {
    return (
        <Drawer.Navigator
            drawerContent={props => <CustomDrawerContent {...props} user={user} />}
            screenOptions={({ navigation }) => ({
                drawerPosition: "right",
                drawerType: 'front',
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
                            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu.png' }}
                            style={{ width: 25, height: 40, marginRight: 15 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                ),
                drawerStyle: {
                    width: 300,
                },
                overlayColor: 'rgba(0, 0, 0, 0.5)',
            })}>
            <Drawer.Screen name="index" component={Index} />
            <Drawer.Screen name="list" component={List} />
            <Drawer.Screen name="qr" component={QR} />
            <Drawer.Screen name="login" component={Login} options={{ headerShown: false }} />
            <Drawer.Screen name="questionnaire/[assessmentId]" component={Questionnaire} options={{ headerShown: false }} />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    userProfilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#94E092',
        justifyContent: 'center',
        alignItems: 'center',
    },
})
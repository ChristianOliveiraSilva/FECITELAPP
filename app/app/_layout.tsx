import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, View, Text, StyleSheet, ActivityIndicator, CommonActions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Index from './index';
import List from './list';
import QR from './qr';
import Login from './login';
import Questionnaire from './questionnaire/[assessmentId]';
import { useRouter } from 'expo-router';
import { useUser, UserProvider  } from './UserContext';

const router = useRouter();

const CustomDrawerContent = () => {
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch('http://localhost/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            localStorage.removeItem('key');
            localStorage.removeItem('user');
            router.push('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.drawerContainer}>
            <View style={styles.headerSection}>
                <View style={styles.userProfilePicture}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/user.png' }}
                        style={styles.profileImage}
                    />
                </View>
                {user ? (
                    <>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                    </>
                ) : (
                    <Text style={styles.userName}>Carregando...</Text>
                )}
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#56BA54" />
                </View>
            ) : (
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <View style={styles.logoutRow}>
                        <Image
                            source={{ uri: 'https://img.icons8.com/?size=100&id=BdksXmxLaK8r&format=png&color=FF0000' }}
                            style={styles.logoutIcon}
                        />
                        <Text style={styles.logoutText}>Sair</Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
};

const Drawer = createDrawerNavigator();

export default function RootLayout() {
    return (
        <UserProvider>
            <Drawer.Navigator
                drawerContent={props => <CustomDrawerContent {...props} />}
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
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.openDrawer()}>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu.png' }}
                                style={styles.menuIcon}
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
        </UserProvider>
    );
}

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerSection: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        backgroundColor: '#56BA54',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    userProfilePicture: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'lightgrey',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: 40,
        height: 45,
    },
    userName: {
        fontSize: 20,
        color: '#fff',
        marginTop: 15,
        fontWeight: '500',
    },
    userEmail: {
        fontSize: 15,
        color: '#fff',
        marginTop: 2,
    },
    logoutButton: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    logoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutIcon: {
        width: 30,
        height: 25,
        marginRight: 20,
    },
    logoutText: {
        color: '#FF0000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerLogo: {
        width: 150,
        height: 30,
        marginLeft: 15,
    },
    menuIcon: {
        width: 25,
        height: 40,
        marginRight: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

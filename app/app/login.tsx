import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image, } from 'react-native';

const Login = () => {
  const [pin, setPin] = useState('');

  const handleLogin = () => {
    console.log({ pin })
    if (pin === '1234') {
      Alert.alert('Login bem-sucedido!', 'Você foi autenticado com sucesso.');
    } else {
      Alert.alert('Erro', 'PIN incorreto. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/ifms-feira-de-ciencia.jpg')}
        style={{ height: 230, marginBottom: 50, marginTop: 80}}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        Faça login com o PIN fornecido
      </Text>

      <TextInput
        style={[styles.input, { color: pin ? 'black' : 'grey' }]}
        placeholder="PIN"
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 18,
    maxWidth: 500, 
  },
  button: {
    backgroundColor: '#56BA54',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: '80%',
    maxWidth: 500,

  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Login;

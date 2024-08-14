import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';

const Index = () => {
  const [pin, setPin] = useState('');

  const handleLogin = () => {
    console.log({pin})
    if (pin === '1234') {
      Alert.alert('Login bem-sucedido!', 'Você foi autenticado com sucesso.');
    } else {
      Alert.alert('Erro', 'PIN incorreto. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Faça Login com o PIN fornecido
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Digite seu PIN"
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
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
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Index;

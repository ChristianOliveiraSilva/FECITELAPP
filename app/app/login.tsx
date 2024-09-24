import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image, } from 'react-native';

const Index = () => {
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const handleLogin = async () => {

    if (pin.length < 4) {
      setMsg('Erro: PIN incorreto. Tente novamente.');
      return false
    }
    
    try {
      const response = await fetch('http://localhost/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          PIN: pin
        })
      });
      
      const data = await response.json();
      
      if (data.status === true) {
        localStorage.setItem('key', data.data.plainTextToken)
        router.push('/list');
      } else {
        setMsg(data.message);
      }
    } catch (error) {
      setMsg(error.message);
      console.error('Erro:', error);
      return false;
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

      {msg && <Text style={styles.textMsg}>{msg}</Text>}

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
    outlineStyle: 'none',
  },
  textMsg: {
    color: 'red',
    fontSize: 16,
    marginBottom: 30,
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

export default Index;

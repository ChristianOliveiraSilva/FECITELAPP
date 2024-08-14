import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';

// Função para simular a requisição das questões
const fetchQuestions = async () => {
  return [
    { id: '1', question: 'Como você avalia a qualidade do produto?' },
    { id: '2', question: 'Como você avalia o atendimento ao cliente?' },
    { id: '3', question: 'Qual a probabilidade de você recomendar o produto a um amigo?' },
    { id: '4', question: 'O produto atendeu às suas expectativas?' },
    { id: '5', question: 'Como você avalia a facilidade de uso do produto?' },
    { id: '6', question: 'Qual é o seu nível de satisfação com o preço do produto?' },
    { id: '7', question: 'Como você avalia a entrega do produto?' },
    { id: '8', question: 'Você encontrou algum problema ao usar o produto?' },
    { id: '9', question: 'O produto possui as características que você esperava?' },
    { id: '10', question: 'Você considera que o suporte ao cliente foi eficiente?' },
  ];
};

export default function Questionnaire() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      const data = await fetchQuestions();
      setQuestions(data);
    };

    loadQuestions();
  }, []);

  const handleAnswer = (score) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = { question: questions[currentQuestionIndex].question, score };
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderReadyScreen = () => (
    <View style={styles.readyContainer}>
      <Text style={styles.title}>Você está pronto para começar?</Text>
      <TouchableOpacity style={styles.button} onPress={() => setIsReady(true)}>
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuestionScreen = () => (
    <View style={styles.container}>
      <Text style={styles.question}>{questions[currentQuestionIndex].question}</Text>
      <FlatList
        data={[...Array(10).keys()].map(n => n + 1)} // Números de 1 a 10
        numColumns={5}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.optionButton} onPress={() => handleAnswer(item)}>
            <Text style={styles.optionText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.navigationContainer}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Text style={styles.navButtonText}>Voltar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderResultsScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Suas Respostas:</Text>
      {answers.map((answer, index) => (
        <Text key={index} style={styles.resultText}>
          {index + 1}. {answer.question} - Nota: {answer.score || 'Pulado'}
        </Text>
      ))}
      
      <View style={styles.containerInline}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
          <Text style={styles.navButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
          <Text style={styles.navButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isReady) {
    return renderReadyScreen();
  } else if (showResults) {
    return renderResultsScreen();
  } else {
    return renderQuestionScreen();
  }
}

const styles = StyleSheet.create({
  readyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  containerInline: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  question: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#1E90FF',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
  },
  navigationContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

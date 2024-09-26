import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import Header from './header';
import { useNavigation } from '@react-navigation/native';

const MULTIPLE_CHOICE_QUESTION = 1;

const fetchAssessment = async (assessmentId: number) => {
  try {
    const assessmentsResponse = await fetch('http://localhost/assessments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('key')}`,
        'Content-Type': 'application/json',
      }
    });

    if (!assessmentsResponse.ok) {
      throw new Error('Erro ao buscar os assessments');
    }

    const assessmentsData = await assessmentsResponse.json();
    const assessment = assessmentsData.find((a: any) => a.id == assessmentId);

    if (!assessment) {
      throw new Error('Assessment não encontrado');
    }

    return {
      id: assessment.id,
      projectName: assessment.project.title,
      projectId: assessment.project.external_id,
      studentNames: assessment.project.students.map((student: any) => student.name).join(', '),
      description: assessment.project.description,
      year: assessment.project.year,
      type: assessment.project.type,
      category: assessment.project.category.name,
    };

  } catch (error) {
    console.error('Erro:', error);
    return {};
  }
};

const fetchQuestions = async (assessmentId: number) => {
  try {
    const response = await fetch(`http://localhost/questions/${assessmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('key')}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default function Questionnaire({ route }) {
  const { assessmentId } = route.params;
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [assessment, setAssessment] = useState([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [screen, setScreen] = useState(0);
  const [msg, setMsg] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const loadProjectAndQuestions = async () => {
      try {
        setIsLoading(true);

        const assessmentData: any = await fetchAssessment(assessmentId);
        setAssessment(assessmentData);

        const questionsData: any = await fetchQuestions(assessmentId);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectAndQuestions();
  }, [assessmentId]);

  const alertMsg = (msg) => {
    setMsg(msg)

    setTimeout(() => {
      setMsg(null)
    }, 2500);
  }

  const handleAnswer = (value: any) => {
    const currentQuestion = questions[currentQuestionIndex];

    const newAnswers = [...answers];
    
    newAnswers[currentQuestionIndex] = {
      question_id: currentQuestion.id,
      value,
      type: currentQuestion.type,
    };

    setAnswers(newAnswers);
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answerQuestion = answers[currentQuestionIndex];
    
    if (currentQuestion.type === MULTIPLE_CHOICE_QUESTION && answerQuestion == null) {
      alertMsg('Esta pergunta é obrigatória.');
      return;
    }
  
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      nextScreen()
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleNextAndAnswer = (value: any) => {
    handleAnswer(value);
    handleNext();
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([])
    setScreen(0);
    setMsg(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('key')}`,
        },
        body: JSON.stringify({
          responses: answers,
          assessment: assessmentId,
        }),
      });

      if (response.ok) {
        navigation.navigate('list');
      } else {
        console.error('Erro ao enviar resposta:', await response.text());
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextScreen = () => {
    setScreen(screen + 1)
  }

  const renderIsReadyScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.readyContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Detalhes do Projeto</Text>
          <View style={[styles.projectDetails, { flexDirection: 'row' }]}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{assessment.projectId}</Text>
          </View>
          <View style={[styles.projectDetails, { flexDirection: 'column' }]}>
            <Text style={styles.label}>Título:</Text>
            <Text style={styles.value}>{assessment.projectName}</Text>
          </View>
          <View style={[styles.projectDetails, { flexDirection: 'row' }]}>
            <Text style={styles.label}>Tipo de projeto:</Text>
            <Text style={styles.value}>{assessment.type == 2 ? 'Científico' : 'Tecnológico'}</Text>
          </View>
          <View style={[styles.projectDetails, { flexDirection: 'column' }]}>
            <Text style={styles.label}>Categoria:</Text>
            <Text style={styles.value}>{assessment.category}</Text>
          </View>
          <View style={[styles.projectDetails, { flexDirection: 'row' }]}>
            <Text style={styles.label}>Ano:</Text>
            <Text style={styles.value}>{assessment.year}</Text>
          </View>
          <View style={[styles.projectDetails, { flexDirection: 'column' }]}>
            <Text style={styles.label}>Estudante(s):</Text>
            <Text style={styles.value}>{assessment.studentNames}</Text>
          </View>
          <View style={[styles.projectDetails, { flexDirection: 'column' }]}>
            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.value}>{assessment.description}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={nextScreen}>
          <Text style={styles.buttonText}>Iniciar Avaliação</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#BEC0C2', marginTop: 10 }]} onPress={() => router.replace('/list')}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderMultipleChoiceQuestionScreen = () => {
    const currentQuestion = questions[currentQuestionIndex]

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header project={assessment} />
        <View style={styles.container}>
          <Text style={styles.question}>{currentQuestionIndex + 1}. {currentQuestion.text}</Text>
          <FlatList
            data={[...Array(currentQuestion.number_alternatives + 1).keys()]}
            numColumns={5}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  answers[currentQuestionIndex]?.value === item && styles.selectedOptionButton
                ]}
                onPress={() => handleAnswer(item)}>
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          {msg && <Text>{msg}</Text>}
          <View style={styles.navigationContainer}>
            {currentQuestionIndex > 0 && (
              <TouchableOpacity
                style={[
                  styles.navBackButton,
                  { marginHorizontal: 5, width: '55%' }
                ]}
                onPress={handlePrevious}>
                <Text style={styles.navButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, { marginHorizontal: 5, width: '55%' }]}
                onPress={handleNext}>
                <Text style={styles.navButtonText}>Avançar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, { marginHorizontal: 5, width: '55%' }]}
                onPress={handleNext}>
                <Text style={styles.navButtonText}>Finalizar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  const renderOpenEndedQuestionScreen = () => {
    const currentQuestion = questions[currentQuestionIndex]

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header project={assessment} />
        <View style={styles.container}>
          <Text style={styles.question}>{currentQuestionIndex + 1}. {currentQuestion.text}</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Digite a sua resposta"
            value={answers[currentQuestionIndex]?.value}
            onChangeText={(value: string) => handleAnswer(value)} 
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
          <View style={styles.navigationContainer}>
            {currentQuestionIndex > 0 && (
              <TouchableOpacity
                style={[styles.navBackButton, { marginHorizontal: 5, width: '55%' }]}
                onPress={handlePrevious}>
                <Text style={styles.navButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, { marginHorizontal: 5, width: '55%' }]}
                onPress={() => handleNextAndAnswer(answers[currentQuestionIndex]?.value)}>
                <Text style={styles.navButtonText}>Avançar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, { marginHorizontal: 5, width: '55%' }]}
                onPress={() => handleNextAndAnswer(answers[currentQuestionIndex]?.value)}>
                <Text style={styles.navButtonText}>Finalizar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    )
  };

  const renderQuestionScreen = () => {
    if (questions && questions.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Sem perguntas? 😄 Contate um administrador</Text>
        </View>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.type === MULTIPLE_CHOICE_QUESTION) {
      return renderMultipleChoiceQuestionScreen();
    } else {
      return renderOpenEndedQuestionScreen();
    }
  };

  const renderResultsScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Header project={assessment} />
      <View style={styles.container}>
        <Text style={[styles.title, { marginTop: 40 }]}>Suas Respostas:</Text>
        {answers.map((answer, index) => {
          const questionText = questions.find((q) => q.id === answer.question_id)?.text || 'Pergunta não encontrada';
          return (
            <View key={index} style={styles.answerContainer}>
              <Text style={styles.questionText}>{index + 1}. {questionText}</Text>
              <Text style={styles.answerText}>{answer.value != null ? answer.value : '-'}</Text>
            </View>
          );
        })}

        <View style={styles.navigationContainer}>
          <TouchableOpacity style={[styles.navBackButton, { marginHorizontal: 5, width: '55%' }]} onPress={handleRestart}>
            <Text style={styles.navButtonText}>Refazer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, { marginHorizontal: 5, width: '55%' }]}
            onPress={handleSave}>
            <Text style={styles.navButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#56BA54" />
      </View>
    );
  }

  const pages = [
    renderIsReadyScreen,
    renderQuestionScreen,
    renderResultsScreen,
  ];

  const currentPage = pages[screen]
  
  if (currentPage) {
    return currentPage();
  }

  return <Text>Falha</Text>
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerInline: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    fontSize: 20,
    marginTop: 40,
    marginBottom: 30,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#BEC0C2',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: '#4CAF50',
  },
  optionText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'center',
    maxWidth: 800,
    paddingHorizontal: 20,
  },
  projectContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  projectStudents: {
    fontSize: 18,
  },
  resultText: {
    fontSize: 16,
    marginVertical: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    width: '100%',
    height: 400,
    borderRadius: 6,
    maxWidth: 800,
    fontSize: 16,
  },
  readyContainer: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginBottom: 30,
    width: '100%',
    maxWidth: 800,
  },
  projectDetails: {
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
    color: '#555',
  },
  value: {
    flex: 1,
    color: '#333',
    fontSize: 18,
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
    width: '100%',
    maxWidth: 800,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '500',
  },
  navButton: {
    backgroundColor: '#56BA54',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 6,
    maxWidth: 500,
  },
  navBackButton: {
    backgroundColor: '#BEC0C2',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 6,
    maxWidth: 500,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '500',
  },
  answerContainer: {
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
    width: '100%',
    maxWidth: 800,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  answerText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Dimensions, ScrollView } from 'react-native';

const fetchProject = async (assessmentId) => {
  try {
    const assessmentsResponse = await fetch('http://localhost/assessments');
    if (!assessmentsResponse.ok) {
      throw new Error('Erro ao buscar os assessments');
    }

    const assessmentsData = await assessmentsResponse.json();
    const assessment = assessmentsData.find((a) => a.id == assessmentId);

    if (!assessment) {
      throw new Error('Assessment não encontrado');
    }

    return {
      id: assessment.id,
      projectName: assessment.project.title,
      studentNames: assessment.project.students.map((student: any) => student.name).join(', '),
      description: assessment.project.description,
      year: assessment.project.year,
      type: assessment.project.type,
      category: assessment.project.category_id,
    };

  } catch (error) {
    console.error('Erro:', error);
    return {};
  }
};

const fetchQuestions = async () => {
  try {
    const response = await fetch('http://localhost/questions');

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    return data;
  } catch (error) {
    return [];
  }
};

const MULTIPLE_CHOICE_QUESTION = 1;

export default function Questionnaire() {
  const { assessmentId } = useLocalSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [project, setProject] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [answer, setAnswer] = useState('');

  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth < 400 ? 5 : 7;
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const loadProjectAndQuestions = async () => {
      try {
        setIsLoading(true);
        setSelectedOption(null);
        const projectData = await fetchProject(assessmentId);
        setProject(projectData);

        const questionsData = await fetchQuestions(assessmentId);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectAndQuestions();
  }, [assessmentId]);

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      question_id: questions[currentQuestionIndex].id,
      value,
      type: questions[currentQuestionIndex].type,
    };

    setSelectedOption(value);
    setAnswers(newAnswers);
    setAnswer('');
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setSelectedOption(null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleNextAndAnswer = (value) => {
    handleAnswer(value);
    handleNext();
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setSelectedOption(null);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowResults(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: answers,
          assessment: assessmentId,
        }),
      });

      if (response.ok) {
        router.replace('/list');
      } else {
        console.error('Erro ao enviar resposta:', await response.text());
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
    }
  };

  const renderReadyScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.readyContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Detalhes do Projeto</Text>
          <View style={styles.projectDetails}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{project.id}</Text>
          </View>
          <View style={styles.projectDetails}>
            <Text style={styles.label}>Título:</Text>
            <Text style={styles.value}>{project.projectName}</Text>
          </View>
          <View style={styles.projectDetails}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{project.type == 'cientifico' ? 'Científico' : 'Tecnológico'}</Text>
          </View>
          <View style={styles.projectDetails}>
            <Text style={styles.label}>Categoria:</Text>
            <Text style={styles.value}>{project.category}</Text>
          </View>
          <View style={styles.projectDetails}>
            <Text style={styles.label}>Ano:</Text>
            <Text style={styles.value}>{project.year}</Text>
          </View>
          <View style={styles.projectDetails}>
            <Text style={styles.label}>Estudante(s):</Text>
            <Text style={styles.value}>{project.studentNames}</Text>
          </View>
          <View style={styles.projectDetails}>
            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.value}>{project.description}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => setIsReady(true)}>
          <Text style={styles.buttonText}>Começar Avaliação</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderMultipleChoiceQuestionScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.question}>{questions[currentQuestionIndex].text}</Text>
        <FlatList
          data={[...Array(21).keys()]}
          numColumns={numColumns}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedOption === item && styles.selectedOptionButton
              ]}
              onPress={() => handleAnswer(item)}>
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <View style={styles.navigationContainer}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity
              style={[
                styles.navButton,
                { marginHorizontal: 5, width: currentQuestionIndex > 0 && currentQuestionIndex < questions.length - 1 ? '55%' : '100%' }
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

  const renderOpenEndedQuestionScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.question}>{questions[currentQuestionIndex].text}</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Digite a sua resposta"
          value={answer}
          onChangeText={setAnswer}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />
        <View style={styles.navigationContainer}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity
              style={[
                styles.navButton,
                { marginHorizontal: 5, width: currentQuestionIndex > 0 && currentQuestionIndex < questions.length - 1 ? '55%' : '100%' }
              ]}
              onPress={handlePrevious}>
              <Text style={styles.navButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}
          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={[styles.navButton, { marginHorizontal: 5, width: '55%' }]}
              onPress={() => handleNextAndAnswer(answer)}>
              <Text style={styles.navButtonText}>Avançar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, { marginHorizontal: 5, width: '55%' }]}
              onPress={() => handleNextAndAnswer(answer)}>
              <Text style={styles.navButtonText}>Finalizar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderQuestionScreen = () => {
    if (!questions || questions.length === 0 || currentQuestionIndex >= questions.length) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#56BA54" />
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
      <View style={styles.container}>
        <Text style={styles.title}>Suas Respostas:</Text>
        {answers.map((answer, index) => {
          const questionText = questions.find((q) => q.id === answer.question_id)?.text || 'Pergunta não encontrada';
          return (
            <View key={index} style={styles.answerContainer}>
              <Text style={styles.questionText}>{index + 1}. {questionText}</Text>
              <Text style={styles.answerText}>{answer.value || '-'}</Text>
            </View>
          );
        })}

        <View style={styles.containerInline}>
          <TouchableOpacity style={[styles.navButton, { marginHorizontal: 5, width: '55%' }]} onPress={handleRestart}>
            <Text style={styles.navButtonText}>Refazer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, { marginHorizontal: 5, width: '55%' }]} onPress={handleSave}>
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

  if (!isReady) {
    return renderReadyScreen();
  } else if (showResults) {
    return renderResultsScreen();
  } else {
    return renderQuestionScreen();
  }
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
    marginTop: 60,
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
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
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
    flexDirection: 'row',
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
  navButtonText: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '500',
  },
  answerContainer: {
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
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


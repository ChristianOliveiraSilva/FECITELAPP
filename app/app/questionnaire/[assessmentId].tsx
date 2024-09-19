import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';

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

  useEffect(() => {
    const loadProjectAndQuestions = async () => {
      try {
        setIsLoading(true);
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

    setAnswers(newAnswers);
    setAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
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
          <Text style={styles.label}>Ano:</Text>
          <Text style={styles.value}>{project.year}</Text>
        </View>
        <View style={styles.projectDetails}>
          <Text style={styles.label}>Estudante(s):</Text>
          <Text style={styles.value}>{project.studentNames}, {project.studentNames}, {project.studentNames}, {project.studentNames} </Text>
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
  );

  const renderMultipleChoiceQuestionScreen = () => (
    <View style={styles.container}>
      <Text style={styles.question}>{questions[currentQuestionIndex].text}</Text>
      <FlatList
        data={[...Array(21).keys()]}
        numColumns={7}
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

  const renderOpenEndedQuestionScreen = () => (
    <View style={styles.container}>
      <Text style={styles.question}>{questions[currentQuestionIndex].text}</Text>
      <TextInput
        style={styles.textInput}
        placeholder='Digite a sua resposta'
        value={answer}
        onChangeText={setAnswer}
      />
      <TouchableOpacity style={styles.optionButton} onPress={() => handleAnswer(answer)}>
        <Text style={styles.optionText}>Salvar</Text>
      </TouchableOpacity>
      <View style={styles.navigationContainer}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Text style={styles.navButtonText}>Voltar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
    <View style={styles.container}>
      <Text style={styles.title}>Suas Respostas:</Text>
      {answers.map((answer, index) => (
        <Text key={index} style={styles.resultText}>
          {index + 1}. {answer.value || '-'}
        </Text>
      ))}

      <View style={styles.containerInline}>
        <TouchableOpacity style={styles.navButton} onPress={handleRestart}>
          <Text style={styles.navButtonText}>Refazer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleSave}>
          <Text style={styles.navButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
    backgroundColor: '#56BA54',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
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
    fontWeight: 'bold',
  },
});


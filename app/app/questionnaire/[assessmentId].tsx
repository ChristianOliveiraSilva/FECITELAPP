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
    
    const assessment = assessmentsData.find((a) => a.id === assessmentId);
    
    if (!assessment) {
      throw new Error('Assessment não encontrado');
    }
    
    const project = {
      projectName: assessment.project.title,
      studentNames: assessment.project.students.map((student) => student.name).join(', '),
      hasResponse: assessment.has_response,
    };
    
    return project;
    
  } catch (error) {
    console.error('Erro:', error);
    return {};
  }
};



const fetchQuestions = async (assessmentId) => {
  try {
    const questionsResponse = await fetch('http://localhost/questions');
    if (!questionsResponse.ok) {
      throw new Error('Erro ao buscar as perguntas');
    }
    
    const allQuestions = await questionsResponse.json();
    
    const questions = allQuestions.filter((q) => q.assessment_id === assessmentId);
    
    return questions;
    
  } catch (error) {
    console.error('Erro:', error);
    return [];
  }
};


const MULTIPLE_CHOICE_QUESTION = 1;

export default function Questionnaire() {
  const { assessmentId } = useLocalSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [project, setProject] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      const projectData = await fetchProject(assessmentId);
      setProject(projectData);
      setIsReady(true); 
    };

    loadProject();
  }, [assessmentId]);

  useEffect(() => {
    if (isReady) {
      const loadQuestions = async () => {
        const questionsData = await fetchQuestions(assessmentId);
        setQuestions(questionsData);
      };

      loadQuestions();
    }
  }, [isReady, assessmentId]);

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
      <View style={styles.projectContainer}>
        <Text style={styles.projectTitle}>Projeto: {project.projectName}</Text>
        <Text style={styles.projectStudents}>Alunos: {project.studentNames}</Text>
      </View>
      <Text style={styles.title}>Pronto(a) para começar a avaliação?</Text>
      <TouchableOpacity style={styles.button} onPress={() => setIsReady(true)}>
        <Text style={styles.buttonText}>Começar</Text>
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
    marginVertical: 5,
  },
  textInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    width: '100%',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

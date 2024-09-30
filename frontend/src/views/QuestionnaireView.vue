<template>
  <div class="questionnaire-container">
    <header>
      <h1>Avaliação: {{ assessment.projectName }}</h1>
    </header>

    <div v-if="isLoading" class="loading">
      <p>Carregando...</p>
    </div>

    <div v-else>
      <div v-if="screen === 0">
        <div class="assessment-details">
          <p><strong>ID:</strong> {{ assessment.projectId }}</p>
          <p><strong>Título:</strong> {{ assessment.projectName }}</p>
          <p><strong>Tipo:</strong> {{ assessment.type === 2 ? 'Científico' : 'Tecnológico' }}</p>
          <p><strong>Categoria:</strong> {{ assessment.category }}</p>
          <p><strong>Ano:</strong> {{ assessment.year }}</p>
          <p><strong>Estudante(s):</strong> {{ assessment.studentNames }}</p>
          <p><strong>Descrição:</strong> {{ assessment.description }}</p>
        </div>
        <button @click="nextScreen">Iniciar Avaliação</button>
        <button @click="cancel">Cancelar</button>
      </div>

      <div v-else>
        <div v-if="currentQuestion.type === 'multiple_choice'">
          <h2>{{ currentQuestionIndex + 1 }}. {{ currentQuestion.text }}</h2>
          <div class="options">
            <label v-for="option in currentQuestion.options" :key="option.id">
              <input type="radio" :value="option.value" v-model="currentAnswer" @change="handleAnswer"/>
              {{ option.text }}
            </label>
          </div>
        </div>

        <div v-else-if="currentQuestion.type === 'open_ended'">
          <h2>{{ currentQuestionIndex + 1 }}. {{ currentQuestion.text }}</h2>
          <textarea v-model="currentAnswer" @input="handleAnswer"></textarea>
        </div>

        <div class="navigation">
          <button v-if="currentQuestionIndex > 0" @click="prevQuestion">Voltar</button>
          <button @click="nextQuestion">{{ currentQuestionIndex < questions.length - 1 ? 'Avançar' : 'Finalizar' }}</button>
        </div>

        <p v-if="msg">{{ msg }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from '@/services/ApiService';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();

    const assessmentId = route.params.assessmentId;

    const assessment = ref({});
    const questions = ref([]);
    const currentQuestionIndex = ref(0);
    const currentAnswer = ref('');
    const isLoading = ref(true);
    const screen = ref(0);
    const msg = ref('');

    onMounted(async () => {
      try {
        isLoading.value = true;
        assessment.value = await fetchAssessment(assessmentId);
        questions.value = await fetchQuestions(assessmentId);
      } catch (error) {
        console.error(error);
        msg.value = 'Erro ao carregar dados.';
      } finally {
        isLoading.value = false;
      }
    });

    const fetchAssessment = async (assessmentId) => {
      const {data} = await ApiService.get('/assessments');
      return data;
    };

    const fetchQuestions = async (assessmentId) => {
      const {data} = await ApiService.get(`/questions/${assessmentId}`);
      return data;
    };

    const nextScreen = () => {
      screen.value++;
    };

    const cancel = () => {
      router.push('/list');
    };

    const nextQuestion = () => {
      if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++;
      } else {
        submitAnswers();
      }
    };

    const prevQuestion = () => {
      if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
      }
    };

    const handleAnswer = () => {
      const currentQuestion = questions.value[currentQuestionIndex.value];
      // Salva a resposta
      // Aqui você pode implementar a lógica de armazenamento das respostas
    };

    const submitAnswers = async () => {
      const response = await fetch('http://localhost/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: questions.value.map((q, index) => ({
            question_id: q.id,
            value: currentAnswer.value[index] || null,
          })),
        }),
      });
      
      if (response.ok) {
        router.push('/list');
      } else {
        msg.value = 'Erro ao enviar respostas.';
      }
    };

    const currentQuestion = () => questions.value[currentQuestionIndex.value] || {};

    return {
      assessment,
      questions,
      currentQuestionIndex,
      currentAnswer,
      isLoading,
      screen,
      msg,
      nextScreen,
      cancel,
      nextQuestion,
      prevQuestion,
      handleAnswer,
      submitAnswers,
      currentQuestion,
    };
  },
};
</script>

<style scoped>
.questionnaire-container {
  padding: 20px;
}
.loading {
  text-align: center;
}
.assessment-details {
  margin-bottom: 20px;
}
.options {
  margin-bottom: 20px;
}
.navigation {
  display: flex;
  justify-content: space-between;
}
</style>
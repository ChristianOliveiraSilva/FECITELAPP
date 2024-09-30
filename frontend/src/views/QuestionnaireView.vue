<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ApiService from '@/services/ApiService';
import HeaderComponent from '@/components/Header.vue';

const MULTIPLE_CHOICE_QUESTION = 1;
const OPEN_QUESTION = 2;

const route = useRoute();
const router = useRouter();

const assessmentId = route.params.assessmentId;

const assessment = ref({});
const questions = ref([]);
const answers = ref([]);
const currentQuestionIndex = ref(0);

const isLoading = ref(true);
const screen = ref(0);
const msg = ref('');

let currentQuestion = {}

// Funções para buscar dados
const fetchAssessment = async (assessmentId) => {
  const { data } = await ApiService.get('/assessments');
  const assessment = data.find((a) => a.id == assessmentId);
  console.log({assessment});
  return assessment;
};

const fetchQuestions = async (assessmentId) => {
  const { data } = await ApiService.get(`/questions/${assessmentId}`);
  console.log({question: data});
  return data;
};

// Carregando dados ao montar o componente
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

// Métodos
const nextScreen = () => {
  screen.value++;
  currentQuestion = questions.value[currentQuestionIndex.value] ?? {};
  console.log(
    {currentQuestion}
  );
};

const cancel = () => {
  router.push('/list');
};

const nextQuestion = () => {
  const response = answers.value[currentQuestionIndex.value];

  if (currentQuestion.type === MULTIPLE_CHOICE_QUESTION && (response == null || response == undefined)) {
    msg.value = 'Esta pergunta é obrigatória.';
    return;
  }

  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
    currentQuestion = questions.value[currentQuestionIndex.value] ?? {};
    console.log(
      {currentQuestion}
    );
  } else {
    submitAnswers()
  }
};

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    currentQuestion = questions.value[currentQuestionIndex.value] ?? {};

    console.log(
      {currentQuestion}
    );
  }
};

const submitAnswers = async () => {
  try {
    const { data } = await ApiService.post(`/responses`, {
      responses: questions.value.map((q, index) => ({
        question_id: q.id,
        value: currentAnswer.value[index] || null,
      })),
    });

    router.push('/list');
  } catch (error) {
    msg.value = 'Erro ao enviar respostas.';
  }
};
</script>


<template>
  <div>
    <HeaderComponent />
    <div class="questionnaire-container">
      <header>
        <h1>Avaliação: {{ assessment.projectName }}</h1>
      </header>

      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <div v-else>
        <div v-if="screen === 0">
          <div class="assessment-details">
            <p><strong>ID:</strong> {{ assessment.project.external_id }}</p>
            <p><strong>Título:</strong> {{ assessment.project.title }}</p>
            <p><strong>Tipo:</strong> {{ assessment.project.area === 2 ? 'Científico' : 'Tecnológico' }}</p>
            <p><strong>Categoria:</strong> {{ assessment.project.category.name }}</p>
            <p><strong>Ano:</strong> {{ assessment.project.year }}</p>
            <p><strong>Estudante(s):</strong> {{ assessment.project.students.map((student) => student.name).join(', ') }}</p>
            <p><strong>Descrição:</strong> {{ assessment.project.description }}</p>
          </div>
          <button @click="nextScreen">Iniciar Avaliação</button>
          <button @click="cancel">Cancelar</button>
        </div>

        <div v-if="screen === 1">
          <div v-if="currentQuestion.type === MULTIPLE_CHOICE_QUESTION">
            <h2>{{ currentQuestionIndex + 1 }}. {{ currentQuestion.text }}</h2>
            <div class="options">
              <label v-for="(option, index) in currentQuestion.number_alternatives" :key="option.id">
                <input type="radio" :value="index" v-model="answers[currentQuestionIndex]"/>
                {{ option.text }}
              </label>
            </div>
          </div>

          <div v-else-if="currentQuestion.type === OPEN_QUESTION">
            <h2>{{ currentQuestionIndex + 1 }}. {{ currentQuestion.text }}</h2>
            <textarea v-model="answers[currentQuestionIndex]"></textarea>
          </div>

          <p v-if="msg">{{ msg }}</p>

          {{ answers }}

          <div class="navigation">
            <button v-if="currentQuestionIndex > 0" @click="prevQuestion">Voltar</button>
            <button @click="nextQuestion">{{ currentQuestionIndex < questions.length - 1 ? 'Avançar' : 'Finalizar' }}</button>
          </div>
        </div>

        <div v-if="screen === 2">
          <button @click="nextScreen">Iniciar Avaliação</button>
          <button @click="cancel">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.questionnaire-container {
  padding: 20px;
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
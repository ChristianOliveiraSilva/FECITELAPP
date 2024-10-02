<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ApiService from '@/services/ApiService'
import HeaderComponent from '@/components/Header.vue'

const MULTIPLE_CHOICE_QUESTION = 1
const OPEN_QUESTION = 2

const route = useRoute()
const router = useRouter()

const assessmentId = route.params.assessmentId

const assessment = ref({})
const questions = ref([])
const answers = ref([])
const currentQuestionIndex = ref(0)

const isLoading = ref(true)
const screen = ref(0)
const msg = ref('')

let currentQuestion = {}

// Funções para buscar dados
const fetchAssessment = async (assessmentId) => {
  const { data } = await ApiService.get('/assessments')
  const assessment = data.find((a) => a.id == assessmentId)
  console.log({ assessment })
  return assessment
}

const fetchQuestions = async (assessmentId) => {
  const { data } = await ApiService.get(`/questions/${assessmentId}`)
  console.log({ question: data })
  return data
}

// Carregando dados ao montar o componente
onMounted(async () => {
  try {
    isLoading.value = true
    assessment.value = await fetchAssessment(assessmentId)
    questions.value = await fetchQuestions(assessmentId)
  } catch (error) {
    console.error(error)
    msg.value = 'Erro ao carregar dados.'
  } finally {
    isLoading.value = false
  }
})

// Métodos
const nextScreen = () => {
  screen.value++
  msg.value = ''
  currentQuestion = questions.value[currentQuestionIndex.value] ?? {}
  console.log({ currentQuestion })
}

const cancel = () => {
  router.push('/list')
}

const nextQuestion = () => {
  const response = answers.value[currentQuestionIndex.value]
  msg.value = ''

  if (
    currentQuestion.type === MULTIPLE_CHOICE_QUESTION &&
    (response == null || response == undefined)
  ) {
    msg.value = 'Esta pergunta é obrigatória.'
    setTimeout(() => msg.value = '', 2000)
    return
  }

  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    currentQuestion = questions.value[currentQuestionIndex.value] ?? {}
    console.log({ currentQuestion })
  } else {
    nextScreen()
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    currentQuestion = questions.value[currentQuestionIndex.value] ?? {}

    console.log({ currentQuestion })
  }
}

const submitAnswers = async () => {
  try {
    const { data } = await ApiService.post(`/responses`, {
      assessment: assessmentId,
      responses: questions.value.map((q, index) => ({
        question_id: q.id,
        type: q.type,
        value: answers.value[index] || null
      }))
    })

    router.push('/list')
  } catch (error) {
    msg.value = 'Erro ao enviar respostas.'
  }
}
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="questionnaire-container">
      <header v-if="screen !== 0" class="project-details-container">
        <p class="title">{{ assessment.project.external_id }} - {{ assessment.project.title }}</p>
        <p>
          Estudante(s): {{ assessment.project.students.map((student) => student.name).join(', ') }}
        </p>
      </header>

      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <div v-else>
        <div v-if="screen === 0" class="assessment-details-container">
          <div class="assessment-details">
            <p><strong>ID:</strong> {{ assessment.project.external_id }}</p>
            <p><strong>Título:</strong> {{ assessment.project.title }}</p>
            <p>
              <strong>Tipo:</strong>
              {{ assessment.project.area === 2 ? 'Científico' : 'Tecnológico' }}
            </p>
            <p><strong>Categoria:</strong> {{ assessment.project.category.name }}</p>
            <p><strong>Ano:</strong> {{ assessment.project.year }}</p>
            <p>
              <strong>Estudante(s):</strong>
              {{ assessment.project.students.map((student) => student.name).join(', ') }}
            </p>
            <p><strong>Descrição:</strong> {{ assessment.project.description }}</p>
          </div>
          <button @click="nextScreen" class="primary">Iniciar Avaliação</button>
          <button @click="cancel" class="secondary">Cancelar</button>
        </div>

        <div v-if="screen === 1" class="question-container">
          <div v-if="currentQuestion.type === MULTIPLE_CHOICE_QUESTION">
            <h2 class="question-text">
              {{ currentQuestionIndex + 1 }}. {{ currentQuestion.text }}
            </h2>
            <div class="options">
              <label v-for="(_, index) in currentQuestion.number_alternatives + 1" :key="index">
                <input type="radio" :value="index" v-model="answers[currentQuestionIndex]" />
                <span>{{ index }}</span>
              </label>
            </div>
          </div>

          <div v-else-if="currentQuestion.type === OPEN_QUESTION">
            <h2 class="question-text">
              {{ currentQuestionIndex + 1 }}. {{ currentQuestion.text }}
            </h2>
            <textarea v-model="answers[currentQuestionIndex]"></textarea>
          </div>

          <p v-if="msg" class="error-text">{{ msg }}</p>

          <div class="navigation">
            <button v-if="currentQuestionIndex > 0" @click="prevQuestion" class="secondary">
              Voltar
            </button>
            <button @click="nextQuestion" class="primary">
              {{ currentQuestionIndex < questions.length - 1 ? 'Avançar' : 'Finalizar' }}
            </button>
          </div>
        </div>

        <div v-if="screen === 2" class="check-container">
          <div class="results-container">
            <div v-for="(answer, index) in answers" :key="index" class="result">
              <p><strong>{{ questions[index].text }}</strong></p>
              <p>{{ answer != null ? answer : 'sem resposta' }}</p>
            </div>
          </div>

          <button @click="submitAnswers" class="primary">Finalizar Avaliação</button>
          <button @click="cancel" class="secondary">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.questionnaire-container {
  padding: 20px;
}

.project-details-container {
  background-color: var(--color-primary);
  color: white;
  text-align: center;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
}

.project-details-container .title {
  font-size: 1.13rem;
  margin-bottom: 0.25rem;
}

.assessment-details, .results-container {
  background-color: white;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3);
  padding: 20px;
  margin-bottom: 20px;
}
.assessment-details strong {
  font-weight: bold;
}

.check-container button,
.assessment-details-container button {
  display: block;
  margin-block: 1rem;
}

.options {
  margin-bottom: 20px;
}

.navigation {
  display: flex;
  justify-content: space-between;
}

.question-container .question-text {
  font-size: 1.4rem;
  font-weight: bold;
  margin-block: 1rem;
}

.options {
  display: grid;
  grid-template-columns: repeat(5, 60px);
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.options label {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #b0b0b0;
  width: 60px;
  height: 60px;
  border-radius: 5px;
  font-size: 20px;
  color: white;
  cursor: pointer;
}

.options input {
  display: none;
}

.options input:checked + span {
  background-color: #4caf50;
}

.options span {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.question-container .options input {
  display: none;
}

.question-container textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  font-family: Arial, sans-serif;
  resize: vertical;
  outline: none;
}

.question-container textarea:focus {
  border-color: #66afe9;
  box-shadow: 0 0 5px rgba(102, 175, 233, 0.5);
}

.question-container .error-text {
  font-size: 1.1rem;
  margin-block: 1rem;
  text-align: center;
}

.results-container .result {
  margin-bottom: 1.5rem;
}

.results-container .result:last-child {
  margin-bottom: 0;
}

</style>

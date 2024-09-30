<script setup>
import { ref, onMounted } from 'vue';
import ProjectItem from '../components/ProjectItem.vue';
import Header from '../components/Header.vue';
import ApiService from '@/services/ApiService';
import { useRouter } from 'vue-router';

const loading = ref(true);
const projects = ref({});
const router = useRouter();

const SCIENTIFIC = 2;

const fetchProjects = async () => {
  try {
    const {data} = await ApiService.get('/assessments');

    const groupedByCategory = data.reduce((acc, assessment) => {
      const categoryName = assessment.project.category.name;

      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }

      acc[categoryName].push({
        id: assessment.id,
        projectName: assessment.project.title,
        projectArea: assessment.project.area,
        projectId: assessment.project.external_id,
        studentName: assessment.project.students.map(student => student.name).join(', '),
        hasResponse: assessment.has_response,
      });

      return acc;
    }, {});

    return groupedByCategory;
  } catch (error) {
    console.error('Erro:', error);
    return [];
  }
};

const loadProjects = async () => {
  loading.value = true;
  projects.value = await fetchProjects();
  loading.value = false;
};

const handlePress = (id) => {
  router.push({ name: 'questionnaire', params: { assessmentId: id } });
};

onMounted(loadProjects);
</script>

<template>
  <div>
    <Header />

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!Object.keys(projects).length" class="list-container">
      <p class="no-projects-text">Não há projetos para serem avaliados</p>
      <button @click="loadProjects" class="retry-button">Tentar Novamente</button>
    </div>

    <div v-else class="list-container">
      <div v-for="(items, group) in projects" :key="group">
        <h3 class="group-title">{{ group }}</h3>
        <ul class="project-list">
          <ProjectItem
            v-for="item in items"
            :key="item.id"
            :item="item"
            @press="handlePress"
          />
        </ul>
      </div>
    </div>

  </div>
</template>

<style scoped>
.no-projects-text {
  text-align: center;
  color: #666;
}

.list-container {
  padding: 12px;
}

.retry-button {
  display: block;
  margin: 0 auto;
  padding: 10px 20px;
  background-color: #56BA54;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.group-title {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
  color: #333;
}

.project-list {
  list-style: none;
  padding: 0;
}

.project-list li {
  margin-bottom: 10px;
}

</style>

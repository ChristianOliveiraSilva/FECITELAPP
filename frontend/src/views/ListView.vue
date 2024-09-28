<script setup>
import { ref, onMounted } from 'vue';
import ProjectItem from '../components/ProjectItem.vue';

const loading = ref(true);
const projects = ref({});

const SCIENTIFIC = 2;

const fetchProjects = async () => {
  try {
    const response = await fetch('http://localhost/assessments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('key')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Erro ao buscar os assessments');

    const data = await response.json();

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
  // Utilize o router para navegação, exemplo:
  router.push({ name: 'questionnaire', params: { assessmentId: id } });
};

onMounted(loadProjects);
</script>

<template>
  <div class="container">
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="#56BA54"></v-progress-circular>
    </div>

    <div v-else-if="!Object.keys(projects).length">
      <p class="no-projects-text">Não há projetos para serem avaliados</p>
      <v-btn @click="loadProjects" color="#56BA54">Tentar Novamente</v-btn>
    </div>

    <div v-else>
      <div v-for="(items, group) in projects" :key="group">
        <h3 class="group-title">{{ group }}</h3>
        <v-list>
          <ProjectItem
            v-for="item in items"
            :key="item.id"
            :item="item"
            @press="handlePress"
          />
        </v-list>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 16px;
  background-color: #F5FCFF;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.no-projects-text {
  text-align: center;
  color: #666;
}
.group-title {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
  color: #333;
}
</style>

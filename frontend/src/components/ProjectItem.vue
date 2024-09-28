<template>
    <v-list-item @click="onPress" class="item-container">
      <v-list-item-avatar :style="{ backgroundColor: item.projectArea == SCIENTIFIC ? '#56BA54' : '#036daa' }">
        <v-img :src="iconUri" />
      </v-list-item-avatar>
      
      <v-list-item-content>
        <v-list-item-title class="project-name">{{ item.projectId }} - {{ item.projectName }}</v-list-item-title>
        <v-list-item-subtitle>
          Estudante(s): {{ item.studentName }} - {{ item.projectArea == SCIENTIFIC ? 'Científico' : 'Tecnológico' }}
        </v-list-item-subtitle>
      </v-list-item-content>
  
      <v-list-item-action>
        <span :class="[item.hasResponse ? 'has-response' : 'no-response']">
          {{ item.hasResponse ? 'Avaliado' : 'Avaliar' }}
        </span>
      </v-list-item-action>
    </v-list-item>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    item: {
      type: Object,
      required: true,
    },
  });
  
  const iconUri = computed(() => {
    return props.item.projectArea == SCIENTIFIC
      ? 'https://img.icons8.com/ios-filled/50/ffffff/microscope.png'
      : 'https://img.icons8.com/ios-filled/50/ffffff/computer.png';
  });
  
  const onPress = () => {
    emit('press', props.item.id);
  };
  </script>
  
  <style scoped>
  .item-container {
    margin: 5px 0;
    background-color: #fff;
    border-radius: 5px;
  }
  .has-response {
    color: #56BA54;
    font-weight: bold;
  }
  .no-response {
    color: red;
    font-weight: bold;
  }
  .project-name {
    font-weight: bold;
  }
  </style>
  
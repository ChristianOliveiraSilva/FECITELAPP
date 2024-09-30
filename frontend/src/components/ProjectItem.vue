<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['press'])

const SCIENTIFIC = 2

const iconUri = computed(() => {
  return props.item.projectArea == SCIENTIFIC
    ? 'https://img.icons8.com/ios-filled/50/ffffff/microscope.png'
    : 'https://img.icons8.com/ios-filled/50/ffffff/computer.png'
})

const onPress = () => {
  emit('press', props.item.id)
}
</script>

<template>
  <div @click="onPress" class="item-container">
    <div
      class="avatar"
      :style="{ backgroundColor: item.projectArea == SCIENTIFIC ? '#56BA54' : '#036daa' }"
    >
      <img :src="iconUri" class="icon" />
    </div>

    <div class="content">
      <div class="project-name">{{ item.projectId }} - {{ item.projectName }}</div>
      <div class="project-subtitle">
        Estudante(s): {{ item.studentName }} -
        {{ item.projectArea == SCIENTIFIC ? 'Científico' : 'Tecnológico' }}
      </div>
    </div>

    <div class="action">
      <span :class="[item.hasResponse ? 'has-response' : 'no-response']">
        {{ item.hasResponse ? 'Avaliado' : 'Avaliar' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.item-container {
  display: flex;
  align-items: center;
  box-shadow: 0px 2px 1px rgba(0, 0, 0, 0.1);
  margin: 10px 0;
  padding: 10px 5px;
  background-color: #fff;
  border-radius: 5px;
  cursor: pointer;
}

.avatar {
  width: 35px;
  height: 35px;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}

.icon {
  width: 20px;
  height: 20px;
}

.content {
  flex-grow: 1;
}

.project-name {
  font-weight: bold;
}

.project-subtitle {
  color: #666;
}

.action {
  display: flex;
  align-items: center;
}

.has-response {
  color: #56ba54;
  font-weight: bold;
}

.no-response {
  color: red;
  font-weight: bold;
}

@media (min-width: 500px) {
  .item-container {
    padding: 20px;
  }

  .avatar {
    width: 50px;
    height: 50px;
  }

  .icon {
    width: 30px;
    height: 30px;
  }
}
</style>

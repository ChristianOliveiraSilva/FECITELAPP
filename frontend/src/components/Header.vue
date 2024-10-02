<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ApiService from '../services/ApiService';

const router = useRouter();
const isDrawerOpen = ref(false);
const msg = ref('');
const loading = ref(false);
const user = ref({ name: 'Visitante', email: 'N/A' }); 

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
};

const fetchUser = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  }
};

const handleLogout = async () => {
  loading.value = true;
  msg.value = '';

  try {
    const response = await ApiService.post('/logout', {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 200) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      router.push('/login');
    } else {
      msg.value = 'Erro ao fazer logout. Tente novamente.';
    }
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    msg.value = 'Erro ao fazer logout. Tente novamente.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUser);
</script>

<template>
  <header class="main-header">
    <img src="@/assets/fecitel-logo.png" alt="FeciTEL Logo" class="logo-image" />
    <img src="https://img.icons8.com/ios-filled/50/ffffff/menu.png" class="custom-icon" @click="toggleDrawer" />
  </header>

  <transition name="slide-right">
    <div v-if="isDrawerOpen" class="drawer">
      <div class="drawer-header">
        <img src="https://img.icons8.com/ios-filled/50/ffffff/user.png" alt="User Avatar" class="user-avatar" />
        <div class="user-info">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
        </div>
      </div>

      <ul class="drawer-menu">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
        </div>
        <li v-else @click="handleLogout">
          <img src="https://img.icons8.com/?size=100&id=BdksXmxLaK8r&format=png&color=FF0000" class="custom-icon" />
          <span class="logout-text">Sair</span>
        </li>
      </ul>
    </div>
  </transition>

  <div v-if="isDrawerOpen" class="drawer-overlay" @click="toggleDrawer"></div>
</template>

<style scoped>
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #4caf50;
  padding: 20px;
}

.logo-image {
  height: 30px;
  margin-right: 10px;
}

i {
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.custom-icon {
  color: #fff;
  width: 30px;
  cursor: pointer;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  background-color: #4caf50;
  padding: 20px;
  display: flex;
  color: white;
  flex-direction: column;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
  margin-bottom: 10px;
  background-color: lightgray;
  padding: 5px;
}

.user-info h3 {
  margin: 0;
  font-size: 18px;
  margin-bottom: 3px;
}

.user-info p {
  margin: 0;
  font-size: 14px;
}

.drawer-menu {
  padding: 10px 20px;
  list-style-type: none;
}

.drawer-menu li {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px 0;
}

.drawer-menu li i {
  color: red;
  margin-right: 10px;
}

.logout-text {
  color: red;
  font-size: 18px;
  margin-left: 15px;
  font-weight: 500;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>

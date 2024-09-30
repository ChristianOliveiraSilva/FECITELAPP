<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div class="input-group">
        <label for="pin">PIN</label>
        <input v-model="pin" type="text" id="pin" placeholder="Digite seu PIN" />
      </div>

      <p v-if="msg" class="error-text">{{ msg }}</p>

      <button type="submit">Entrar</button>
    </form>
  </div>
</template>

<script>
import ApiService from '../services/ApiService'

export default {
  data() {
    return {
      msg: '',
      pin: ''
    }
  },
  methods: {
    async login() {
      if (!this.pin) {
        this.msg = 'Por favor, insira o PIN.'
        return
      }

      try {
        const response = await ApiService.post('/login', { PIN: this.pin })

        console.log(response.data)

        localStorage.setItem('user', JSON.stringify(response.data.data.user))
        localStorage.setItem('authToken', response.data.data.plainTextToken)

        this.$router.push('/list')
      } catch (error) {
        console.error('Erro no login:', error)
        this.msg = 'Por favor, verifique seu PIN e tente novamente.'
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  background-color: rgba(245, 252, 255, 1);
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-container .error-text {
  margin-block: 1rem;
  text-align: center;
}

button,
input {
  max-width: 300px;
}
</style>

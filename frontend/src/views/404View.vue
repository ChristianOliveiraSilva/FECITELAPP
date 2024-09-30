<template>
    <div class="not-found-container">
        <h1>404 - Página Não Encontrada</h1>
        <p>Desculpe, a página que você está procurando não existe.</p>
        <router-link to="/">Voltar para a Página Inicial</router-link>
    </div>
</template>
  
<style scoped>
  .not-found-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    background-color: #f8f9fa;
  }
  
  h1 {
    font-size: 48px;
    color: #333;
  }
  
  p {
    margin: 16px 0;
    color: #666;
  }
  
  a {
    color: #56BA54;
    text-decoration: none;
    font-weight: bold;
    font-size: 18px;
  }
  
  a:hover {
    text-decoration: underline;
  }
</style>
  
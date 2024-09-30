<script setup></script>

<template>
  <header class="main-header">
    <img src="@/assets/fecitel-logo.png" alt="FeciTEL Logo" class="logo-image" />
    <i class="fa fa-bars"></i>
  </header>
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
  height: 25px;
  margin-right: 10px;
}

i {
  color: white;
  font-size: 24px;
  cursor: pointer;
}
</style>

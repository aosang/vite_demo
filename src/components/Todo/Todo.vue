<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const todos = ref([
  {
    id: 1,
    text: 'Learn Vue.js 3',
    completed: false
  },
  {
    id: 2,
    text: 'Learn React',
    completed: false
  },
])
</script>

<style scoped>
</style>
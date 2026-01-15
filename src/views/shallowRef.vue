<template>
  <div class="tabs">
    <a-button @click="activeTab = Work">Work</a-button>
    <a-button @click="activeTab = Contact">Contact</a-button>

    <hr />

    <component :is="activeTab" />
  </div>
</template>

<script setup>
import { shallowRef } from 'vue'

import Work from '@/components/shawllowRef/work.vue'
import Contact from '@/components/shawllowRef/contact.vue'


const activeTab = shallowRef(Work)
</script>

<style scoped></style>
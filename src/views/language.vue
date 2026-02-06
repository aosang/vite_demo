<template>
  <LocaleSwitcher />

  <div>{{ $t('common.confirm') }}</div>
</template>

<script setup>
import LocaleSwitcher from '@/components/LocaleSwitcher/LocaleSwitcher.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped></style>
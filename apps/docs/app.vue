<script setup lang="ts">
import { Toaster } from "@llayz46/sileo-vue";
import "@llayz46/sileo-vue/styles.css";

const { theme } = useTheme();
</script>

<template>
  <Toaster :position="'top-right'" :theme="theme" />
  <NuxtPage />
</template>

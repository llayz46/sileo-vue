<script setup lang="ts">
import { Toaster } from "sileo-vue";
import "sileo-vue/styles.css";

const { theme } = useTheme();
</script>

<template>
  <Toaster :position="'top-right'" :theme="theme" />
  <NuxtPage />
</template>

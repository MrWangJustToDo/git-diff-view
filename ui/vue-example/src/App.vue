<script setup lang="ts">
import { b } from './data'
import { DiffView } from '@git-diff-view/vue';
</script>

<template>
  <div style="width: 1000px; margin:auto; margin-top: 20px; border: 1px solid grey; border-radius: 4px; overflow: hidden;">
    <DiffView :data="b" :diff-view-font-size="12" :diff-view-highlight="true" :diff-view-add-widget="true"
      :diff-view-wrap="true" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

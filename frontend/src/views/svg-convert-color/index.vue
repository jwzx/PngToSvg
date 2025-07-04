<!--
 * @Description:
 * @Author: jwzx
 * @Date: 2025-06-20 09:59:39
 * @LastEditTime: 2025-07-02 17:45:16
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\frontend\src\views\svg-convert-color\index.vue
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import PngToSvg2 from './modules/svg-convert-color.vue';

const appStore = useAppStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));
</script>

<template>
  <NSpace vertical :size="16">

    <PngToSvg2 />
  </NSpace>
</template>

<style scoped></style>

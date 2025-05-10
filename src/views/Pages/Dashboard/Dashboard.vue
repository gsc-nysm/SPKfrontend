<template>
  <el-row :gutter="16">
    <el-col :xs="24" :sm="12" :md="8" :lg="6" class="mb-4" v-for="(assistance, index) in dashboardData" :key="index">
      <div class="statistic-card">
        <el-statistic :value="`${assistance} Data`" :loading="loading" :precision="0">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              {{ String(index).replace(/_/g, ' ').toUpperCase() }}
            </div>
          </template>
        </el-statistic>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { useAgencyStore } from '@/stores/agency';
import { useRoute } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const agencyStore = useAgencyStore();
const dashboardData = computed(() => agencyStore.dashboard);
const loading = ref(false);
const route = useRoute();
const authStore = useAuthStore();
const auth = computed(() => authStore.user);

onMounted(() => {
  loading.value = true;
  agencyStore.dashboardData(auth.value?.role?.name === 'validator' ? String(route.params.id) : undefined)
    .then(() => {
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
});
</script>

<style scoped>
:global(h2#card-usage ~ .example .example-showcase) {
  background-color: var(--el-fill-color) !important;
}

.el-statistic {
  --el-statistic-content-font-size: 28px;
}

.statistic-card {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

.statistic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

.statistic-footer .footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-footer .footer-item span:last-child {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.green {
  color: var(--el-color-success);
}

.red {
  color: var(--el-color-error);
}
</style>
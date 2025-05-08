<template>
    <el-breadcrumb :separator-icon="ArrowRight" class="mb-4">
        <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index" :to="item.to">
            {{ item.title }}
        </el-breadcrumb-item>
    </el-breadcrumb>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';

export default defineComponent({
    name: 'Breadcrumb',
    components: {
        ArrowRight,
    },
    setup() {
        const route = useRoute();

        const breadcrumbItems = computed(() => {
            const id = route.params.id; // Ambil parameter id dari rute saat ini
            const breadcrumbs = route.meta.breadcrumbs || [];

            // Ganti placeholder :id dengan nilai aktual dari parameter
            return breadcrumbs.map((crumb) => {
                let to = crumb.path;
                if (to && to.includes(':id')) {
                    to = to.replace(':id', id); // Ganti :id dengan nilai id
                }
                return {
                    title: crumb.name,
                    to: to ? { path: to } : undefined, // Item terakhir tanpa tautan
                };
            });
        });

        return {
            breadcrumbItems,
            ArrowRight,
        };
    },
});
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1.5rem;
}
</style>
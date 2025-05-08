<template>
    <div>
        <el-dialog v-model="visible" title="Program Bantuan Sosial" width="650" :show-close="false">
            <el-button plain icon="Plus" class="w-full my-4" @click="openCrudModal('create', null)">Tambah Program
                Bantuan</el-button>
            <el-row :gutter="16" v-if="social_assistance.length > 0">
                <el-col :span="8" v-for="item in social_assistance" :key="item.id">
                    <el-card class="statistic-card border my-4" shadow="never"
                        :class="programActive === item.id ? 'bg-primary-50' : ''" @click="handleSelect(item)">
                        <div class="statistic-header">
                            <span class="text-xs">{{ item.jenis_bantuan }}</span>
                            <div class="text-2xl font-light">
                                {{ item.nama_bantuan }}
                            </div>
                        </div>
                        <div class="statistic-footer mt-2">
                            <div class="footer-item">
                                <el-tooltip class="box-item" effect="dark" content="Edit" placement="top-start">
                                    <el-button type="warning" size="small" @click.stop="openCrudModal('update', item)"
                                        :icon="Edit"></el-button>
                                </el-tooltip>
                                <el-tooltip class="box-item" effect="dark" content="Hapus" placement="top-start">
                                    <el-button type="danger" size="small" @click.stop="openCrudModal('delete', item)"
                                        :icon="Delete"></el-button>
                                </el-tooltip>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <div v-else>
                <p>Belum ada data program bantuan sosial</p>
            </div>
        </el-dialog>
        <crud-modal v-model:visible="crudModalVisible" :mode="crudModalMode" :data="crudModalData"
            :form-fields="formFields" name="Program Bantuan" :create-service="store.createData"
            :update-service="store.updateData" :delete-service="store.deleteData"
            :delete-multiple-service="store.deleteMultipleData" :show-service="store.showData" @save="handleSave"
            @delete="handleDelete" @close="crudModalVisible = false" />
    </div>
</template>

<script setup lang="ts">
import CrudModal from './CrudModal.vue';
import { Delete, Edit } from '@element-plus/icons-vue';
import { defineModel, defineProps, watch, onMounted, ref } from 'vue';
import { useSocialAssistanceStore } from '@/stores/social_assistance';
import { useAuthStore } from '@/stores/auth';
import { useRoute, useRouter } from 'vue-router';
import type { IncomingApiData } from '@/models/SocialAssistance';
import { useProgramStore } from '@/stores/program_selected';
// Gunakan defineModel untuk mengikat visible dengan parent
const visible = defineModel<boolean>('visible', { default: false });
// Hitung apakah rute saat ini adalah /dashboard dan bukan /setting
const isDashboardRoute = ref(false);

// Definisikan props dengan tipe array
const props = defineProps<{
    data: IncomingApiData[] | null;
}>();

// Inisialisasi router dan route
const router = useRouter();
const route = useRoute();

// Inisialisasi store dan state
const store = useSocialAssistanceStore();
const auth = useAuthStore();
const program_selected = useProgramStore();
const social_assistance = ref<IncomingApiData[]>(props.data || []);
const crudModalVisible = ref(false);
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create');
const crudModalData = ref<Partial<IncomingApiData> | null>(null);
const programActive = ref<number | null>(null);

// Definisikan formFields
const formFields = [
    { prop: 'nama_bantuan', label: 'Nama Bantuan', type: 'text' as const, required: true },
    { prop: 'jenis_bantuan', label: 'Jenis Bantuan', type: 'text' as const, required: true },
    { prop: 'deskripsi', label: 'Deskripsi', type: 'text' as const, required: true },
];

const handleClose = (done: () => void) => {
    // visible.value = false;
    // done();
};

const replaceIdInPath = (currentPath: string, currentId: string, newId: string): string => {
    // Ganti currentId dengan newId di path
    const regex = new RegExp(`/social-assistance/${currentId}(/|$)`);
    return currentPath.replace(regex, `/social-assistance/${newId}$1`);
};

const handleSelect = (item: IncomingApiData) => {
    const currentPath = route.path;
    const currentId = route.params.id?.toString();
    const targetId = item.id.toString();
    if (currentPath == '/dashboard') {
        router.push(`/social-assistance/${item.id}`).then(() => {
            program_selected.setProgramActive(item.id);
            visible.value = false
        })
    } else {
        const newPath = replaceIdInPath(currentPath, currentId, targetId);
        router.push(newPath).then(() => {
            program_selected.setProgramActive(item.id); // Sinkronisasi store setelah navigasi
            visible.value = false
        });
    }
};

const handleSave = (savedData: IncomingApiData) => {
    crudModalVisible.value = false;
    // Tambahkan logika simpan jika perlu
};

const handleDelete = (id: number) => {
    crudModalVisible.value = false;
    // Tambahkan logika hapus jika perlu
};

const openCrudModal = (mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete', data: Partial<IncomingApiData> | null) => {
    crudModalMode.value = mode;
    crudModalData.value = data;
    crudModalVisible.value = true;
};

// Kontrol visibilitas modal berdasarkan rute
watch(() => route.path, (newPath) => {
    isDashboardRoute.value = newPath === '/dashboard';
    visible.value = isDashboardRoute.value; // Modal terbuka hanya di /dashboard, tidak di /setting
});

// Watch perubahan props.data
watch(() => props.data, (newData) => {
    social_assistance.value = newData || [];
    console.log('Updated social_assistance:', social_assistance.value);
});

// Watch perubahan route.params.id untuk sinkronisasi dengan programActive
watch(() => route.params.id, (newId) => {
    const id = Number(newId);
    programActive.value = isNaN(id) ? null : id;
});

// Inisialisasi programActive saat komponen dimount
onMounted(() => {
    const id = Number(route.params.id);
    programActive.value = isNaN(id) ? null : id;
    // Pastikan modal terbuka di dashboard saat dimount
    isDashboardRoute.value = route.path === '/dashboard';
    visible.value = isDashboardRoute.value;
});
</script>

<style scoped>
.statistic-card {
    cursor: pointer;
    transition: background-color 0.3s;
}

.statistic-card:hover {
    background-color: #f0f0f0;
}

.statistic-header {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.statistic-footer {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.footer-item {
    display: flex;
    gap: 5px;
}
</style>
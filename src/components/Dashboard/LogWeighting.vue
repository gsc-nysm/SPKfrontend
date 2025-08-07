<template>
    <div>
        <el-table :data="log_weighting" v-loading="isLoading" style="width: 100%">
            <el-table-column type="index" label="No" width="60" />
            <el-table-column prop="created_at" label="Tanggal Perubahan" width="200">
                <template #default="scope">
                    <span>{{ new Date(scope.row.created_at).toLocaleString('id-ID') }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="user_id.name" label="Diubah oleh" />
            <el-table-column label="Aksi" width="150" align="center">
                <template #default="scope">
                    <el-button type="primary" @click="viewDocument(scope.row.bukti_dokumen)" link>
                        Lihat Dokumen
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-empty v-if="!isLoading && log_weighting.length === 0" description="Belum ada riwayat perubahan bobot" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLogWeightingStore } from '@/stores/log_weighting'; // Sesuaikan path
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';

// Terima ID bantuan sosial dari parent component
const props = defineProps<{
    socialAssistanceId: number | null;
}>();

// Inisialisasi store
const logWeightingStore = useLogWeightingStore();
const { log_weighting, loading: isLoading } = storeToRefs(logWeightingStore);

// Fungsi untuk mengambil data log
const fetchLogs = async () => {
    if (props.socialAssistanceId) {
        try {
            // Panggil action dari store untuk fetch data
            await logWeightingStore.fetchData(props.socialAssistanceId);
        } catch (error: any) {
            ElMessage.error(error.message || 'Gagal memuat data log.');
        }
    }
};

const url = import.meta.env.VITE_API_BASE_URL + 'storage/';

// Fungsi untuk membuka dokumen di tab baru
const viewDocument = (path: string) => {
    // Ganti 'http://api.backend.com/storage/' dengan URL base storage Anda
    const documentUrl = url + path;
    window.open(documentUrl, '_blank');
};

// Gunakan watch untuk memanggil fetchLogs saat socialAssistanceId tersedia/berubah
watch(() => props.socialAssistanceId, (newId) => {
    if (newId) {
        fetchLogs();
    }
}, { immediate: true }); // immediate: true agar langsung terpanggil saat komponen dibuat
</script>
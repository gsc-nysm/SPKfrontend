<template>
    <el-card class="box-card" shadow="never" style="border:none">
        <template #header>
            <div class="card-header">
                <span>Pencarian Penerima Bantuan</span>
            </div>
        </template>

        <el-tabs v-model="activeTab" class="custom-tabs">
            <el-tab-pane label="Calon Penerima Bantuan" name="calon"></el-tab-pane>
            <el-tab-pane label="Penerima Bantuan" name="penerima"></el-tab-pane>
        </el-tabs>

        <div class="search-container">
            <el-input v-model="searchQuery" :placeholder="searchPlaceholder" clearable @keyup.enter="handleSearch"
                size="large">
                <template #prepend>
                    <el-icon>
                        <Search />
                    </el-icon>
                </template>
            </el-input>
            <el-button type="primary" @click="handleSearch" :loading="isLoading" size="large" class="search-button">
                Cari
            </el-button>
        </div>

        <el-divider v-if="hasSearched" content-position="left">Hasil Pencarian</el-divider>

        <div v-if="hasSearched" class="results-container">
            <el-table :data="searchResults" v-loading="isLoading" style="width: 100%"
                v-if="!isLoading && searchResults.length > 0" border>
                <el-table-column type="index" label="No" width="60" />

                <el-table-column v-for="column in activeColumns" :key="column.prop" :prop="column.prop"
                    :label="column.label" width="auto">
                    <template #default="scope">
                        <span>{{ getProperty(scope.row, column.prop) }}</span>
                    </template>
                </el-table-column>

                <el-table-column label="Aksi" width="120" align="center">
                    <template #default="scope">
                        <el-button type="primary" :icon="View" circle />
                    </template>
                </el-table-column>
            </el-table>

            <el-empty description="Data tidak ditemukan. Silakan coba dengan kata kunci lain."
                v-if="!isLoading && searchResults.length === 0" />
        </div>

        <el-empty v-if="!hasSearched" description="Silakan masukkan NIK atau Nama untuk memulai pencarian">
            <template #image>
                <el-icon style="font-size: 64px;">
                    <Files />
                </el-icon>
            </template>
        </el-empty>

    </el-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Search, View, Files } from '@element-plus/icons-vue'; // Import ikon
import { usePotentialBeneficiaryStore } from '@/stores/potential_beneficiary';
import { useBeneficiaryStore } from '@/stores/beneficiary';
import { ElMessage } from 'element-plus';

const activeTab = ref('calon');
const searchQuery = ref('');
const hasSearched = ref(false);


const potentialBeneficiaryStore = usePotentialBeneficiaryStore();
const { search_results: calonResults, loading: calonLoading } = storeToRefs(potentialBeneficiaryStore);

const beneficiaryStore = useBeneficiaryStore();
const { search_results: penerimaResults, loading: penerimaLoading } = storeToRefs(beneficiaryStore);

const searchResults = computed(() => {
    return activeTab.value === 'calon' ? calonResults.value.data : penerimaResults.value.data;
});

// Secara cerdas memilih status loading berdasarkan tab aktif
const isLoading = computed(() => {
    return activeTab.value === 'calon' ? calonLoading.value : penerimaLoading.value;
});

const searchPlaceholder = computed(() => {
    return activeTab.value === 'calon'
        ? 'Cari berdasarkan NIK atau Nomor KK...'
        : 'Cari berdasarkan NIK atau Nomor KK...';
});

const handleSearch = async () => {
    if (!searchQuery.value.trim()) {
        ElMessage.warning('Input pencarian tidak boleh kosong.');
        return;
    }
    hasSearched.value = true;

    try {
        if (activeTab.value === 'calon') {
            await potentialBeneficiaryStore.search(searchQuery.value);
        } else {
            // Panggil action search dari beneficiaryStore (pastikan ada)
            await beneficiaryStore.search(searchQuery.value);
        }
    } catch (error: any) {
        ElMessage.error(error.message || 'Gagal terhubung ke server.');
    }
};

const getProperty = (obj: any, path: string) => {
    return path.split('.').reduce((o, key) => (o && o[key] !== 'undefined' ? o[key] : ''), obj);
};


const calonColumns = [
    { prop: 'nik', label: 'NIK' },
    { prop: 'no_kk', label: 'No KK' },
    { prop: 'nama_lengkap', label: 'Nama Lengkap' },
    { prop: 'pengajuan_id.instansi_id.nama_instansi', label: 'Desa Asal' },
    { prop: 'pengajuan_id.periode_pendaftaran_id.nama_periode', label: 'Periode Pengajuan' },
    { prop: 'bantuan_sosial_id.nama_bantuan', label: 'Jenis Bantuan' },
]

const penerimaColumns = [
    { prop: 'calon_penerima_id.nik', label: 'NIK' },
    { prop: 'calon_penerima_id.no_kk', label: 'No KK' },
    { prop: 'calon_penerima_id.nama_lengkap', label: 'Nama Lengkap' },
    { prop: 'kelompok_penerima_id.instansi_id.nama_instansi', label: 'Desa Asal' },
    { prop: 'kelompok_penerima_id.bantuan_sosial_id.nama_bantuan', label: 'Jenis Bantuan' },
]

const activeColumns = computed(() => {
    return activeTab.value === 'calon' ? calonColumns : penerimaColumns;
});

// UX Tambahan: Reset pencarian saat ganti tab
watch(activeTab, () => {
    hasSearched.value = false;
    searchQuery.value = '';
    calonResults.value = [];
    penerimaResults.value = [];
});
</script>

<style scoped>
.box-card {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
}

.card-header {
    font-weight: bold;
    font-size: 18px;
}

.search-container {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    margin-bottom: 20px;
}

.search-button {
    flex-shrink: 0;
}

.results-container {
    margin-top: 20px;
}

.custom-tabs .el-tabs__header {
    margin-bottom: 0;
}
</style>
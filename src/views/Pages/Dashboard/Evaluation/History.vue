<template>
    <el-card shadow="never" class="mb-4" style="border:none">
        <el-descriptions title="Data Pengajuan" :column="2" border>
            <el-descriptions-item label="Nama Instansi">{{ submission?.data.instansi_id.nama_instansi
                }}</el-descriptions-item>
            <el-descriptions-item label="Kode Instansi">{{ submission?.data.instansi_id.kode_instansi
                }}</el-descriptions-item>
            <el-descriptions-item label="Bantuan Sosial">{{
                submission?.data.periode_pendaftaran_id.bantuan_sosial_id.nama_bantuan_sosial }}</el-descriptions-item>
            <el-descriptions-item label="Periode Pendaftaran">{{ submission?.data.periode_pendaftaran_id.nama_periode }}
                -
                {{ submission?.data.periode_pendaftaran_id.tahun }}</el-descriptions-item>
        </el-descriptions>
    </el-card>

    <el-card shadow="never" style="border:none" class="mb-4">
        <div class="my-4 flex lg:flex-row md:flex-row gap-4 justify-end items-center">
            <div class="flex lg:flex-row md:flex-row items-center justify-end gap-5 w-1/2">
                <el-select placeholder="Pilih Status" v-model="statusFilter">
                    <el-option v-for="status in statusOptions" :key="status.value" :label="status.label"
                        :value="status.value" />
                </el-select>
                <el-button :icon="Close" class="w-full lg:w-fit md:w-fit" type="danger" @click="resetFilters"
                    v-if="statusFilter"></el-button>
                <el-input placeholder="Cari Calon Penerima ..." v-model="searchQuery" prefix-icon="el-icon-search"
                    class="w-full" clearable />
                <el-button plain class=" mb-2 lg:mb-0 w-full lg:w-fit md:w-fit" @click="exportData()"
                    :icon="Printer">Cetak</el-button>
            </div>
        </div>
    </el-card>

    <el-card shadow="never" style="border:none">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">
                <h1 class="text-xl font-semibold">Riwayat Penilaian SAW</h1>
            </div>
            <div>

            </div>
        </div>
        <div>
            <SawTable v-if="potential_beneficiaries" :data="potential_beneficiaries" />
        </div>
    </el-card>

    <el-card shadow="never" style="border:none" class="mt-4">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">
                <h1 class="text-xl font-semibold">Rwiayat Penilaian TOPSIS</h1>
            </div>

        </div>

        <div>
            <TopsisTable :data="potential_beneficiaries" />
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { Plus, Delete, Edit, View, Operation, Download, Upload, Close, Printer } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits, onMounted } from 'vue'
import type { IncomingApiData } from '@/models/SubCriteria'
import { debounce } from 'lodash-es'
import { usePotentialBeneficiaryStore } from '@/stores/potential_beneficiary';
import { useRoute, useRouter } from 'vue-router';
import { useSubmissionStore } from '@/stores/submission';
import { useAuthStore } from '@/stores/auth';
import { useCriteriaStore } from '@/stores/criteria';
import SawTable from '@/components/Dashboard/SawTable.vue';
import TopsisTable from '@/components/Dashboard/TopsisTable.vue';

const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const emit = defineEmits(['save', 'delete'])
const potential_beneficiaries = computed(() => store.potential_beneficiaries_ranked)
const store = usePotentialBeneficiaryStore()
const loading = computed(() => store.loading)
const auth = useAuthStore()
const currentPage = ref(1);
const currentPerPage = ref(60);
const route = useRoute();
const currentSearchQuery = ref('')
const isInitialFetchDone = ref(false);
const criteriaStore = useCriteriaStore();
const criteria = computed(() => criteriaStore.criterias);

const storeSubmission = useSubmissionStore();
const submission = ref<any>(null);

const visible = ref(false);
const statusFilter = ref<string>('')
const currentStatusQuery = ref('')



const statusOptions = [
    { label: 'Aktif', value: 'aktif' },
    { label: 'Diskualifikasi', value: 'diskualifikasi' },
    { label: 'Revisi', value: 'revisi' },
    { label: 'Divalidasi', value: 'divalidasi' },
    { label: 'Diverifikasi', value: 'diverifikasi' },
]
const exportData = async () => {
    try {
        // Ambil token autentikasi (misalnya dari localStorage atau state aplikasi)
        const token = localStorage.getItem('token'); // Sesuaikan dengan cara Anda menyimpan token

        if (!token) {
            throw new Error('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
        }

        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}api/v1/pengajuan/cetak/${route.params.submission_id}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Sesuaikan dengan tipe autentikasi (Bearer, Basic, dll.)
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf',

                },
            }
        );

        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.statusText}`);
        }

        // Asumsi API mengembalikan file (misalnya PDF)
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const pdfWindow = window.open(url, '_blank');
        if (!pdfWindow) {
            throw new Error('Popup diblokir, silakan izinkan popup untuk melihat file.');
        }
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.log((error as any).message);
    }
}
const fetchDataWithCurrentParams = () => {
    if (isInitialFetchDone.value && loading.value) {
        return; // Cegah pemanggilan ganda jika sedang loading
    }

    store.fetchRanking(searchQuery.value, String(route.params.submission_id), statusFilter.value);
};

// Debounce untuk filter
const debouncedFetch = debounce(() => {
    if (!isInitialFetchDone.value) {
        return; // Jangan panggil fetchData jika initial fetch belum selesai
    }
    currentPage.value = 1; // Reset ke halaman 1 saat filter berubah
    fetchDataWithCurrentParams();
}, 500);

const resetFilters = () => {
    searchQuery.value = ''
    statusFilter.value = ''
}

// Watch untuk filter
watch([searchQuery, statusFilter], () => {
    debouncedFetch()
})

// Watch untuk route.params.id agar data di-refresh saat rute berubah
watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            isInitialFetchDone.value = false; // Reset flag saat rute berubah
            currentPage.value = 1; // Reset ke halaman 1 saat rute berubah
            currentSearchQuery.value = searchQuery.value;
            currentStatusQuery.value = statusFilter.value;
            fetchDataWithCurrentParams();
            isInitialFetchDone.value = true; // Tandai bahwa initial fetch selesai
        }
    },
    { immediate: true }
);

// Watch untuk memastikan pagination dari store sinkron dengan state lokal
watch(
    () => store.pagination,
    (newPagination) => {
        if (newPagination) {
            currentPage.value = newPagination.current_page;
            currentPerPage.value = newPagination.per_page;
            currentSearchQuery.value = searchQuery.value;
            currentStatusQuery.value = statusFilter.value;
        }
    }
);

onMounted(async () => {
    try {
        // Ambil ID dari parameter rute
        const submissionId = Number(route.params.submission_id);
        if (submissionId) {
            // Panggil showData dan simpan hasilnya ke state lokal
            submission.value = await storeSubmission.showData(submissionId);
        } else {
            console.log('ID pengajuan tidak ditemukan');
        }

        const social_assistance_id = Number(route.params.id);
        if (social_assistance_id) {
            // Panggil showData dan simpan hasilnya ke state lokal
            await criteriaStore.fetchData(1, 10, '', String(route.params.id));
        } else {
            console.log('ID bantuan tidak ditemukan');
        }

    } catch (error) {
        console.error('Error loading departments:', error);
    }
});
</script>

<style lang="scss" scoped></style>
<template>
    <!-- <Breadcrumb/> -->
    <el-card shadow="never" style="border:none">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">
                <h1 class="text-xl font-semibold">Lihat Penilaian</h1>
            </div>
        </div>
        <div class="my-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-end items-center">
            <div class="flex lg:flex-row md:flex-row items-center justify-end gap-5 w-fit">
                <el-button :icon="Close" class="w-full lg:w-fit md:w-fit" type="danger" @click="resetFilters"
                    v-if="tingkatanFilter || statusFilter"></el-button>
                <el-input placeholder="Cari Penilaian ..." v-model="searchQuery" prefix-icon="el-icon-search"
                    class="w-full" clearable />
            </div>
        </div>

        <div>
            <Datatable :selection="true" :items="submissions" :pagination="pagination" :loading="loading"
                :customColumns="customColumns" @page-change="handlePageChange" @per-page-change="handlePerPageChange"
                @selection-change="onSelectionChange">
                <template #nama_bantuan_sosial="{ row }">
                    <span>{{ row.periode_pendaftaran_id.bantuan_sosial_id.nama_bantuan_sosial }}</span>
                </template>
                <template #nama_instansi="{ row }">
                    <span>{{ row.instansi_id.nama_instansi }}</span>
                </template>
                <template #periode_pendaftaran_id="{ row }">
                    <span>{{ row.periode_pendaftaran_id.nama_periode }} - {{ row.periode_pendaftaran_id.tahun }}</span>
                </template>
                <template #created_at="{ row }">
                    <span>{{ row.created_at }}</span>
                </template>
                <template #actions="{ row }">
                    <el-tooltip class="box-item" effect="dark" content="Kelola Calon Penerima" placement="top-start">
                        <el-button plain v-if="row.status == 'terima' || row.status == 'tutup'" type="primary"
                            size="small" @click="openPotentialBeneficiary(row)" :icon="User"></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="Lihat" placement="top-start">
                        <el-button plain type="info" size="small" @click="openCrudModal('show', row)"
                            :icon="View"></el-button>
                    </el-tooltip>

                </template>
            </Datatable>
            <crud-modal v-model:visible="crudModalVisible" :mode="crudModalMode" :data="crudModalData"
                :selected-ids="selectedRows.length > 0 ? selectedRows.map(row => row.id) : []" :form-fields="formFields"
                name="Pengajuan" :show-fields="showFields" :create-service="store.createData"
                :update-service="store.updateData" :delete-service="store.deleteData"
                :delete-multiple-service="store.deleteMultipleData" :show-service="store.showData" @save="handleSave"
                @multi-delete="handleMultiDelete" @delete="handleDelete" @close="crudModalVisible = false" />

        </div>
    </el-card>
</template>

<script setup lang="ts">
import Datatable from '@/components/Dashboard/Datatable.vue';
import { Plus, ArrowRight, Close, Delete, Edit, View, User, Search } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits } from 'vue'
import type { IncomingApiData } from '@/models/Submission'
import { debounce } from 'lodash-es'
import CrudModal from '@/components/Dashboard/CrudModal.vue'
import { useSubmissionStore } from '@/stores/submission';
import { useRoute, useRouter } from 'vue-router';
import Verify from '@/components/Dashboard/Verify.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore()
const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const statusFilter = ref<string>('')
const tingkatanFilter = ref<string>('')
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const store = useSubmissionStore() // Gunakan store
const emit = defineEmits(['save', 'delete'])
const submissions = computed(() => store.submissions)
const pagination = computed(() => store.pagination)
const loading = computed(() => store.loading)
// State untuk melacak page dan per_page
const currentPage = ref(1);
const currentPerPage = ref(10);
const route = useRoute();
const router = useRouter();
const currentSearchQuery = ref('')
const currentStatusQuery = ref('')
const isInitialFetchDone = ref(false);

const url = import.meta.env.VITE_API_BASE_URL + 'storage/'

// Definisikan formFields secara dinamis berdasarkan kebutuhan
const formFields = computed(() => [
    { prop: 'status', label: 'Status', type: 'select' as const, required: true, options: statusOptions },
])

const showFields = computed(() => [
    { prop: 'nama_instansi', label: 'Nama Instansi', type: 'text' as const, value: (data: any) => data.instansi_id?.nama_instansi || '-' },
    { prop: 'nama_bantuan_sosial', label: 'Nama Bantuan Sosial', type: 'text' as const, value: (data: any) => data.periode_pendaftaran_id?.bantuan_sosial_id?.nama_bantuan_sosial || '-' },
    { prop: 'periode_pendaftaran_id', label: 'Periode', type: 'text' as const, value: (data: any) => `${data.periode_pendaftaran_id?.nama_periode || '-'} - ${data.periode_pendaftaran_id?.tahun || '-'}` },
    { prop: 'dokumen', label: 'Dokumen', type: 'file' as const, value: (data: any) => `${data.dokumen || '-'}` },
    { prop: 'status', label: 'Status', type: 'text' as const },
    { prop: 'created_at', label: 'Dibuat pada', type: 'text' as const },
])

const statusOptions = [
    { label: 'Verifikasi', value: 'verifikasi' },
    { label: 'Terima', value: 'terima' },
    { label: 'Tolak', value: 'tolak' },
    { label: 'Tutup', value: 'tutup' },
]

const customColumns = ref([
    { prop: "nama_bantuan_sosial", label: "Nama Bantuan Sosial", width: 150 },
    { prop: "periode_pendaftaran_id", label: "Periode", width: 'auto' },
    { prop: "created_at", label: "Dibuat pada", width: 150 },
]);


const openCrudModal = (mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete', data: Partial<IncomingApiData> | null) => {
    crudModalMode.value = mode
    crudModalData.value = data
    crudModalVisible.value = true
}

const openPotentialBeneficiary = (data: any,) => {
    console.log(data);

    router.push({ name: 'ranking-evaluation-potential-beneficiary', params: { id: data.periode_pendaftaran_id.bantuan_sosial_id.id, submission_id: data.id } })
}

const handleSave = (savedData: IncomingApiData) => {
    // emit('save', savedData)
    crudModalVisible.value = false
    fetchDataWithCurrentParams();
}

const handleMultiDelete = (ids: number[]) => {
    crudModalVisible.value = false
    selectedRows.value = [] // Reset baris yang dipilih setelah multi-delete
    fetchDataWithCurrentParams();
}

const fetchDataWithCurrentParams = () => {
    if (isInitialFetchDone.value && loading.value) {
        return; // Cegah pemanggilan ganda jika sedang loading
    }
    store.fetchData(currentPage.value, currentPerPage.value, searchQuery.value, String(auth.user?.instansi?.id), '', '', statusFilter.value);
};

// Debounce untuk filter
const debouncedFetch = debounce(() => {
    if (!isInitialFetchDone.value) {
        return; // Jangan panggil fetchData jika initial fetch belum selesai
    }
    currentPage.value = 1; // Reset ke halaman 1 saat filter berubah
    fetchDataWithCurrentParams();
}, 500);

const handleDelete = (id: number) => {
    crudModalVisible.value = false
    fetchDataWithCurrentParams();
}

const handlePageChange = (page: number) => {
    currentPage.value = page;
    fetchDataWithCurrentParams();
};
const handlePerPageChange = (per_page: number) => {
    currentPerPage.value = per_page;
    currentPage.value = 1; // Reset ke halaman 1 saat per_page berubah
    fetchDataWithCurrentParams();
};

const onSelectionChange = (selection: any[]) => {
    selectedRows.value = selection; // Perbarui baris yang dipilih    
};


const resetFilters = () => {
    searchQuery.value = ''
    statusFilter.value = ''
    tingkatanFilter.value = ''
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
</script>

<style lang="scss" scoped></style>
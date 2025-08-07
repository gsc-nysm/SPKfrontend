<template>
    <!-- <Breadcrumb/> -->
    <el-card shadow="never" style="border:none">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">
                <h1 class="text-xl font-semibold">Kelola Riwayat Pengajuan</h1>
            </div>
        </div>
        <div class="my-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="lg:w-1/4 w-full">
                <el-button type="danger" @click="openCrudModal('multi-delete', null)" :icon="Delete"
                    :disabled="selectedRows.length === 0">
                    Hapus Pilihan ({{ selectedRows.length }})
                </el-button>
            </div>
            <div class="flex lg:flex-row md:flex-row items-center justify-end gap-5 w-1/2">
                <el-select placeholder="Pilih Status" v-model="statusFilter">
                    <el-option v-for="status in statusOptions" :key="status.value" :label="status.label"
                        :value="status.value" />
                </el-select>
                <el-button :icon="Close" class="w-full lg:w-fit md:w-fit" type="danger" @click="resetFilters"
                    v-if="tingkatanFilter || statusFilter"></el-button>
                <el-input placeholder="Cari Instansi ..." v-model="searchQuery" prefix-icon="el-icon-search"
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
                    <span>{{ row.periode_pendaftaran_id.bantuan_sosial_id.instansi.nama_instansi }}</span>
                </template>
                <template #nama_bidang="{ row }">
                    <span>{{ row.periode_pendaftaran_id.bantuan_sosial_id.bidang_instansi.nama_bidang_instansi }}</span>
                </template>
                <template #periode_pendaftaran_id="{ row }">
                    <span>{{ row.periode_pendaftaran_id.nama_periode }} - {{ row.periode_pendaftaran_id.tahun }}</span>
                </template>
                <template #status="{ row }">
                    <el-tag :type="statusTags(row.status)">
                        {{ row.status }}
                    </el-tag>
                </template>
                <template #actions="{ row }">
                    <el-tooltip class="box-item" effect="dark" content="Lihat Anggota" placement="top-start">
                        <el-button plain v-if="row.status == 'terima' || row.status == 'tutup'" type="primary"
                            size="small" @click="openPotentialBeneficiary(row)" :icon="User"></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="Edit" placement="top-start">
                        <el-button plain type="warning" size="small" @click="openCrudModal('update', row)"
                            :icon="Edit"></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="Lihat" placement="top-start">
                        <el-button plain type="info" size="small" @click="openCrudModal('show', row)"
                            :icon="View"></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="Hapus" placement="top-start">
                        <el-button plain v-if="row.status == 'verifikasi'" type="danger" size="small"
                            @click="openCrudModal('delete', row)" :icon="Delete"></el-button>
                    </el-tooltip>
                </template>
            </Datatable>
            <crud-modal v-model:visible="crudModalVisible" :mode="crudModalMode" :data="crudModalData"
                :selected-ids="selectedRows.length > 0 ? selectedRows.map(row => row.id) : []" :form-fields="formFields"
                name="Pengajuan" :create-service="store.createData" :update-service="store.updateData"
                :delete-service="store.deleteData" :delete-multiple-service="store.deleteMultipleData"
                :show-service="store.showData" @save="handleSave" @multi-delete="handleMultiDelete"
                @delete="handleDelete" @close="crudModalVisible = false" />
        </div>
    </el-card>
</template>

<script setup lang="ts">
import Datatable from '@/components/Dashboard/Datatable.vue';
import { Plus, ArrowRight, Close, Delete, Edit, View, User, Search } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits, onMounted } from 'vue'
import type { IncomingApiData } from '@/models/Submission'
import { debounce } from 'lodash-es'
import CrudModal from '@/components/Dashboard/CrudModal.vue'
import { useSubmissionStore } from '@/stores/submission';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore()
const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const statusFilter = ref<string>('')
const tingkatanFilter = ref<string>('')
const debouncedFetch = debounce(() => store.fetchData(1, 10, searchQuery.value, String(auth.user?.instansi?.id), '', '', statusFilter.value), 500)
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const store = useSubmissionStore() // Gunakan store
const emit = defineEmits(['save', 'delete'])
const submissions = computed(() => store.submissions)
const pagination = computed(() => store.pagination)
const loading = computed(() => store.loading)
import { useRouter } from 'vue-router'
const router = useRouter();

const url = import.meta.env.VITE_API_BASE_URL + 'storage/'

// Definisikan formFields secara dinamis berdasarkan kebutuhan
const formFields = computed(() => [
    {
        prop: 'dokumen', label: 'Dokumen Berita Acara', type: 'file' as const, required: true, allowedFormats: ['pdf', 'doc', 'docx'], // Hanya dokumen
        maxSize: 10,
    }
])

const statusOptions = [
    { label: 'Verifikasi', value: 'verifikasi' },
    { label: 'Terima', value: 'terima' },
    { label: 'Tolak', value: 'tolak' },
]

const customColumns = ref([
    { prop: "nama_bantuan_sosial", label: "Nama Bantuan Sosial", width: 'auto' },
    { prop: "nama_instansi", label: "Instansi", width: 120 },
    { prop: "nama_bidang", label: "Bidang", width: 120 },
    { prop: "periode_pendaftaran_id", label: "Periode", width: 150 },
    { prop: "status", label: "Status", width: '120px' },
]);

const statusTags = (item: any) => {
    if (!item) return '';
    const status = item.trim().toLowerCase(); // Hapus spasi & ubah ke lowercase

    switch (status) {
        case 'verifikasi':
            return 'warning';
        case 'terima':
            return 'success';
        case 'tolak':
            return 'danger';
        case 'tutup':
            return 'danger';
        default:
            return '';
    }
}

const openCrudModal = (mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete', data: Partial<IncomingApiData> | null) => {
    crudModalMode.value = mode
    crudModalData.value = data
    crudModalVisible.value = true
}

const handleSave = (savedData: IncomingApiData) => {
    // emit('save', savedData)
    crudModalVisible.value = false
}

const openPotentialBeneficiary = (data: any) => {
    router.push({ name: 'manage-potential-beneficiary', params: { id: data.periode_pendaftaran_id.bantuan_sosial_id.id, submission_id: data.id } })
}

const handleMultiDelete = (ids: number[]) => {
    crudModalVisible.value = false
    selectedRows.value = [] // Reset baris yang dipilih setelah multi-delete
    store.fetchData(pagination.value?.current_page || 1, pagination.value?.per_page || 10, searchQuery.value, String(auth.user?.instansi?.id)); // Refresh data untuk memastikan konsistensi
}

const handleDelete = (id: number) => {
    crudModalVisible.value = false
}

const handlePageChange = (page: number) => {
    store.fetchData(page, pagination.value?.per_page || 10, searchQuery.value, String(auth.user?.instansi?.id)); // Refresh data untuk memastikan konsistensi
};
const handlePerPageChange = (per_page: number) => {
    store.fetchData(1, per_page, searchQuery.value, String(auth.user?.instansi?.id)); // Refresh data untuk memastikan konsistensi       
};

const onSelectionChange = (selection: any[]) => {
    selectedRows.value = selection; // Perbarui baris yang dipilih    
};


const resetFilters = () => {
    searchQuery.value = ''
    statusFilter.value = ''
    tingkatanFilter.value = ''
}

onMounted(() => {
    store.fetchData(1, 10, searchQuery.value, String(auth.user?.instansi?.id)); // Fetch data awal
});

watch([searchQuery, statusFilter, tingkatanFilter], debouncedFetch)
</script>

<style lang="scss" scoped></style>
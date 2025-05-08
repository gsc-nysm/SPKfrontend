<template>
    <el-card shadow="never" class="mb-4" style="border:none">
        <el-descriptions title="Data Pengajuan" :column="2" border>
            <el-descriptions-item label="Nama Instansi">
                {{ beneficiaryGroup?.data.instansi_id.nama_instansi }}
            </el-descriptions-item>
            <el-descriptions-item label="Bantuan Sosial">
                {{ beneficiaryGroup?.data.bantuan_sosial_id.nama_bantuan_sosial }}
            </el-descriptions-item>
            <el-descriptions-item label="Tanggal Penerimaan">
                {{ beneficiaryGroup?.data.tanggal_penerimaan }}
            </el-descriptions-item>
            <el-descriptions-item label="Status">
                {{ beneficiaryGroup?.data.status }}
            </el-descriptions-item>
        </el-descriptions>
    </el-card>
    <el-card shadow="never" style="border:none">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">
                <h1 class="text-xl font-semibold">Kelola Penerima Bantuan</h1>
            </div>
            <div>
                <el-button plain class=" mb-2 lg:mb-0 w-full lg:w-fit md:w-fit" @click="exportData()"
                    :icon="Printer">Cetak</el-button>
                <el-button v-if="beneficiaryGroup?.data.status == 'terima'" type="primary"
                    class="w-full lg:w-fit md:w-fit" @click="openCrudModal('create', null)"
                    :icon="Plus">Tambah</el-button>
            </div>
        </div>
        <div class="my-4 flex lg:flex-row md:flex-row gap-4 justify-between items-center">
            <div class="lg:w-1/4">
                <el-button type="danger" v-if="auth.user?.role?.name == 'verifikator'"
                    @click="openCrudModal('multi-delete', null)" :icon="Delete" :disabled="selectedRows.length === 0">
                    Hapus Pilihan ({{ selectedRows.length }})
                </el-button>
            </div>
            <div class="flex lg:flex-row md:flex-row items-center justify-end gap-5 w-fit">
                <!-- <el-select placeholder="Pilih Status" v-model="statusFilter">
                    <el-option v-for="status in statusOptions" :key="status.value" :label="status.label"
                        :value="status.value" />
                </el-select> -->
                <el-button :icon="Close" class="w-full lg:w-fit md:w-fit" type="danger" @click="resetFilters"
                    v-if="statusFilter"></el-button>
                <el-input placeholder="Cari Penerima Bantuan ..." v-model="searchQuery" prefix-icon="el-icon-search"
                    class="w-full" clearable />
            </div>
        </div>

        <div>
            <Datatable :selection="true" :items="beneficiaries" :pagination="pagination" :loading="loading"
                :customColumns="customColumns" @page-change="handlePageChange" @per-page-change="handlePerPageChange"
                @selection-change="onSelectionChange">
                <template #nik="{ row }">
                    <span>{{ row.calon_penerima_id.nik }}</span>
                </template>
                <template #nama_lengkap="{ row }">
                    <span>{{ row.calon_penerima_id.nama_lengkap }}</span>
                </template>
                <template #jenis_kelamin="{ row }">
                    <span>{{ row.calon_penerima_id.jenis_kelamin }}</span>
                </template>
                <template #desil="{ row }">
                    <span>{{ row.calon_penerima_id.desil }}</span>
                </template>
                <template #alamat="{ row }">
                    <span>{{ row.calon_penerima_id.alamat }}</span>
                </template>
                <template #status="{ row }">
                    <el-tag v-if="row.status" :type="statusTags(row.status)">{{ row.status }}</el-tag>
                </template>
                <template #actions="{ row }">
                    <!-- <el-tooltip class="box-item" effect="dark" content="Edit" placement="top-start">
                        <el-button plain type="warning" size="small" @click="openCrudModal('update', row)"
                            :icon="Edit"></el-button>
                    </el-tooltip> -->
                    <el-tooltip class="box-item" effect="dark" content="Lihat" placement="top-start">
                        <el-button plain type="info" size="small" @click="openCrudModal('show', row)"
                            :icon="View"></el-button>
                    </el-tooltip>
                    <template v-if="auth.user?.role?.name == 'verifikator'">
                        <el-tooltip class="box-item" effect="dark" content="Hapus" placement="top-start">
                            <el-button plain type="danger" size="small" @click="openCrudModal('delete', row)"
                                :icon="Delete"></el-button>
                        </el-tooltip>
                    </template>
                </template>
            </Datatable>
            <crud-modal v-model:visible="crudModalVisible" :mode="crudModalMode" :data="crudModalData"
                :selected-ids="selectedRows.length > 0 ? selectedRows.map(row => row.id) : []" :form-fields="formFields"
                name="Penerima Bantuan" :create-service="store.createData" :update-service="store.updateData"
                :show-fields="showFields" :delete-service="store.deleteData"
                :delete-multiple-service="store.deleteMultipleData" :show-service="store.showData" @save="handleSave"
                @multi-delete="handleMultiDelete" @delete="handleDelete" @close="crudModalVisible = false" />
        </div>
    </el-card>

</template>

<script setup lang="ts">
import Datatable from '@/components/Dashboard/Datatable.vue';
import { Plus, Delete, Edit, View, Operation, Download, Upload, Close, Printer } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits, onMounted } from 'vue'
import type { IncomingApiData } from '@/models/SubCriteria'
import { debounce } from 'lodash-es'
import CrudModal from '@/components/Dashboard/CrudModal.vue'
import { useBeneficiaryStore } from '@/stores/beneficiary';
import { useRoute, useRouter } from 'vue-router';
import { useBeneficiaryGroupStore } from '@/stores/beneficiary_group';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { useEvaluationStore } from '@/stores/evaluation';

const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const store = useBeneficiaryStore() // Gunakan store
const emit = defineEmits(['save', 'delete'])
const beneficiaries = computed(() => store.beneficiaries)
const pagination = computed(() => store.pagination)
const loading = computed(() => store.loading)
const auth = useAuthStore()
const currentPage = ref(1);
const currentPerPage = ref(10);
const route = useRoute();
const currentSearchQuery = ref('')
const isInitialFetchDone = ref(false);

const storeBeneficiaryGroup = useBeneficiaryGroupStore();
const beneficiaryGroup = ref<any>(null);

const statusFilter = ref<string>('')
const currentStatusQuery = ref('')

// Definisikan formFields secara dinamis berdasarkan kebutuhan
const formFields = computed(() => {
    return [
        { prop: 'keterangan', label: 'Alasan Diskualifikasi Calon Penerima', type: 'textarea' as const, required: true },
    ];
});

const customColumns = ref([
    { prop: "nik", label: "NIK", width: 100 },
    { prop: "nama_lengkap", label: "Nama Lengkap", width: 'auto' },
    { prop: "jenis_kelamin", label: "Jenis Kelamin", width: 100 },
    { prop: "desil", label: "Desil", width: 100 },
    { prop: "alamat", label: "Alamat", width: 100 },
]);


const showFields = computed(() => [
    { prop: 'nik', label: 'NIK', type: 'text' as const, value: (data: any) => data.calon_penerima_id.nik || '-' },
    { prop: 'nama_lengkap', label: 'Nama Lengkap', type: 'text' as const, value: (data: any) => data.calon_penerima_id.nama_lengkap || '-' },
    { prop: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'text' as const, value: (data: any) => `${data.calon_penerima_id.jenis_kelamin || '-'}` },
    { prop: 'alamat', label: 'Alamat', type: 'text' as const, value: (data: any) => `${data.calon_penerima_id.alamat || '-'}` },
    { prop: 'desil', label: 'Desil', type: 'text' as const, value: (data: any) => `${data.calon_penerima_id.desil || '-'}` },
    { prop: 'status', label: 'Status', type: 'text' as const, value: (data: any) => `${data.calon_penerima_id.status || '-'}` },

    { prop: 'keterangan', label: 'Keterangan', type: 'text' as const, value: (data: any) => `${data.calon_penerima_id.keterangan || '-'}` },

    { prop: 'created_at', label: 'Dibuat pada', type: 'text' as const },
])


const statusOptions = [
    { label: 'Aktif', value: 'aktif' },
    { label: 'Diskualifikasi', value: 'diskualifikasi' },
    { label: 'Pengganti', value: 'pengganti' },
]
const exportData = async () => {
    try {
        // Ambil token autentikasi (misalnya dari localStorage atau state aplikasi)
        const token = localStorage.getItem('token'); // Sesuaikan dengan cara Anda menyimpan token

        if (!token) {
            throw new Error('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
        }

        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}api/v1/penerima-bantuan/cetak/${route.params.beneficiary_group_id}`,
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

const statusTags = (item: any) => {
    if (!item) return '';
    const status = item.trim().toLowerCase(); // Hapus spasi & ubah ke lowercase

    switch (status) {
        case 'pengganti':
            return 'warning';
        case 'aktif':
            return 'success';
        case 'diskualifikasi':
            return 'danger';
        default:
            return 'primary';
    }
}
const fetchDataWithCurrentParams = () => {
    if (isInitialFetchDone.value && loading.value) {
        return; // Cegah pemanggilan ganda jika sedang loading
    }

    store.fetchData(currentPage.value, currentPerPage.value, searchQuery.value, String(route.params.beneficiary_group_id), '', statusFilter.value);
};

// Debounce untuk filter
const debouncedFetch = debounce(() => {
    if (!isInitialFetchDone.value) {
        return; // Jangan panggil fetchData jika initial fetch belum selesai
    }
    currentPage.value = 1; // Reset ke halaman 1 saat filter berubah
    fetchDataWithCurrentParams();
}, 500);

const openCrudModal = (mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete', data: Partial<IncomingApiData> | null) => {
    crudModalMode.value = mode
    crudModalData.value = data
    crudModalVisible.value = true
}

const handleSave = (savedData: IncomingApiData) => {
    emit('save', savedData)
    crudModalVisible.value = false
    fetchDataWithCurrentParams();
}

const handleMultiDelete = (ids: number[]) => {
    crudModalVisible.value = false
    selectedRows.value = [] // Reset baris yang dipilih setelah multi-delete
    fetchDataWithCurrentParams();
}
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
        const beneficiaryGroupId = Number(route.params.beneficiary_group_id);
        if (beneficiaryGroupId) {
            // Panggil showData dan simpan hasilnya ke state lokal
            beneficiaryGroup.value = await storeBeneficiaryGroup.showData(beneficiaryGroupId);
        } else {
            console.log('ID instansi tidak ditemukan');

        }

    } catch (error) {
        console.error('Error loading departments:', error);
    }
});
</script>

<style lang="scss" scoped></style>
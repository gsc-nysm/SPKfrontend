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
    <el-card shadow="never" style="border:none">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">
                <h1 class="text-xl font-semibold">Peringkat Calon Penerima</h1>
            </div>
            <div>
                <el-button plain class=" mb-2 lg:mb-0 w-full lg:w-fit md:w-fit" @click="exportData()"
                    :icon="Printer">Cetak</el-button>
                <el-button plain class=" mb-2 lg:mb-0 w-full lg:w-fit md:w-fit" @click="openHistory()"
                    :icon="Upload">Riwayat Penilaian</el-button>
            </div>
        </div>
        <div class="my-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="lg:w-1/4 w-full" v-if="auth.user?.role?.name == 'verifikator'">
                <el-button type="primary" @click="openVerifyModal('multi', selectedRows)" :icon="Check"
                    :disabled="selectedRows.length === 0">
                    Verifikasi Penerima ({{ selectedRows.length }})
                </el-button>
            </div>
            <div class="flex lg:flex-row md:flex-row items-center justify-end gap-5 w-1/2">
                <el-select placeholder="Pilih Status" v-model="statusFilter">
                    <el-option v-for="status in statusOptions" :key="status.value" :label="status.label"
                        :value="status.value" />
                </el-select>
                <el-button :icon="Close" class="w-full lg:w-fit md:w-fit" type="danger" @click="resetFilters"
                    v-if="statusFilter"></el-button>
                <el-input placeholder="Cari Calon Penerima ..." v-model="searchQuery" prefix-icon="el-icon-search"
                    class="w-full" clearable />
            </div>
        </div>

        <div>
            <Datatable :selection="true" :items="potential_beneficiaries" :loading="loading"
                :customColumns="customColumns" @selection-change="onSelectionChange">
                <template #status="{ row }">
                    <el-tag v-if="row.status" :type="statusTags(row.status)">{{ row.status }}</el-tag>
                </template>
                <template #hasil_akhir.nilai_saw="{ row }">
                    {{ row.hasil_akhir.nilai_saw ? (row.hasil_akhir.nilai_saw * 100).toFixed() : 'Belum Dinilai' }}
                </template>
                <template #hasil_akhir.nilai_preferensi="{ row }">
                    {{ row.hasil_akhir.nilai_preferensi ? (row.hasil_akhir.nilai_preferensi * 100).toFixed() :
                        '-' }}
                </template>
                <template #actions="{ row }">
                    <template v-if="auth.user?.role?.name == 'verifikator'">
                        <el-tooltip class="box-item" effect="dark" content="Verifikasi" placement="top-start">
                            <el-button plain type="primary" size="small" @click="openVerifyModal('single', row)"
                                :icon="Check"></el-button>
                        </el-tooltip>
                    </template>
                    <el-tooltip class="box-item" effect="dark" content="Verifikasi" placement="top-start">
                        <el-button plain type="success" size="small" @click="openVerify(row)"
                            :icon="Operation"></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="Lihat" placement="top-start">
                        <el-button plain type="info" size="small" @click="openCrudModal('show', row)"
                            :icon="View"></el-button>
                    </el-tooltip>
                </template>
            </Datatable>
            <crud-modal v-model:visible="crudModalVisible" :mode="crudModalMode" :data="crudModalData"
                :selected-ids="selectedRows.length > 0 ? selectedRows.map(row => row.id) : []" :form-fields="formFields"
                name="Calon Penerima Bantuan" :create-service="store.createData" :update-service="store.updateData"
                :show-fields="showFields" :delete-service="store.deleteData"
                :delete-multiple-service="store.deleteMultipleData" :show-service="store.showData" @save="handleSave"
                @multi-delete="handleMultiDelete" @delete="handleDelete" @close="crudModalVisible = false" />
            <Verify v-model:visible="visible" :data="evaluations" />
            <VerifyBeneficiary v-model:visible="verifyModalVisible" :data="verifyModalData"
                :selected-ids="verifyModalMode === 'multi' ? selectedRows.map(row => row.id) : []"
                @success="handleVerifySuccess" />
        </div>
    </el-card>
</template>

<script setup lang="ts">
import Datatable from '@/components/Dashboard/Datatable.vue';
import { Plus, Delete, Edit, View, Operation, Download, Upload, Close, Check, Printer } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits, onMounted } from 'vue'
import type { IncomingApiData } from '@/models/SubCriteria'
import { debounce } from 'lodash-es'
import CrudModal from '@/components/Dashboard/CrudModal.vue'
import { usePotentialBeneficiaryStore } from '@/stores/potential_beneficiary';
import { useRoute, useRouter } from 'vue-router';
import { useSubmissionStore } from '@/stores/submission';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import Verify from '@/components/Dashboard/Verify.vue';
import { useEvaluationStore } from '@/stores/evaluation';
import VerifyBeneficiary from '@/components/Dashboard/VerifyBeneficiary.vue';

const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const store = usePotentialBeneficiaryStore() // Gunakan store
const emit = defineEmits(['save', 'delete', 'update:visible'])
const potential_beneficiaries = computed(() => store.potential_beneficiaries_ranked)
const loading = computed(() => store.loading)
const auth = useAuthStore()
const currentPage = ref(1);
const currentPerPage = ref(10);
const route = useRoute();
const router = useRouter();
const currentSearchQuery = ref('')
const isInitialFetchDone = ref(false);
const evaluationStore = useEvaluationStore();
const evaluations = computed(() => evaluationStore.evaluations);

const verifyModalVisible = ref(false);
const verifyModalMode = ref<'single' | 'multi'>('single');
const verifyModalData = ref<any>(null);

const storeSubmission = useSubmissionStore();
const submission = ref<any>(null);

const visible = ref(false);
const statusFilter = ref<string>('')
const currentStatusQuery = ref('')

const openVerifyModal = (mode: 'single' | 'multi', data: any = null) => {
    verifyModalMode.value = mode;
    verifyModalData.value = mode === 'single' ? [data] : data;
    verifyModalVisible.value = true;
};

const handleVerifySuccess = () => {
    fetchDataWithCurrentParams(); // Refresh data setelah verifikasi
    selectedRows.value = []; // Reset baris yang dipilih setelah verifikasi perkelompok
};

// Definisikan formFields secara dinamis berdasarkan kebutuhan
const formFields = computed(() => {
    if (auth.user?.role?.name == 'verifikator' || crudModalMode.value == 'create') {
        return [
            { prop: 'nama_lengkap', label: 'Nama Lengkap', type: 'text' as const, required: true },
            { prop: 'nik', label: 'NIK', type: 'text' as const, required: true },
            { prop: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select' as const, options: jenis_kelamin_options, required: true },
            { prop: 'alamat', label: 'Alamat', type: 'text' as const, required: true },
            { prop: 'desil', label: 'Desil', type: 'text' as const, required: true },
            { prop: 'bantuan_diterima', label: 'Bantuan Diterima', type: 'text' as const, required: true },
        ];
    } else if (crudModalMode.value == 'update') {
        return [
            { prop: 'keterangan', label: 'Alasan Diskualifikasi Calon Penerima', type: 'textarea' as const, required: true },
        ];
    }
    return []; // Ensure a valid array is always returned
});

const customColumns = ref([
    { prop: "nik", label: "NIK", width: 100 },
    { prop: "nama_lengkap", label: "Nama Lengkap", width: 'auto' },
    { prop: "jenis_kelamin", label: "Jenis Kelamin", width: 100 },
    { prop: "desil", label: "Desil", width: 100 },
    { prop: "status", label: "Status", width: 150 },
    { prop: "hasil_akhir.nilai_saw", label: "Nilai Awal", width: 150 },
    { prop: "hasil_akhir.nilai_preferensi", label: "Nilai Akhir", width: 150 },
]);


const statusOptions = [
    { label: 'Aktif', value: 'aktif' },
    { label: 'Diskualifikasi', value: 'diskualifikasi' },
    { label: 'Pengganti', value: 'pengganti' },
]

const showFields = computed(() => [
    { prop: 'nik', label: 'NIK', type: 'text' as const, value: (data: any) => data.nik || '-' },
    { prop: 'nama_lengkap', label: 'Nama Lengkap', type: 'text' as const, value: (data: any) => data.nama_lengkap || '-' },
    { prop: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'text' as const, value: (data: any) => `${data.jenis_kelamin || '-'}` },
    { prop: 'alamat', label: 'Alamat', type: 'text' as const, value: (data: any) => `${data.alamat || '-'}` },
    { prop: 'desil', label: 'Desil', type: 'text' as const, value: (data: any) => `${data.desil || '-'}` },
    { prop: 'status', label: 'Status', type: 'text' as const, value: (data: any) => `${data.status || '-'}` },
    { prop: 'keterangan', label: 'Keterangan', type: 'text' as const, value: (data: any) => `${data.keterangan || '-'}` },

    { prop: 'created_at', label: 'Dibuat pada', type: 'text' as const },
])

const jenis_kelamin_options = [
    { label: 'Laki-laki', value: 'L' },
    { label: 'Perempuan', value: 'P' },
]

const openVerify = async (data: any) => {
    await evaluationStore.fetchData(1, 50, '', data.id);

    visible.value = !visible.value
}

const openHistory = () => {
    router.push({
        name: 'history-evaluation-potential-beneficiary',
        params: {
            submission_id: submission.value.id,
        },
    });
}

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
        case 'divalidasi':
            return 'info';
        case 'diverifikasi':
            return 'primary';
        case 'revisi':
            return 'warning';
        default:
            return 'primary';
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
    fetchDataWithCurrentParams();
}, 500);

const openCrudModal = (mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete', data: Partial<IncomingApiData> | null) => {
    crudModalMode.value = mode
    crudModalData.value = data
    crudModalVisible.value = true
}

const handleSave = (savedData: IncomingApiData) => {
    emit('update:visible', savedData)
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
            currentSearchQuery.value = searchQuery.value;
            currentStatusQuery.value = statusFilter.value;
            fetchDataWithCurrentParams();
            isInitialFetchDone.value = true; // Tandai bahwa initial fetch selesai
        }
    },
    { immediate: true }
);

onMounted(async () => {
    try {
        // Ambil ID dari parameter rute
        const submissionId = Number(route.params.submission_id);
        if (submissionId) {
            // Panggil showData dan simpan hasilnya ke state lokal
            submission.value = await storeSubmission.showData(submissionId);
        } else {
            console.log('ID instansi tidak ditemukan');
        }

    } catch (error) {
        console.error('Error loading departments:', error);
    }
});
</script>

<style lang="scss" scoped></style>
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
                <h1 class="text-xl font-semibold">Kelola Calon Penerima Bantuan</h1>
            </div>
            <div>
                <el-button plain class=" mb-2 lg:mb-0 w-full lg:w-fit md:w-fit" @click="exportData()"
                    :icon="Download">Ekspor</el-button>
                <template v-if="auth.user?.role?.name == 'verifikator' && submission?.data.status == 'terima'">
                    <el-button plain class=" mb-2 lg:mb-0 w-full lg:w-fit md:w-fit" @click="openImportDialog()"
                        :icon="Upload">Impor</el-button>
                </template>
                <el-button v-if="submission?.data.status == 'terima'" type="primary" class="w-full lg:w-fit md:w-fit"
                    @click="openCrudModal('create', null)" :icon="Plus">Tambah</el-button>
            </div>
        </div>
        <div class="my-4 flex lg:flex-row md:flex-row gap-4 justify-between items-center">
            <div class="lg:w-1/4">
                <el-button type="danger" v-if="auth.user?.role?.name == 'verifikator'"
                    @click="openCrudModal('multi-delete', null)" :icon="Delete" :disabled="selectedRows.length === 0">
                    Hapus Pilihan ({{ selectedRows.length }})
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
            <Datatable :selection="true" :items="potential_beneficiaries" :pagination="pagination" :loading="loading"
                :customColumns="customColumns" @page-change="handlePageChange" @per-page-change="handlePerPageChange"
                @selection-change="onSelectionChange">
                <template #status="{ row }">
                    <el-tag v-if="row.status" :type="statusTags(row.status)">{{ row.status }}</el-tag>
                </template>
                <template #tahapan="{ row }">
                    <el-tag v-if="row.tahapan" :type="tahapanTags(row.tahapan)">{{ row.tahapan }}</el-tag>
                </template>
                <template #actions="{ row }">
                    <template v-if="row.status != 'diskualifikasi'">
                        <template v-if="auth.user?.role?.name == 'validator' && submission?.data.status == 'terima'">
                            <template
                                v-if="(row.tahapan != 'divalidasi' && row.tahapan != 'diverifikasi') || row.status == 'revisi'">
                                <el-tooltip class="box-item" effect="dark" content="Validasi" placement="top-start">
                                    <el-button plain type="success" size="small" @click="openValidate(row)"
                                        :icon="Operation"></el-button>
                                </el-tooltip>
                            </template>
                        </template>
                        <template
                            v-else-if="auth.user?.role?.name == 'verifikator' && (row.tahapan == 'divalidasi' || row.tahapan == 'diverifikasi')">
                            <el-tooltip class="box-item" effect="dark" content="Verifikasi" placement="top-start">
                                <el-button plain type="success" size="small" @click="openVerify(row)"
                                    :icon="Operation"></el-button>
                            </el-tooltip>
                        </template>
                        <template v-else-if="submission?.data.status == 'terima'">
                            <el-tooltip class="box-item" effect="dark" content="Edit" placement="top-start">
                                <el-button plain type="warning" size="small" @click="openCrudModal('update', row)"
                                    :icon="Edit"></el-button>
                            </el-tooltip>
                        </template>
                    </template>

                    <el-tooltip class="box-item" effect="dark" content="Lihat" placement="top-start">
                        <el-button plain type="info" size="small" @click="openCrudModal('show', row)"
                            :icon="View"></el-button>
                    </el-tooltip>

                    <template v-if="submission?.data.status == 'terima'">
                        <el-tooltip class="box-item" effect="dark" content="Hapus" placement="top-start">
                            <template v-if="auth.user?.role?.name == 'verifikator'">
                                <el-button plain type="danger" size="small" @click="openCrudModal('delete', row)"
                                    :icon="Delete"></el-button>
                            </template>
                            <template v-else-if="auth.user?.role?.name == 'validator'">
                                <el-button plain type="danger" size="small" @click="openCrudModal('update', row)"
                                    :icon="Delete"></el-button>
                            </template>
                        </el-tooltip>
                    </template>
                </template>
            </Datatable>
            <crud-modal v-model:visible="crudModalVisible" :mode="crudModalMode" :data="crudModalData"
                :selected-ids="selectedRows.length > 0 ? selectedRows.map(row => row.id) : []" :form-fields="formFields"
                name="Calon Penerima Bantuan" :create-service="store.createData" :update-service="store.updateData"
                :show-fields="showFields" :delete-service="store.deleteData"
                :delete-multiple-service="store.deleteMultipleData" :show-service="store.showData" @save="handleSave"
                @multi-delete="handleMultiDelete" @delete="handleDelete" @close="crudModalVisible = false" />
            <Verify v-model:visible="visible" :data="evaluations" :update-service="store.updateStatus" />
        </div>
    </el-card>
    <!-- Dialog untuk Import -->
    <el-dialog title="Import Data" v-model="importDialogVisible" width="30%" :before-close="handleCloseImportDialog">
        <el-upload ref="uploadRef" drag accept=".xlsx" :auto-upload="false" :on-change="handleFileChange" :limit="1"
            :on-exceed="handleExceed">
            <el-icon class="el-icon--upload">
                <UploadFilled />
            </el-icon>
            <div class="el-upload__text">
                Drop file XLSX di sini atau <em>klik untuk upload</em>
            </div>
            <template #tip>
                <div class="el-upload__tip">
                    Hanya file XLSX yang diperbolehkan (maksimal 1 file).
                </div>
            </template>
        </el-upload>

        <template #footer>
            <span class="dialog-footer">
                <el-button class="mr-2" @click="handleCloseImportDialog">Batal</el-button>
                <el-button type="primary" @click="handleImport" :disabled="!file">
                    Import
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import Datatable from '@/components/Dashboard/Datatable.vue';
import { Plus, Delete, Edit, View, Operation, Download, Upload, Close } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits, onMounted } from 'vue'
import type { IncomingApiData } from '@/models/SubCriteria'
import { debounce } from 'lodash-es'
import CrudModal from '@/components/Dashboard/CrudModal.vue'
import { usePotentialBeneficiaryStore } from '@/stores/potential_beneficiary';
import { useRoute, useRouter } from 'vue-router';
import { useSubmissionStore } from '@/stores/submission';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import Verify from '@/components/Dashboard/Verify.vue';
import { useEvaluationStore } from '@/stores/evaluation';

const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const store = usePotentialBeneficiaryStore() // Gunakan store
const emit = defineEmits(['save', 'delete'])
const potential_beneficiaries = computed(() => store.potential_beneficiaries)
const pagination = computed(() => store.pagination)
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

const storeSubmission = useSubmissionStore();
const submission = ref<any>(null);

const visible = ref(false);
const statusFilter = ref<string>('')
const currentStatusQuery = ref('')


// State untuk dialog impor
const importDialogVisible = ref(false);
const file = ref<File | null>(null);
const uploadRef = ref<any>(null);

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
    { prop: "tahapan", label: "Tahapan", width: 150 },
]);


const showFields = computed(() => [
    { prop: 'nik', label: 'NIK', type: 'text' as const, value: (data: any) => data.nik || '-' },
    { prop: 'no_kk', label: 'No KK', type: 'text' as const, value: (data: any) => data.no_kk || '-' },
    { prop: 'nama_lengkap', label: 'Nama Lengkap', type: 'text' as const, value: (data: any) => data.nama_lengkap || '-' },
    { prop: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'text' as const, value: (data: any) => `${data.jenis_kelamin || '-'}` },
    { prop: 'alamat', label: 'Alamat', type: 'text' as const, value: (data: any) => `${data.alamat || '-'}` },
    { prop: 'desil', label: 'Desil', type: 'text' as const, value: (data: any) => `${data.desil || '-'}` },
    { prop: 'status', label: 'Status', type: 'text' as const, value: (data: any) => `${data.status || '-'}` },
    { prop: 'tahapan', label: 'Tahapan', type: 'text' as const, value: (data: any) => `${data.tahapan || '-'}` },
    { prop: 'keterangan', label: 'Keterangan', type: 'text' as const, value: (data: any) => `${data.keterangan || '-'}` },

    { prop: 'created_at', label: 'Dibuat pada', type: 'text' as const },
])

const jenis_kelamin_options = [
    { label: 'Laki-laki', value: 'L' },
    { label: 'Perempuan', value: 'P' },
]

const statusOptions = [
    { label: 'Aktif', value: 'aktif' },
    { label: 'Diskualifikasi', value: 'diskualifikasi' },
    { label: 'Pengganti', value: 'pengganti' },
]

const tahapanOptions = [
    { label: 'Divalidasi', value: 'divalidasi' },
    { label: 'Diverifikasi', value: 'diverifikasi' },
    { label: 'Revisi', value: 'revisi' },
    { label: 'Menunggu', value: 'menunggu' },
]

// Fungsi untuk membuka dialog impor
const openImportDialog = () => {
    importDialogVisible.value = true;
};

const openValidate = (data: any) => {
    router.push({ name: 'verify-potential-beneficiary', params: { id: router.currentRoute.value.params.id, submission_id: data.pengajuan_id.id, potential_beneficiary_id: data.id } })
}

const openVerify = async (data: any) => {
    await evaluationStore.fetchData(1, 50, '', data.id);

    visible.value = !visible.value
}

const exportData = async () => {
    try {
        await store.exportData(submission.value);
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

const tahapanTags = (item: any) => {
    if (!item) return '';
    const tahapan = item.trim().toLowerCase(); // Hapus spasi & ubah ke lowercase

    switch (tahapan) {
        case 'menunggu':
            return 'warning';
        case 'diverifikasi':
            return 'success';
        case 'divalidasi':
            return 'primary';
        default:
            return 'primary';
    }
}

// Fungsi untuk menangani perubahan file
const handleFileChange = (uploadFile: any) => {
    file.value = uploadFile.raw;
};

// Fungsi untuk menangani batas file
const handleExceed = () => {
    ElMessage.warning('Hanya 1 file yang diperbolehkan. Silakan hapus file sebelumnya.');
};

// Fungsi untuk menutup dialog impor
const handleCloseImportDialog = () => {
    importDialogVisible.value = false;
    file.value = null;
    uploadRef.value?.clearFiles();
};

// Fungsi untuk menangani impor
const handleImport = async () => {
    if (!file.value) {
        ElMessage.error('Silakan pilih file CSV terlebih dahulu.');
        return;
    }
    const importedData = file.value;

    try {
        // Kirim data ke server menggunakan importService
        await store.importData(importedData);
        handleCloseImportDialog();
    } catch (error) {
        console.log((error as any).message);

    }
};

const fetchDataWithCurrentParams = () => {
    if (isInitialFetchDone.value && loading.value) {
        return; // Cegah pemanggilan ganda jika sedang loading
    }

    store.fetchData(currentPage.value, currentPerPage.value, searchQuery.value, '', String(route.params.submission_id), statusFilter.value);
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
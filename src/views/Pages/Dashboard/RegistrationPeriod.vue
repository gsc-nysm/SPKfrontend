<template>
    <el-card shadow="never" style="border:none">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">
                <h1 class="text-xl font-semibold">Kelola Periode Pendaftaran</h1>        
            </div>
            <el-button type="primary" class="w-full lg:w-fit md:w-fit" @click="openCrudModal('create', null)" :icon="Plus">Tambah</el-button>            
        </div>
        <div class="my-4 flex lg:flex-row md:flex-row gap-4 justify-between items-center">
            <div class="lg:w-1/4">
                <el-button
                    type="danger"                    
                    @click="openCrudModal('multi-delete', null)"  
                    :icon="Delete"
                    :disabled="selectedRows.length === 0"
                >
                    Hapus Pilihan ({{ selectedRows.length }})
                </el-button>
            </div>
            <div class="flex lg:flex-row md:flex-row items-center justify-end gap-5 w-1/2">                
                <el-input placeholder="Cari Kriteria ..." v-model="searchQuery" prefix-icon="el-icon-search" class="lg:w-1/2 md:w-1/2 w-full" clearable />
            </div>
        </div>

        <div>
            <Datatable 
                :selection="true"
                :items="registration_period"
                :pagination="pagination"
                :loading="loading"                
                :customColumns="customColumns"
                @page-change="handlePageChange"    
                @per-page-change="handlePerPageChange"
                @selection-change="onSelectionChange"        
            >                
                <template #status="{ row }">
                    <el-tag :type="row.status == 'aktif' ? 'success' : 'danger'">{{row.status}}</el-tag>
                </template>                
                <template #actions="{ row }">                    
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="Edit"
                        placement="top-start"
                    >
                        <el-button plain type="warning" size="small" @click="openCrudModal('update', row)" :icon="Edit"></el-button>
                    </el-tooltip>
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="Lihat"
                        placement="top-start"
                    >
                        <el-button plain type="info" size="small" @click="openCrudModal('show', row)" :icon="View"></el-button>
                    </el-tooltip>
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="Hapus"
                        placement="top-start"
                    >
                        <el-button plain type="danger" size="small" @click="openCrudModal('delete', row)" :icon="Delete" ></el-button>
                    </el-tooltip>
                </template>
            </Datatable>
            <crud-modal
                v-model:visible="crudModalVisible"
                :mode="crudModalMode"
                :data="crudModalData"
                :selected-ids="selectedRows.length > 0 ? selectedRows.map(row => row.id) : []"
                :form-fields="formFields"
                name="Periode Pendaftaran"
                :create-service="store.createData"
                :update-service="store.updateData"
                :delete-service="store.deleteData"
                :delete-multiple-service="store.deleteMultipleData"
                :show-service="store.showData"
                @save="handleSave"
                @multi-delete="handleMultiDelete"
                @delete="handleDelete"
                @close="crudModalVisible = false"
            />
        </div>
    </el-card>
</template>

<script setup lang="ts">
import Datatable from '@/components/Dashboard/Datatable.vue';
import { Plus, Delete, Edit, View } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits } from 'vue'
import type { IncomingApiData } from '@/models/RegistrationPeriod'
import { debounce } from 'lodash-es'
import CrudModal from '@/components/Dashboard/CrudModal.vue'
import { useRegistrationPeriodStore } from '@/stores/registration_period';
import { useRoute } from 'vue-router';

const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const store = useRegistrationPeriodStore() // Gunakan store
const emit = defineEmits(['save', 'delete'])
const registration_period = computed(() => store.registration_period)
const pagination = computed(() => store.pagination)
const loading = computed(() => store.loading)
const currentPage = ref(1);
const currentPerPage = ref(10);
const route = useRoute();
const currentSearchQuery = ref('')
const isInitialFetchDone = ref(false);

// Definisikan formFields secara dinamis berdasarkan kebutuhan
const formFields = computed(() => [
    { prop: 'nama_periode', label: 'Nama Periode', type: 'text' as const, required: true },
    { prop: 'tanggal_mulai', label: 'Tanggal Mulai', type: 'date' as const, required: true },
    { prop: 'tanggal_selesai', label: 'Tanggal Selesai', type: 'date' as const, required: true },
    { prop: 'tahun', label: 'Tahun', type: 'year' as const, required: true },    
])

const customColumns = ref([
    { prop: "nama_periode", label: "Nama Periode", width: 200 },
    { prop: "tanggal_mulai", label: "Tanggal Mulai", width: 'auto'  },
    { prop: "tanggal_selesai", label: "Tanggal Selesai", width: 'auto' },
    { prop: "status", label: "Status", width: 120 },
]);

const openCrudModal = (mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete', data: Partial<IncomingApiData> | null) => {
    crudModalMode.value = mode
    crudModalData.value = data
    crudModalVisible.value = true
}
const fetchDataWithCurrentParams = () => {
    if (isInitialFetchDone.value && loading.value) {
        return; // Cegah pemanggilan ganda jika sedang loading
    }
    store.fetchData(currentPage.value, currentPerPage.value, searchQuery.value);
};

// Debounce untuk filter
const debouncedFetch = debounce(() => {
    if (!isInitialFetchDone.value) {
        return; // Jangan panggil fetchData jika initial fetch belum selesai
    }
    currentPage.value = 1; // Reset ke halaman 1 saat filter berubah
    fetchDataWithCurrentParams();
}, 500);

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

// Sinkronkan filter dengan state lokal
watch(searchQuery, (newValue) => {
    currentSearchQuery.value = newValue;
    debouncedFetch();
});

// Watch untuk route.params.id agar data di-refresh saat rute berubah
watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            isInitialFetchDone.value = false; // Reset flag saat rute berubah
            currentPage.value = 1; // Reset ke halaman 1 saat rute berubah
            currentSearchQuery.value = searchQuery.value;
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
        }
    }
);
</script>

<style lang="scss" scoped>

</style>
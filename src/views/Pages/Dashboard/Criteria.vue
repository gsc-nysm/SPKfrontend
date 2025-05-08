<template>
    <el-card shadow="never" style="border:none">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">
                <h1 class="text-xl font-semibold">Kelola Kriteria Bantuan</h1>        
            </div>
            <div>
                <el-button type="primary" plain class="mr-4 md:mb-0 sm:mb-2 mb-2 w-full lg:w-fit md:w-fit" @click="openWeightingModal()" :icon="Operation">Kelola Pembobotan</el-button>            
                <el-button type="primary" class="w-full lg:w-fit md:w-fit" @click="openCrudModal('create', null)" :icon="Plus">Tambah</el-button>            
            </div>
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
                :items="criterias"
                :pagination="pagination"
                :loading="loading"                
                :customColumns="customColumns"
                @per-page-change="handlePerPageChange"
                @page-change="handlePageChange"    
                @selection-change="onSelectionChange"        
            >                
                <template #perlu_bukti_pendukung="{ row }">
                    <el-tag :type="row.perlu_bukti_pendukung == true ? 'success' : 'danger'">{{row.perlu_bukti_pendukung ? 'Ya' : 'Tidak'}}</el-tag>
                </template>                
                <template #bobot="{ row }">
                    <template v-if="row.bobot">
                        <span>{{ row.bobot.toFixed(3) }} ({{ (row.bobot * 100).toFixed(1) }}%)</span>
                    </template>
                </template>                
                <template #actions="{ row }">                    
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="Atur Sub Kriteria"
                        placement="top-start"
                    >
                        <el-button plain type="primary" size="small" @click="openSubCriteria(row)" :icon="List"></el-button>
                    </el-tooltip>
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
                name="Kriteria Bantuan"
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
            <Weighting 
                v-model:visible="dialogWeightingVisible"
                :data="criterias"
                :create-service="pairWise.createData"
                :delete-service="pairWise.deleteByBantuan"
                :update-service="store.updateBobot"
                tipe="kriteria"
            />
        </div>
    </el-card>
</template>

<script setup lang="ts">
import Datatable from '@/components/Dashboard/Datatable.vue';
import { Plus, Delete, Edit, View, List, Operation } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits } from 'vue'
import type { IncomingApiData } from '@/models/Criteria'
import { debounce } from 'lodash-es'
import CrudModal from '@/components/Dashboard/CrudModal.vue'
import { useCriteriaStore } from '@/stores/criteria';
import { usePairWiseStore } from '@/stores/pair_wise_comparison';
import Weighting from '@/components/Dashboard/Weighting.vue';
import { useRoute, useRouter } from 'vue-router';

const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const store = useCriteriaStore() // Gunakan store
const pairWise = usePairWiseStore()
const emit = defineEmits(['save', 'delete'])
const criterias = computed(() => store.criterias)
const pagination = computed(() => store.pagination)
const loading = computed(() => store.loading)
const dialogWeightingVisible = ref(false)
// State untuk melacak page dan per_page
const currentPage = ref(1);
const currentPerPage = ref(10);
const route = useRoute();
const router = useRouter();
const currentSearchQuery = ref('')
const isInitialFetchDone = ref(false);

// Definisikan formFields secara dinamis berdasarkan kebutuhan
const formFields = computed(() => [
    { prop: 'kode_kriteria', label: 'Kode Kriteria', type: 'text' as const, required: true },
    { prop: 'nama_kriteria', label: 'Nama Kriteria', type: 'text' as const, required: true },
    { prop: 'tipe', label: 'Tipe Kriteria', type: 'radio' as const, required: true, options: tipeOptions },
    { prop: 'deskripsi', label: 'Deskripsi Kriteria', type: 'textarea' as const, required: false },
    { prop: 'perlu_bukti_pendukung', label: 'Perlu Bukti Pendukung?', type: 'boolean' as const, required: true },
])

const customColumns = ref([
    { prop: "kode_kriteria", label: "Kode Kriteria", width: 100 },
    { prop: "nama_kriteria", label: "Nama Kriteria", width: 200 },
    { prop: "tipe", label: "Tipe", width: 100 },
    { prop: "perlu_bukti_pendukung", label: "Bukti Pendukung", width: 'auto'  },
    { prop: "bobot", label: "Bobot", width: 'auto' },
]);

const tipeOptions = [
    { label: 'Benefit', value: 'benefit' },
    { label: 'Cost', value: 'cost' },
]

const openWeightingModal = () => {
    dialogWeightingVisible.value = !dialogWeightingVisible.value    
}

const openCrudModal = (mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete', data: Partial<IncomingApiData> | null) => {
    crudModalMode.value = mode
    crudModalData.value = data
    crudModalVisible.value = true
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

const openSubCriteria = (row:any) => {
    router.push({ name: 'sub-criteria', params: { id: router.currentRoute.value.params.id, criteria_id: row.id } })
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
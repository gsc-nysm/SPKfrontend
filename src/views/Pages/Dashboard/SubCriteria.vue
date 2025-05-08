<template>
    <el-card shadow="never" class="mb-4" style="border:none">
        <el-descriptions title="Data Kriteria" :column="2" border>
            <el-descriptions-item label="Nama Kriteria">{{criteria?.data.nama_kriteria}}</el-descriptions-item>
            <el-descriptions-item label="Kode">{{criteria?.data.kode_kriteria}}</el-descriptions-item>            
            <el-descriptions-item label="Bobot">{{criteria?.data.bobot}}</el-descriptions-item>
            <el-descriptions-item label="Bukti Pendukung">{{criteria?.data.perlu_bukti_pendukung ? 'Ya' : 'Tidak'}}</el-descriptions-item>            
        </el-descriptions>
    </el-card>
    <el-card shadow="never" style="border:none">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">
                <h1 class="text-xl font-semibold">Kelola Sub Kriteria Bantuan</h1>        
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
                <el-input placeholder="Cari Sub Kriteria ..." v-model="searchQuery" prefix-icon="el-icon-search" class="lg:w-1/2 md:w-1/2 w-full" clearable />
            </div>
        </div>

        <div>
            <Datatable 
                :selection="true"
                :items="sub_criterias"
                :pagination="pagination"
                :loading="loading"                
                :customColumns="customColumns"
                @page-change="handlePageChange"    
                @per-page-change="handlePerPageChange"
                @selection-change="onSelectionChange"        
            >                         
                <template #bobot="{ row }">
                    <template v-if="row.bobot">
                        <span>{{ row.bobot.toFixed(3) }} ({{ (row.bobot * 100).toFixed(1) }}%)</span>
                    </template>
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
                name="Sub Kriteria Bantuan"
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
                :data="sub_criterias"
                :create-service="pairWise.createData"
                :delete-service="pairWise.deleteByBantuan"
                :update-service="store.updateBobot"
                tipe="sub_kriteria"
            />
        </div>
    </el-card>
</template>

<script setup lang="ts">
import Datatable from '@/components/Dashboard/Datatable.vue';
import { Plus, Delete, Edit, View, Operation } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits, onMounted } from 'vue'
import type { IncomingApiData } from '@/models/SubCriteria'
import { debounce } from 'lodash-es'
import CrudModal from '@/components/Dashboard/CrudModal.vue'
import { useSubCriteriaStore } from '@/stores/sub_criteria';
import { usePairWiseStore } from '@/stores/pair_wise_comparison';
import Weighting from '@/components/Dashboard/Weighting.vue';
import { useRoute } from 'vue-router';
import { useCriteriaStore } from '@/stores/criteria';

const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const store = useSubCriteriaStore() // Gunakan store
const pairWise = usePairWiseStore()
const emit = defineEmits(['save', 'delete'])
const sub_criterias = computed(() => store.sub_criterias)
const pagination = computed(() => store.pagination)
const loading = computed(() => store.loading)
const dialogWeightingVisible = ref(false)
const currentPage = ref(1);
const currentPerPage = ref(10);
const route = useRoute();
const currentSearchQuery = ref('')
const isInitialFetchDone = ref(false);

const storeCriteria = useCriteriaStore();
const criteria = ref<any>(null);

// Definisikan formFields secara dinamis berdasarkan kebutuhan
const formFields = computed(() => [
    { prop: 'nama_sub_kriteria', label: 'Nama Sub Kriteria', type: 'text' as const, required: true },
    ])

const customColumns = ref([
    { prop: "nama_sub_kriteria", label: "Kode Kriteria", width: 'auto' },   
    { prop: "bobot", label: "Bobot", width: 200 },
]);

const openWeightingModal = () => {
    dialogWeightingVisible.value = !dialogWeightingVisible.value
    console.log(dialogWeightingVisible.value);
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

onMounted(async () => {
    try {
        // Ambil ID dari parameter rute
        const criteriaId = Number(route.params.criteria_id);
        if (criteriaId) {
            // Panggil showData dan simpan hasilnya ke state lokal
            criteria.value = await storeCriteria.showData(criteriaId);
            console.log('Agency data:', criteria.value.data); // Debug data
        } else {
            console.log('ID instansi tidak ditemukan');
            
        }

    } catch (error) {
        console.error('Error loading departments:', error);
    }
});
</script>

<style lang="scss" scoped>

</style>
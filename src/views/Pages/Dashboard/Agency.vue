<template>
    <!-- <Breadcrumb/> -->
    <el-card shadow="never" style="border:none">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">                
                <h1 class="text-xl font-semibold">Kelola Instansi</h1>        
            </div>
            <el-button type="primary" class="w-full lg:w-fit md:w-fit" @click="openCrudModal('create', null)" :icon="Plus">Tambah</el-button>            
        </div>
        <div class="my-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="lg:w-1/4 w-full">
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
                
                <el-select placeholder="Pilih Tingkatan" v-model="tingkatanFilter">
                    <el-option v-for="tingkatan in tingkatanOptions" :key="tingkatan.value" :label="tingkatan.label" :value="tingkatan.value" />                    
                </el-select>
                <el-select placeholder="Pilih Status" v-model="statusFilter">
                    <el-option v-for="status in statusOptions" :key="status.value" :label="status.label" :value="status.value" />                                        
                </el-select>
                <el-button :icon="Close" class="w-full lg:w-fit md:w-fit" type="danger" @click="resetFilters" v-if="tingkatanFilter || statusFilter"></el-button>
                <el-input placeholder="Cari Instansi ..." v-model="searchQuery" prefix-icon="el-icon-search" class="w-full" clearable />
            </div>
        </div>

        <div>
            <Datatable 
                :selection="true"
                :items="agencies"
                :pagination="pagination"
                :loading="loading"                
                :customColumns="customColumns"
                @page-change="handlePageChange"   
                @per-page-change="handlePerPageChange" 
                @selection-change="onSelectionChange"        
            >
                <template #nama_instansi="{ row }">
                    <div class="flex items-center">
                        <el-image
                            :src="url + row.logo"
                            style="width:30px;z-index: 9999;"
                            :preview-src-list="[url + row.logo]"
                        />                        
                        <span class="ml-2">{{row.nama_instansi}}</span>
                    </div>
                </template>
                <template #status="{ row }">
                    <el-tag :type="row.status == 'aktif' ? 'success' : 'danger'">{{row.status}}</el-tag>
                </template>  
                <template #tingkatan="{ row }">
                    <el-tag type="danger">{{row.tingkatan}}</el-tag>
                </template>
                <template #actions="{ row }">
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="Lihat Anggota"
                        placement="top-start"
                    >
                        <el-button plain type="primary" size="small" @click="openUserAgency(row)" :icon="User"></el-button>
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
                name="Instansi"
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
import { Plus, ArrowRight, Close, Delete, Edit, View, User, Search } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits } from 'vue'
import type { IncomingApiData } from '@/models/Agency'
import { debounce } from 'lodash-es'
import CrudModal from '@/components/Dashboard/CrudModal.vue'
import { useAgencyStore } from '@/stores/agency';

const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const statusFilter = ref<string>('')
const tingkatanFilter = ref<string>('')
const debouncedFetch = debounce(() => store.fetchData(1, 10, searchQuery.value, statusFilter.value, tingkatanFilter.value), 500)
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const store = useAgencyStore() // Gunakan store
const emit = defineEmits(['save', 'delete'])
const agencies = computed(() => store.agencies)
const pagination = computed(() => store.pagination)
const loading = computed(() => store.loading)
import {useRouter} from 'vue-router'
const router = useRouter();

const url = import.meta.env.VITE_API_BASE_URL + 'storage/'

// Definisikan formFields secara dinamis berdasarkan kebutuhan
const formFields = computed(() => [
    { prop: 'nama_instansi', label: 'Nama Instansi', type: 'text' as const, required: true },
    { prop: 'tingkatan', label: 'Tingkatan', type: 'select' as const, required: true, options: tingkatanOptions },
    { prop: 'kode_instansi', label: 'Kode Instansi (Desa)', type: 'text' as const, required: false },
    { prop: 'logo', label: 'Logo', type: 'file' as const, required: true, allowedFormats: ['jpg','jpeg','png'], // Hanya dokumen
    maxSize: 2, },
    { prop: 'alamat', label: 'Alamat', type: 'textarea' as const, required: true },
    { prop: 'status', label: 'Status', type: 'select' as const, required: true, options: statusOptions },
])

const tingkatanOptions = [
    { label: 'Provinsi', value: 'provinsi' },
    { label: 'Kabupaten', value: 'kabupaten' },
    { label: 'Kecamatan', value: 'kecamatan' },
    { label: 'Desa', value: 'desa' },
]

const statusOptions = [
    { label: 'Aktif', value: 'aktif' },
    { label: 'Non-Aktif', value: 'nonaktif' },
]

const customColumns = ref([
    { prop: "nama_instansi", label: "Nama Instansi", width: 'auto' },
    { prop: "kode_instansi", label: "Kode", width: 120  },
    { prop: "alamat", label: "Alamat", width: 150 },
    { prop: "tingkatan", label: "Tingkatan", width: 120 },
    { prop: "status", label: "Status", width: '120px' },
]);

const openCrudModal = (mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete', data: Partial<IncomingApiData> | null) => {
    crudModalMode.value = mode
    crudModalData.value = data
    crudModalVisible.value = true
}

const handleSave = (savedData: IncomingApiData) => {
    // emit('save', savedData)
    crudModalVisible.value = false
}

const openUserAgency = (data: any) => {
    console.log(data.id);
    
    router.push({ name: 'user-agency', params: { id: data.id } })
}

const handleMultiDelete = (ids: number[]) => {
    crudModalVisible.value = false
    selectedRows.value = [] // Reset baris yang dipilih setelah multi-delete
    store.fetchData(pagination.value?.current_page || 1); // Refresh data untuk memastikan konsistensi
}

const handleDelete = (id: number) => {
    crudModalVisible.value = false
}

const handlePageChange = (page: number) => {
    store.fetchData(page, pagination.value?.per_page || 10, searchQuery.value);    
};
const handlePerPageChange = (per_page: number) => {
    store.fetchData(1, per_page, searchQuery.value);        
};

const onSelectionChange = (selection: any[]) => {
    selectedRows.value = selection; // Perbarui baris yang dipilih    
};


const resetFilters = () => {
    searchQuery.value = ''
    statusFilter.value = ''
    tingkatanFilter.value = ''
}

watch([searchQuery, statusFilter, tingkatanFilter], debouncedFetch)
</script>

<style lang="scss" scoped>

</style>
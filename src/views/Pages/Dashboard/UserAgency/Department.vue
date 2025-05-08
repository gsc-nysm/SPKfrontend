<template>
    <div>        
        <el-card shadow="never" style="border:none">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-xl font-semibold">Kelola Bidang</h1>
                <el-button type="primary" class="  w-full lg:w-fit md:w-fit" @click="openCrudModal('create', null)" :icon="Plus">Tambah</el-button>            
            </div>
            <Datatable 
                :items="departments"
                :pagination="pagination"
                :loading="loading"
                :selection="false"                
                :customColumns="customColumns"
                @page-change="handlePageChange"    
                @per-page-change="handlePerPageChange"
                @selection-change="onSelectionChange"        
            >
                <template #nama_bidang="{ row }">
                    <div class="flex items-center">                                       
                        <span >{{row.nama_bidang}}</span>
                    </div>
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
                name="Bidang"
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
        </el-card>
    </div>
</template>

<script setup lang="ts">
import Datatable from '@/components/Dashboard/Datatable.vue';
import { Plus, ArrowRight, Close, Delete, Edit, View, User } from '@element-plus/icons-vue'
import { ref, watch, computed, defineEmits } from 'vue'
import type { IncomingApiData } from '@/models/Department'
import { debounce } from 'lodash-es'
import CrudModal from '@/components/Dashboard/CrudModal.vue'
import { useDepartmentStore } from '@/stores/department';

const selectedRows = ref<any[]>([]) // State untuk melacak baris yang dipilih
const searchQuery = ref<string>('')
const debouncedFetch = debounce(() => store.fetchData(1), 500)
const crudModalVisible = ref(false)
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create')
const crudModalData = ref<Partial<IncomingApiData> | null>(null)
const store = useDepartmentStore() // Gunakan store
const emit = defineEmits(['save', 'delete'])
const departments = computed(() => store.departments)
const pagination = computed(() => store.pagination)
const loading = computed(() => store.loading)


const url = import.meta.env.VITE_API_BASE_URL + 'storage/'

// Definisikan formFields secara dinamis berdasarkan kebutuhan
const formFields = computed(() => [
    { prop: 'nama_bidang', label: 'Nama Bidang', type: 'text' as const, required: true },    
])

const customColumns = ref([
    { prop: "nama_bidang", label: "Nama Bidang", width: 'auto' },    
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

watch([searchQuery], () => {
    debouncedFetch();
});
</script>

<style lang="scss" scoped>

</style>
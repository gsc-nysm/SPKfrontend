<template>
    <el-card shadow="never" class="mb-4" style="border:none">
        <el-descriptions title="Data Instansi" :column="2" border>
            <el-descriptions-item label="Nama Instansi">{{agencyData?.data.nama_instansi}}</el-descriptions-item>
            <el-descriptions-item label="Alamat">{{agencyData?.data.alamat}}</el-descriptions-item>
            <el-descriptions-item label="Tingkatan">{{agencyData?.data.tingkatan}}</el-descriptions-item>            
            <el-descriptions-item label="Status">{{agencyData?.data.status}}</el-descriptions-item>            
        </el-descriptions>
    </el-card>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 md:col-span-2 col-span-1">
            <el-card shadow="never" style="border:none">
                <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
                    <div class="w-full lg:w-1/2 md:w-1/2">                        
                        <h1 class="text-xl font-semibold">Kelola Anggota Instansi</h1>
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
                    
                    <el-select placeholder="Pilih Bidang" v-model="bidangFilter">
                        <el-option v-for="tingkatan in bidang_options" :key="tingkatan.value" :label="tingkatan.label" :value="tingkatan.value" />                    
                    </el-select>                    
                    <el-button :icon="Close" class="w-full lg:w-fit md:w-fit" type="danger" @click="resetFilters" v-if="bidangFilter"></el-button>
                    <el-input placeholder="Cari Instansi ..." v-model="searchQuery" prefix-icon="el-icon-search" class="w-full" clearable />
                </div>
            </div>
                <Datatable
                    :items="user_agencies"
                    :pagination="pagination"
                    :loading="loading"
                    :selection="true"
                    :customColumns="customColumns"
                    @page-change="handlePageChange"
                    @per-page-change="handlePerPageChange"
                    @selection-change="onSelectionChange"
                    >
                    
                    <template #bidang_instansi_id="{ row }">
                        <span>{{ row.bidang_instansi_id.nama_bidang }}</span>
                    </template>
                    <template #user_id.email="{ row }">
                        <span>{{ row.user_id.email }}</span>
                    </template>
                    
                    <template #actions="{ row }">
                        <el-tooltip class="box-item" effect="dark" content="Edit" placement="top-start">
                            <el-button plain type="warning" size="small" @click="openCrudModal('update', row)" :icon="Edit"></el-button>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" content="Lihat" placement="top-start">
                            <el-button plain type="info" size="small" @click="openCrudModal('show', mapToFormData(row, 'show'))" :icon="View"></el-button>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" content="Hapus" placement="top-start">
                            <el-button plain type="danger" size="small" @click="openCrudModal('delete', row)" :icon="Delete"></el-button>
                        </el-tooltip>
                    </template>
                </Datatable>
                <crud-modal
                    v-model:visible="crudModalVisible"
                    :mode="crudModalMode"
                    :data="crudModalData"
                    :selected-ids="selectedRows.length > 0 ? selectedRows.map(row => row.id) : []"
                    :form-fields="formFields"
                    name="Anggota Instansi"
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
        <div class="col">
            <Department />
        </div>
    </div>
</template>
<script setup lang="ts">
import Department from './Department.vue';
import Datatable from '@/components/Dashboard/Datatable.vue';
import { Plus, Close, Delete, Edit, View } from '@element-plus/icons-vue';
import { ref, watch, computed, onMounted } from 'vue';
import type { IncomingApiData, FormValue } from '@/models/UserAgency';
import { debounce } from 'lodash-es';
import CrudModal from '@/components/Dashboard/CrudModal.vue';
import { useUserAgencyStore } from '@/stores/user_agency';
import { useDepartmentStore } from '@/stores/department';
import UserAgency from '@/models/UserAgency';
import { useAgencyStore } from '@/stores/agency';
import { useRoute } from 'vue-router';

const selectedRows = ref<any[]>([]);
const searchQuery = ref<string>('');
const bidangFilter = ref<string>('');
const crudModalVisible = ref(false);
const crudModalMode = ref<'create' | 'update' | 'show' | 'delete' | 'multi-delete'>('create');
const crudModalData = ref<any>(null); // Data form yang dikirim ke CrudModal
const store = useUserAgencyStore();
const isInitialFetchDone = ref(false);
const currentPage = ref(1);
const currentPerPage = ref(10);
const currentSearchQuery = ref('')


const user_agencies = computed(() => store.user_agencies || []);
const pagination = computed(() => store.pagination);
const loading = computed(() => store.loading);

const route = useRoute();

const storeAgency = useAgencyStore()
const agencyData = ref<any>(null);

const storeDepartment = useDepartmentStore();
const departments = computed(() => storeDepartment.departments);

const bidang_options = computed(() => {
    return departments.value && Array.isArray(departments.value)
        ? departments.value.map(department => ({
            label: department.nama_bidang || 'Tidak Diketahui',
            value: department.id,
            }))
        : [];
    });

const formFields = computed(() => [
    { prop: 'nama_lengkap', label: 'Nama Lengkap', type: 'text' as const, required: true },
    { prop: 'bidang_instansi_id', label: 'Bidang Instansi', type: 'select' as const, required: true, options: bidang_options.value },
    { prop: 'no_hp', label: 'Nomor HP', type: 'text' as const, required: false },
    { prop: 'email', label: 'Email', type: 'text' as const, required: true },
]);

const customColumns = ref([
    { prop: 'nama_lengkap', label: 'Nama Lengkap', width: 'auto' },
    { prop: 'bidang_instansi_id', label: 'Bidang', width: 130 },
    { prop: 'no_hp', label: 'No HP', width: 100 },
    { prop: 'user_id.email', label: 'Email', width: 130 },
]);

const mapToFormData = (
    data: Partial<IncomingApiData> | null,
    mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete'
): any => {
    if (!data) return {};
    const plainData = JSON.parse(JSON.stringify(data));    
    let bidangInstansiIdValue: number | string | null = null;

    if (mode === 'show') {
        // Mode show: Ambil nama_bidang dari bidangOptions berdasarkan ID
        const bidangId = typeof plainData.bidang_instansi_id === 'object'
            ? plainData.bidang_instansi_id?.id
            : plainData.bidang_instansi_id;

        if (bidangId && bidang_options.value) {
            const option = bidang_options.value.find(opt => opt.value === bidangId);
            bidangInstansiIdValue = option ? option.label : '-'; // Gunakan nama_bidang atau fallback ke '-'            
        } else {
            bidangInstansiIdValue = plainData.bidang_instansi_id.nama_bidang || null;
        }
    }

    return {
        id: plainData.id,
        nama_lengkap: plainData.nama_lengkap || '',
        no_hp: plainData.no_hp || '',
        email: (plainData.user_id?.email ?? plainData.email) || '',
        bidang_instansi_id: mode === 'show' ? plainData.bidang_instansi_id.id  || bidangInstansiIdValue : plainData.bidang_instansi_id?.id || bidangInstansiIdValue,
    };
};

const openCrudModal = async (mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete', data: Partial<IncomingApiData> | null) => {
    if (mode === 'show' && data?.id) {
        try {            
            crudModalData.value = mapToFormData(data, mode);
            console.log('Form data:', crudModalData.value);
            
        } catch (error) {
            console.error('Error fetching show data:', error);
            crudModalData.value = mapToFormData(data, mode); // Fallback ke data asli
        }
    } else {
        console.log(data);
        
        crudModalData.value = mapToFormData(data, mode);
    }    
    crudModalMode.value = mode;
    crudModalData.value = mapToFormData(data, mode); // Peta ke FormValue dengan id
    crudModalVisible.value = true;
};

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

const handleSave = (savedData: any) => {
    const apiData = UserAgency.toApiData(savedData as FormValue);
    if (crudModalMode.value === 'create') {
        store.createData(apiData).then(() => {
            crudModalVisible.value = false;
        });
    } else if (crudModalMode.value === 'update' && savedData.id) {
        store.updateData(savedData.id, apiData).then(() => {
            crudModalVisible.value = false;
        });
    }
    fetchDataWithCurrentParams();
};

const handleMultiDelete = (ids: number[]) => {
    crudModalVisible.value = false;
    selectedRows.value = [];
    fetchDataWithCurrentParams();
};

const handleDelete = (id: number) => {
    crudModalVisible.value = false;
    fetchDataWithCurrentParams();
};


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
    selectedRows.value = selection;
};

const resetFilters = () => {
    searchQuery.value = '';
    bidangFilter.value = '';
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

onMounted(async () => {
    try {
        await storeDepartment.fetchData(1);
        // Ambil ID dari parameter rute
        const agencyId = Number(route.params.id);
        if (agencyId) {
            // Panggil showData dan simpan hasilnya ke state lokal
            agencyData.value = await storeAgency.showData(agencyId);
            console.log('Agency data:', agencyData.value.data); // Debug data
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
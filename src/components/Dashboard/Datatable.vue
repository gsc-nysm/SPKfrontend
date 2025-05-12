<template>
    <div class="data-table-container">
        <el-skeleton style="width: 240px" :loading="loading" animated>
            <template #template>

                <div style="padding: 14px">
                    <el-skeleton-item variant="h3" style="width: 50%" />
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-items: space-between;
                        margin-top: 16px;
                        height: 16px;
                        ">
                        <el-skeleton-item variant="text" style="margin-right: 16px" />
                        <el-skeleton-item variant="text" style="width: 30%" />
                    </div>
                </div>
            </template>
            <template #default>
                <el-table :data="items" v-loading="loading" table-layout="fixed"
                    @selection-change="handleSelectionChange">
                    <!-- Kolom Nomor Urut -->
                    <el-table-column v-if="selection" type="selection" width="55" />

                    <el-table-column label="#" width="35">
                        <template #default="scope">
                            {{ getRowNumber(scope.$index) }}
                        </template>
                    </el-table-column>

                    <!-- Kolom Custom dari `customColumns` -->
                    <el-table-column v-for="column in customColumns" :key="column.prop" :prop="column.prop"
                        :label="column.label" :width="column.width">
                        <template #default="scope">
                            <slot :name="column.prop" v-bind="scope">
                                {{ scope.row[column.prop] || '-' }} <!-- Tampilkan nilai default jika tidak ada slot -->
                            </slot>
                        </template>
                    </el-table-column>

                    <!-- Slot untuk Aksi -->
                    <el-table-column label="Aksi" width="auto">
                        <template #default="scope">
                            <div class="flex lg:flex-row flex-col items-center justify-around">
                                <slot name="actions" :row="scope.row" />
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- Pagination dan Filter Per Page -->
                <div v-if="pagination" class="mt-4 flex justify-end items-center gap-4">

                    <!-- Pagination -->
                    <el-pagination :current-page="pagination.current_page" :page-size="perPage"
                        :total="pagination.total" layout="prev, pager, next"
                        @current-change="$emit('page-change', $event)" />

                    <!-- Dropdown untuk memilih per_page -->
                    <div class="flex items-center gap-2">
                        <!-- <span class="text-sm">Tampilkan</span> -->
                        <el-select v-model="perPage" placeholder="Pilih jumlah per halaman" class="w-32"
                            @change="handlePerPageChange">
                            <el-option v-for="option in perPageOptions" :key="option.value" :label="option.label"
                                :value="option.value" />
                        </el-select>
                        <!-- <span class="text-sm">data per halaman</span> -->
                    </div>
                </div>
            </template>
        </el-skeleton>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

const props = defineProps<{
    items: Array<any>;
    pagination?: any | null;
    loading: boolean;
    selection?: boolean;
    customColumns?: Array<{ prop: string; label: string; width?: number | string }>;
}>();

const emit = defineEmits(['page-change', 'selection-change', 'per-page-change']);
const selectedRows = ref<any[]>([]);
const selection = ref(props.selection ?? true);
// State untuk per_page
const perPageOptions = [
    {
        value: 10,
        label: '10 / halaman',
    },
    {
        value: 1,
        label: '25 / halaman',
    },
    {
        value: 50,
        label: '50 / halaman',
    },
    {
        value: 100,
        label: '100 / halaman',
    }
]; // Opsi untuk per_page
const perPage = ref(props.pagination?.per_page || 10); // Default ke pagination.per_page atau 10

const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection; // Simpan baris yang dipilih
    emit('selection-change', selection); // Emit ke komponen induk
};

// Kolom Utama
const columns = computed(() => {
    if (!props.items.length) return [];
    const sampleAgency = props.items[0];
    return Object.keys(sampleAgency)
        .filter(prop => prop !== 'id') // Menghapus 'id' dari daftar kolom
        .map((prop) => {
            if (prop === 'created_at') {
                return { prop, label: 'Tanggal Dibuat', sortable: true, filterable: false };
            }
            return {
                prop,
                label: prop.charAt(0).toUpperCase() + prop.slice(1).replace(/_/g, ' '),
                sortable: true,
                filterable: true,
                width: undefined, // Add width property
            };
        });
});

// Filter kolom utama agar tidak menampilkan yang sudah ada di `customColumns`
const filteredColumns = computed(() => {
    const customProps = new Set((props.customColumns || []).map(col => col.prop));
    return (columns.value || []).filter(col => !customProps.has(col.prop));
});

// Nomor Urut
const getRowNumber = (index: number) => {
    if (!props.pagination) return index + 1;
    return (props.pagination?.current_page - 1) * props.pagination?.per_page + index + 1;
};

// Handle perubahan per_page
const handlePerPageChange = (newPerPage: number) => {
    perPage.value = newPerPage;
    emit('per-page-change', newPerPage); // Emit ke komponen induk
    // Reset ke halaman pertama saat per_page berubah
    if (props.pagination?.current_page !== 1) {
        emit('page-change', 1);
    }
};

// Sinkronkan perPage dengan props.pagination.per_page
watch(
    () => props.pagination?.per_page,
    (newPerPage) => {
        if (newPerPage && newPerPage !== perPage.value) {
            perPage.value = newPerPage;
        }
    }
);

// Watcher untuk reset halaman jika data kosong
watch(() => props.items, (newAgencies) => {
    if (!newAgencies.length && props.pagination?.current_page !== 1) {
        emit('page-change', 1); // Reset ke halaman pertama jika data kosong
    }

}, { immediate: true });
</script>

<style scoped>
.data-table-container {
    width: 100%;
}
</style>
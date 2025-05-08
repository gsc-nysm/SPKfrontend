<template>
    <el-dialog :title="title" v-model="visible" width="500" :before-close="handleClose">
        <el-table :data="data" style="width: 100%" size="small">
            <el-table-column prop="nama_lengkap" label="Nama" width="150" />
            <el-table-column prop="nik" label="NIK" width="150" />
            <el-table-column prop="jenis_kelamin" label="Jenis Kelamin" />
            <el-table-column prop="hasil_akhir.nilai_preferensi" label="Nilai" />
        </el-table>
        <div class="flex justify-end gap-2 mt-8">
            <el-button @click="handleClose">Batal</el-button>
            <el-button type="primary" @click="submitVerification">Simpan</el-button>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { useBeneficiaryStore } from '@/stores/beneficiary';

const props = defineProps<{
    visible: boolean;
    data?: any; // Data untuk verifikasi perorangan (opsional)
    selectedIds?: number[]; // Array ID untuk verifikasi perkelompok (opsional)
}>();

const visible = ref(props.visible);


const emit = defineEmits(['update:visible', 'success']);
watch(() => props.visible, (newVal) => visible.value = newVal);


const store = useBeneficiaryStore();

const title = computed(() => {
    return props.selectedIds && props.selectedIds.length > 0
        ? `Verifikasi Penerima (${props.selectedIds.length} terpilih)`
        : 'Verifikasi Penerima';
});

const handleClose = () => {
    emit('update:visible', false);
};

const submitVerification = async () => {
    try {
        if (props.selectedIds && props.selectedIds.length > 0) {
            // Verifikasi perkelompok
            const payload = props.selectedIds.map(id => ({ calon_penerima_id: id }));
            await store.multiCreateData(payload);
        } else if (props.data) {
            // Verifikasi perorangan
            const payload = { calon_penerima_id: props.data[0].id };

            await store.createData(payload);
        }

        emit('success');
        handleClose();
    } catch (error) {
        console.error('Error during verification:', error);
    }
};

</script>
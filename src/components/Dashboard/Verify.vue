<template>
    <el-dialog :title="'Verifikasi Calon Penerima Bantuan'" v-model="visible" width="800" :close-on-click-modal="false"
        :before-close="handleClose">
        <div class="text-center">
            <el-table :data="props.data" style="width: 100%">
                <el-table-column prop="calon_penerima_id.nama_lengkap" label="Nama Lengkap" width="150" />
                <el-table-column prop="sub_kriteria_bantuan_id.kriteria_bantuan_id.nama_kriteria" label="Nama Kriteria"
                    width="230" />
                <el-table-column prop="sub_kriteria_bantuan_id.nama_sub_kriteria" label="Pilihan" width="180" />
                <!-- <el-table-column prop="nilai" label="Nilai Awal" width="60">
                    <template #default="scope">
                        <span>{{ scope.row.hasil_akhir ??
                            (scope.row.sub_kriteria_bantuan_id.kriteria_bantuan_id.bobot *
                                scope.row.sub_kriteria_bantuan_id.bobot).toFixed(2) }}</span>
                    </template>
</el-table-column> -->
                <el-table-column prop="bukti_pendukung" label="Bukti Pendukung" width="auto">
                    <template #default="scope">
                        <template v-if="scope.row.sub_kriteria_bantuan_id.kriteria_bantuan_id.perlu_bukti_pendukung">
                            <template v-if="scope.row.bukti_pendukung">
                                <a :href="url + scope.row.bukti_pendukung" target="_blank">
                                    <el-button type="primary" :icon="View">Lihat</el-button>
                                </a>
                            </template>
                            <template v-else>
                                <el-button type="danger" disabled :icon="Close">Tidak diupload</el-button>
                            </template>
                        </template>
                        <template v-else>
                            Tidak perlu bukti pendukung
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <template #footer>
            <div class="flex justify-center" v-if="props.updateService">
                <el-button class="mr-4" @click="handleRevision" :icon="Refresh">Revisi Kembali</el-button>
                <el-button type="primary" @click="submitEvaluation" :icon="Check">Data Sudah Benar</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { Check, Close, Refresh, View } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps<{
    visible: boolean,
    data: any | null,
    updateService?: (id: number, data: any) => Promise<any>
}>();

const emit = defineEmits(['update:visible', 'verified']);

const visible = ref(props.visible);
const url = import.meta.env.VITE_API_BASE_URL + 'storage/';

watch(() => props.visible, (newVal) => visible.value = newVal);
watch(() => props.data, (newVal) => console.log('data changed:', newVal));

const handleClose = (done: () => void) => {
    visible.value = false;
    emit('update:visible', false);

    done();
};

const handleRevision = () => {
    ElMessageBox.confirm(
        'Apakah Anda yakin ingin mengubah status menjadi revisi?',
        'Konfirmasi',
        {
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal',
            type: 'warning',
        }
    )
        .then(async () => {
            try {
                await props.updateService?.(props.data[0].calon_penerima_id.id, {
                    tipe: 'revisi',
                });

                visible.value = false;
                emit('update:visible', false);
                emit('verified');
            } catch (error) {
                console.error('Error saat menyimpan penilaian:', error);
                // Tampilkan pesan kesalahan
            }
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: 'Aksi dibatalkan',
            })
        })
};
const submitEvaluation = async () => {
    ElMessageBox.confirm(
        'Apakah Anda yakin telah memverifikasi data ini?',
        'Konfirmasi',
        {
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal',
            type: 'warning',
        }
    )
        .then(async () => {
            try {
                await props.updateService?.(props.data[0].calon_penerima_id.id, {
                    tipe: 'diverifikasi',
                });

                visible.value = false;
                emit('update:visible', false);
                emit('verified');
            } catch (error) {
                console.error('Error saat menyimpan penilaian:', error);
                // Tampilkan pesan kesalahan
            }

        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: 'Aksi dibatalkan',
            })
        })

};
</script>

<style lang="scss" scoped></style>
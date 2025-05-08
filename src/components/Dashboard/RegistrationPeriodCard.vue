<!-- components/RegistrationPeriodCard.vue -->
<template>
    <el-card shadow="hover" class="registration-card" style="border:none">
        <div class="flex flex-col md:flex-row gap-4 items-center">
            <!-- Logo Instansi -->
            <div class="flex-shrink-0">
                <img
                    :src="url + periode.bantuan_sosial_id.instansi.logo"
                    alt="Logo Instansi"
                    class="w-16 h-16 object-contain rounded-full border border-gray-200"                    
                />
            </div>

            <!-- Informasi Utama -->
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">
                            {{ periode.bantuan_sosial_id.nama_bantuan_sosial }}
                        </h3>
                        <p class="text-sm text-gray-600">
                            {{ periode.bantuan_sosial_id.instansi.nama_instansi }}
                        </p>                        
                    </div>
                    <el-tag
                        :type="periode.status === 'aktif' ? 'success' : 'danger'"
                        size="small"
                        class="mt-1"
                    >
                        {{ periode.status }}
                    </el-tag>
                </div>

                <!-- Tanggal -->
                <div class="mt-2 flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-600">
                    <div>
                        <span>Dibuka </span>
                        <span class="font-semibold">{{ formatDate(periode.tanggal_mulai) }}</span> 
                        - 
                        <span class="font-semibold">{{ formatDate(periode.tanggal_selesai) }}</span>
                    </div>                    
                </div>
            </div>
        </div>

        <!-- Tombol Aksi -->
        <div class="mt-4 flex justify-center items-center">
            <el-button
                plain
                type="primary"
                class="w-full"                
                @click="handleRegister"
            >
                Informasi Bantuan
            </el-button>
            <el-button
                type="primary"
                class="w-full"
                :disabled="periode.status !== 'aktif'"
                @click="handleRegister"
            >
                Daftar Pengajuan
            </el-button>
        </div>
    </el-card>
    <el-dialog
        v-model="confirmRegistrationVisible"
        :title="`Konfirmasi Pengajuan ${periode.bantuan_sosial_id.nama_bantuan_sosial}`"
        width="400"
        append-to-body
    >
        <p>Apakah anda yakin untuk mendaftar pada bantuan sosial {{periode.bantuan_sosial_id.nama_bantuan_sosial}} ?</p>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="mr-2" @click="confirmRegistrationVisible = false">Batal</el-button>
                <el-button type="primary" @click="confirmRegistration" :loading="loading">
                    Daftar
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { ElMessage } from 'element-plus';
import RegistrationPeriod from '@/models/RegistrationPeriod'; // Pastikan path sesuai

const url = import.meta.env.VITE_API_BASE_URL + 'storage/'
const confirmRegistrationVisible = ref(false);
// Props untuk menerima data periode
const props = defineProps<{
    periode: RegistrationPeriod;
    createService?: (data: any) => Promise<any>
}>();
const loading = ref(false)

// Format tanggal untuk tampilan
const formatDate = (date: string): string => {
    try {
        const parsedDate = new Date(date);
        return parsedDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    } catch (error) {
        return date; // Kembalikan aslinya jika gagal parsing
    }
};

// Fungsi untuk menangani pendaftaran pengajuan
const handleRegister = () => {
    confirmRegistrationVisible.value = true;
};

const confirmRegistration = () => {
    loading.value = true
    if(props.createService) {
        props.createService({
            periode_pendaftaran_id: props.periode.id
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            loading.value = false
        })            
    }
    confirmRegistrationVisible.value = false;
    loading.value = false
};
</script>

<style  scoped>
.registration-card {
    margin-bottom: 16px;
    border-radius: 8px;
    transition: all 0.3s ease;
}
</style>
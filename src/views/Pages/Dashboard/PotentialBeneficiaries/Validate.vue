<template>
    <el-card shadow="never" class="mb-4" style="border:none">
        <el-descriptions title="Data Pengajuan" :column="2" border>
            <el-descriptions-item label="Nama Lengkap">{{potential_beneficiaries?.data.nama_lengkap}}</el-descriptions-item>
            <el-descriptions-item label="NIK">{{potential_beneficiaries?.data.nik}}</el-descriptions-item>            
            <el-descriptions-item label="Alamat">{{potential_beneficiaries?.data.alamat}}</el-descriptions-item>
            <el-descriptions-item label="Desil">{{potential_beneficiaries?.data.desil }}</el-descriptions-item>            
            <el-descriptions-item label="Jenis Kelamin">{{potential_beneficiaries?.data.jenis_kelamin }}</el-descriptions-item>            
            <el-descriptions-item label="Bantuan diterima">{{potential_beneficiaries?.data.bantuan_diterima }}</el-descriptions-item>            
        </el-descriptions>
    </el-card>
    <el-card shadow="never" style="border:none">
        <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
            <div class="w-full lg:w-1/2 md:w-1/2">                
                <h1 class="text-xl font-semibold">Verifikasi Calon Penerima Bantuan</h1>        
            </div>
        </div>
        <el-card shadow="never" class="mb-4 bg-gray-50" v-for="(criterion, index) in criterias" :key="index">
            <div class="flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center" >
                <div class="w-full lg:w-1/2 md:w-1/2">                
                    <h1 class="text-xl font-semibold">{{criterion.nama_kriteria}}</h1>        
                </div>
            </div>
            <el-radio-group v-model="answer[index]" class="my-4">
                <el-radio v-for="option in criterion.sub_kriteria_bantuan" :key="option.id" :label="option.id" :value="option.id" size="large" border>{{option.nama_sub_kriteria}}</el-radio>                
            </el-radio-group>
            <div class="w-full lg:w-1/3 md:w-1/2" v-if="criterion.perlu_bukti_pendukung">
                <label for="" class="my-4 font-semibold block">Upload Bukti Pendukung</label>
                <el-upload
                    class="upload-demo"
                    drag
                    :auto-upload="false"
                    :on-change="(file:any) => handleFileChange(file, index)"
                    :on-remove="(file:any) => handleFileRemove(index)"
                    accept=".pdf"
                    :limit="1"
                >
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                        <div class="el-upload__text">
                            Drop file here or <em>click to upload</em>
                        </div>
                        <template #tip>
                            <div class="el-upload__tip">
                                PDF files only, with a size less than 5MB
                            </div>
                        </template>
                </el-upload>
            </div>
        </el-card>

        <div class="flex lg:flex-row md:flex-row gap-4 flex-col justify-end items-center">
            <el-button type="primary" @click="openSubmitDialog()" :icon="Check">Simpan</el-button>                    
        </div>
    </el-card>
    <el-dialog
        v-model="dialogVisible"
        title="Konfirmasi Penilaian"
        width="30%"
        :close-on-click-modal="false"
        :before-close="closeSubmitDialog"
    >
        <span class="text-center">Apakah anda yakin ingin menyimpan penilaian ini?</span>
        <template #footer>
            <el-button class="mr-4" @click="closeSubmitDialog">Batal</el-button>
            <el-button type="primary" @click="submitEvaluation">Ya, Simpan</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { usePotentialBeneficiaryStore } from '@/stores/potential_beneficiary';
import { useCriteriaStore } from '@/stores/criteria';
import { useEvaluationStore } from '@/stores/evaluation';
import { computed, onMounted } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { Check } from '@element-plus/icons-vue';
import { ElMessage, ElNotification } from 'element-plus';

const potentialBeneficiaryStore = usePotentialBeneficiaryStore();
const criteriaStore = useCriteriaStore();
const evaluationStore = useEvaluationStore();
const router = useRouter();
const criterias = computed(() => criteriaStore.criterias);
const potential_beneficiaries = ref<any>(null);
const route = useRoute();
const answer = ref<any[]>([]);
const dialogVisible = ref(false);
const files = ref<any[]>([]); // Menyimpan file bukti pendukung untuk setiap kriteria

const handleFileChange = (file: any, index: number) => {
    files.value[index] = file.raw; // Simpan file mentah (raw) untuk dikirim
};

const handleFileRemove = (index: number) => {
    files.value[index] = null; // Hapus file jika di-remove
};

const openSubmitDialog = () => {
    const allAnswered = answer.value.every((ans, idx) => ans !== undefined && ans !== null);
    
    if (!allAnswered) {
        ElMessage.error('Harap isi semua kriteria sebelum menyimpan.');
        return;
    }
    dialogVisible.value = true;
    dialogVisible.value = true;
};
const closeSubmitDialog = () => {
    dialogVisible.value = false;
};

const submitEvaluation = async () => {
    try {
                
        // Siapkan payload dalam format array
        const payload = criterias.value.map((criterion: any, index: number) => {
            const data: any = {
                calon_penerima_id: Number(route.params.potential_beneficiary_id),
                sub_kriteria_bantuan_id: answer.value[index],
            };

            // Jika perlu bukti pendukung dan ada file yang diunggah, tambahkan ke data
            if (criterion.perlu_bukti_pendukung && files.value[index]) {
                data.bukti_pendukung = files.value[index];
            }

            return data;
        });
        
        // Kirim data melalui evaluationStore
        await evaluationStore.createData(payload);
        
        router.push({
            name: 'manage-potential-beneficiary',
            params: {
                id: route.params.id,
                submission_id: route.params.submission_id,
            },
        });

        // Reset form setelah sukses
        answer.value = [];
        files.value = [];
    } catch (error) {
        console.error('Error submitting evaluation:', error);
        ElNotification({
            title: 'Error',
            message: 'Gagal menyimpan penilaian. Silakan coba lagi.',
            type: 'error',
        });
    }
}

onMounted(async () => {
    try {
        // Ambil ID dari parameter rute
        const personId = Number(route.params.potential_beneficiary_id);
        if (personId) {
            // Panggil showData dan simpan hasilnya ke state lokal
            potential_beneficiaries.value = await potentialBeneficiaryStore.showData(personId);
        } else {
            console.log('ID instansi tidak ditemukan');
        }

        await criteriaStore.fetchData(1, 10, '', String(route.params.id));

    } catch (error) {
        console.error('Error loading departments:', error);
    }
});
</script>

<style lang="scss" scoped>

</style>
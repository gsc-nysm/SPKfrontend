<template>
    <el-dialog v-model="visible" :title="`Kelola Pembobotan ` + tipe" width="800"
        :top="step === 'table' ? '5vh' : '10vh'" :before-close="handleClose">
        <div v-if="step === 'table'">
            <!-- Tabel matriks perbandingan untuk tampilan saja -->
            <el-table :data="criteria" style="width: 100%" :stripe="true" :show-header="true"
                v-if="criteria.length && matrix.length">
                <el-table-column prop="nama_kriteria" label="Kriteria" width="150">
                    <template #default="scope">
                        {{ scope.row.nama_kriteria ?? scope.row.nama_sub_kriteria }}
                    </template>
                </el-table-column>
                <el-table-column v-for="(criterion, colIndex) in criteria" :key="colIndex"
                    :label="criterion.nama_kriteria ?? criterion.nama_sub_kriteria" :prop="`col${colIndex}`"
                    :width="'auto'">
                    <template #default="scope">
                        <span>{{ getDisplayValue(scope.row.index, colIndex) }}</span>
                    </template>
                </el-table-column>
            </el-table>
            <p v-else class="text-center text-gray-500">Tidak ada data kriteria untuk dibobot.</p>

            <!-- Tombol untuk memulai perbandingan ulang -->
            <div class="mt-4 text-center">
                <el-button type="primary" class="mr-2" @click="handleStartComparison"
                    :disabled="!(props.data && props.data.length)">
                    Mulai Perbandingan Ulang
                </el-button>
                <el-button plain class="mr-2" type="primary" @click="handleUpdateBobot"
                    v-if="weights.length && isComparisonComplete">
                    Perbarui Bobot {{ tipe }}
                </el-button>
                <el-button plain type="primary" @click="handlePrintDocument"
                    v-if="weights.length && isComparisonComplete">
                    Dokumen {{ tipe }}
                </el-button>
            </div>

            <!-- Tampilkan hasil bobot (opsional) -->
            <div v-if="weights.length && isComparisonComplete" class="mt-4">
                <h3 class="text-lg font-semibold">Hasil Bobot:</h3>
                <el-table :data="criteria" style="width: 100%">
                    <template v-if="tipe === 'kriteria'">
                        <el-table-column prop="nama_kriteria" label="Kriteria" />
                    </template>
                    <el-table-column v-else prop="nama_sub_kriteria" label="Sub Kriteria" />
                    <el-table-column label="Bobot">
                        <template #default="scope">
                            {{ weights[scope.$index].toFixed(3) }} ({{ (weights[scope.$index] * 100).toFixed(1) }}%)
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div v-if="consistencyIndex.ci !== null" class="mt-4">
                <h3 class="text-lg font-semibold">Konsistensi Index:</h3>
                <el-table :data="[consistencyIndex]" style="width: 100%">
                    <el-table-column prop="lambdaMax" label="Lambda Max" width="150" />
                    <el-table-column prop="ci" label="Consistency Index (CI)" />
                    <el-table-column prop="cr" label="Consistency Ratio (CR)" />
                    <el-table-column label="Status Konsistensi">
                        <template #default="scope">
                            <span
                                :class="{ 'text-green-500': scope.row.isConsistent, 'text-red-500': !scope.row.isConsistent }">
                                {{ scope.row.isConsistent ? 'Konsisten (CR < 0.1)' : 'Tidak Konsisten (CR ≥ 0.1)' }}
                                    </span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

        <div v-if="step === 'comparison'">
            <!-- Tampilan perbandingan berpasangan -->
            <div v-if="currentPair" class="text-center">
                <h3 class="text-lg">
                    Apakah <span class="font-semibold">{{ currentPair.criteria1 }}</span> lebih penting dari <span
                        class="font-semibold">{{ currentPair.criteria2 }}</span> ?
                </h3>
                <el-select v-model="currentScore" placeholder="Pilih Skor" class="mt-4" style="width: 500px"
                    @change="saveComparison">
                    <el-option v-for="score in ahpScale" :key="score.value"
                        :label="`${score.value.toFixed(2)} - ${score.label}`" :value="score.value" />
                </el-select>
                <div class="mt-4 flex justify-between">
                    <el-button @click="previousPair" :disabled="currentPairIndex === 0">
                        Sebelumnya
                    </el-button>
                    <el-button type="primary" @click="nextPair" v-if="currentPairIndex < pairs.length - 1">
                        Lanjut
                    </el-button>
                    <el-button type="primary" v-else @click="finishComparison" :disabled="loading">
                        {{ loading ? 'Menyimpan...' : 'Selesai' }}
                    </el-button>
                </div>
            </div>
            <p v-else class="text-center text-gray-500">Tidak ada pasangan untuk dibandingkan.</p>
        </div>
    </el-dialog>

    <el-dialog v-model="confirmResetVisible" title="Konfirmasi Reset" width="400" append-to-body>
        <p>Apakah Anda yakin ingin mereset semua data perbandingan? Data sebelumnya akan dihapus.</p>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="mr-2" @click="confirmResetVisible = false">Batal</el-button>
                <el-button type="danger" @click="confirmReset" :loading="loading">
                    Reset
                </el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="confirmUpdateVisible" :title="`Konfirmasi Perbarui Bobot ${tipe}`" width="400" append-to-body>
        <div class="flex justify-center items-center flex-col">
            <div class="flex justify-center">
                <el-upload ref="uploadRef" action="#" :auto-upload="false" :on-change="handleFileChange" :limit="1"
                    :on-exceed="handleFileExceed">
                    <template #trigger>
                        <el-button type="primary">Unggah Bukti Dokumen</el-button>
                    </template>
                    <template #tip>
                        <div class="el-upload__tip text-center">
                            File .pdf, .jpg, atau .png dengan ukuran maks 5MB. Wajib diisi. Dokumen ini adalah bukti
                            bahwa kriteria telah disetujui oleh atasan.
                        </div>
                    </template>
                </el-upload>
            </div>
            <p class="text-center mt-4">Apakah Anda yakin ingin memperbarui bobot {{ tipe }} ? Data sebelumnya akan
                dihapus.
            </p>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="mr-2" @click="confirmUpdateVisible = false">Batal</el-button>
                <el-button type="primary" @click="confirmUpdate" :loading="loading">
                    Perbarui
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { genFileId } from 'element-plus';
import { useLogWeightingStore } from '@/stores/log_weighting';
import { useAHP } from '@/composables/useAHP'
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'

const logWeightingStore = useLogWeightingStore();

const props = defineProps<{
    visible: boolean;
    data: any[] | null;
    tipe: string;
    createService?: (data: any) => Promise<any>
    deleteService?: () => Promise<any>
    updateService?: (data: any) => Promise<any>
}>();

const emit = defineEmits(['update:visible']);
const loading = ref(false)
const router = useRouter();

// State
const visible = ref(props.visible);
const step = ref<'table' | 'comparison'>('table');
const currentPairIndex = ref(0);
const currentScore = ref<number | null>(null);
const criteria = ref<any[]>([]);
const matrix = ref<any[][]>([]);
const { weights, consistencyIndex, calculateWeights } = useAHP(matrix);
// const ahpScale = [1, 1 / 3, 1 / 5, 1 / 7, 1 / 9, 3, 5, 7, 9];
const ahpScale = [
    {
        value: 1,
        label: 'Sama penting',
    },
    {
        value: 1 / 3,
        label: 'Sedikit Kurang Penting',
    },
    {
        value: 1 / 5,
        label: 'Lebih Kurang Penting',
    },
    {
        value: 1 / 7,
        label: 'Jauh Kurang Pentingg',
    },
    {
        value: 1 / 9,
        label: 'Mutlak Kurang Penting',
    },

    {
        value: 3,
        label: 'Sebanding penting',
    },
    {
        value: 5,
        label: 'Lebih penting',
    },
    {
        value: 7,
        label: 'Sangat lebih penting',
    },
    {
        value: 9,
        label: 'Sangat sangat lebih penting',
    }
]

// Daftar pasangan untuk perbandingan
const pairs = ref<{ criteria1: string; criteria2: string; index1: number; index2: number }[]>([]);
const currentPair = computed(() => pairs.value[currentPairIndex.value]);
const confirmResetVisible = ref(false); // State untuk dialog konfirmasi
const confirmUpdateVisible = ref(false); // State untuk dialog konfirmasi
const isComparisonComplete = ref(false); // State untuk cek kelengkapan data


// Cek apakah data perbandingan sudah lengkap
const checkComparisonCompleteness = () => {
    if (!props.data || props.data.length < 2) return false;

    const expectedPairs = (props.data.length * (props.data.length - 1)) / 2; // Jumlah pasangan unik
    const criteriaIds = props.data.map(item => item.id); // Ambil ID kriteria dari props.data
    let actualPairs = 0;
    const countedPairs = new Set(); // Gunakan Set untuk menghindari duplikat

    // Hitung pasangan yang relevan dengan kriteria di props.data
    for (const criterion of props.data) {
        const comparisons = criterion.pair_wise_comparison || [];
        for (const comparison of comparisons) {
            const pairKey = [comparison.kriteria_1_id, comparison.kriteria_2_id].sort().join('-');
            // Hanya hitung jika kedua kriteria ada di props.data dan belum dihitung
            if (
                criteriaIds.includes(comparison.kriteria_1_id) &&
                criteriaIds.includes(comparison.kriteria_2_id) &&
                !countedPairs.has(pairKey)
            ) {
                actualPairs++;
                countedPairs.add(pairKey);
            }
        }
    }

    console.log('Expected Pairs:', expectedPairs);
    console.log('Actual Pairs:', actualPairs);
    isComparisonComplete.value = actualPairs === expectedPairs;
};

// Sinkronkan visible dan inisialisasi data
watch(() => props.visible, (newVal) => {
    visible.value = newVal;
    if (newVal) {
        initializeMatrix();
        step.value = 'table';
        weights.value = [];
        checkComparisonCompleteness()
        calculateWeights();
    }
});

// Pantau perubahan props.data
watch(() => props.data, () => {
    initializeMatrix();
});

// Handler untuk tombol Mulai Perbandingan Ulang
const handleStartComparison = () => {
    if (isComparisonComplete.value) {
        confirmResetVisible.value = true; // Tampilkan dialog konfirmasi jika data lengkap
    } else {
        startComparison(); // Langsung mulai jika data belum lengkap
    }
};

const handlePrintDocument = () => {
    const doc = new jsPDF();
    const socialAssistanceName = props.data && props.data.length > 0
        ? props.data[0].bantuan_sosial_id?.nama_bantuan
        : ''; // Ambil dari props atau state
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Judul
    doc.setFontSize(16);
    doc.text('BERITA ACARA PERSETUJUAN PEMBOBOTAN', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Program Bantuan: ${socialAssistanceName}`, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

    // Tabel Hasil Bobot
    autoTable(doc, {
        startY: 40,
        head: [['Kriteria', 'Bobot']],
        body: criteria.value.map((criterion, index) => [
            criterion.nama_kriteria ?? criterion.nama_sub_kriteria,
            `${weights.value[index].toFixed(4)} (${(weights.value[index] * 100).toFixed(2)}%)`
        ]),
    });

    // TTD
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text(`Gorontalo, ${today}`, 150, finalY + 20);
    doc.text('Mengetahui,', 150, finalY + 30);
    doc.text('Pimpinan', 150, finalY + 37);
    doc.text('(_________________)', 150, finalY + 67);

    // Simpan PDF
    doc.save(`Persetujuan Bobot - ${socialAssistanceName}.pdf`);
};

const handleUpdateBobot = () => {
    confirmUpdateVisible.value = true
}

// Inisialisasi matriks perbandingan dengan nilai dari database
const initializeMatrix = () => {
    if (!props.data || !Array.isArray(props.data) || props.data.length === 0) {
        criteria.value = [];
        matrix.value = [];
        pairs.value = [];
        return;
    }

    criteria.value = props.data.map((item, index) => ({
        ...item,
        index,
    }));

    // Inisialisasi matriks berdasarkan panjang kriteria
    matrix.value = Array(props.data.length)
        .fill(0)
        .map(() => Array(props.data?.length).fill('-'));

    // Isi matriks dengan nilai dari pairwiseComparisons
    for (let i = 0; i < props.data.length; i++) {
        matrix.value[i][i] = 1; // Diagonal utama = 1
        const comparisons = props.data[i].pair_wise_comparison || [];

        for (let j = 0; j < props.data.length; j++) {
            if (i !== j) {
                // Cari perbandingan untuk pasangan kriteria i dan j
                const comparison = comparisons.find(
                    (pc: any) =>
                        (props.data && pc.kriteria_1_id === props.data[i].id && pc.kriteria_2_id === props.data[j].id) ||
                        (props.data && pc.kriteria_1_id === props.data[j].id && pc.kriteria_2_id === props.data[i].id)
                );
                if (comparison) {
                    if (comparison.kriteria_1_id === props.data[i].id) {
                        matrix.value[i][j] = comparison.nilai_perbandingan;
                        matrix.value[j][i] = 1 / comparison.nilai_perbandingan; // Pastikan simetri
                    } else {
                        matrix.value[i][j] = 1 / comparison.nilai_perbandingan;
                        matrix.value[j][i] = comparison.nilai_perbandingan;
                    }
                }
            }
        }
    }

    console.log(props.data);

    // Generate pasangan untuk perbandingan
    pairs.value = [];
    if (props.tipe === 'kriteria') {
        console.log(props.tipe);

        for (let i = 0; i < props.data.length; i++) {
            for (let j = i + 1; j < props.data.length; j++) {
                pairs.value.push({
                    criteria1: props.data[i].nama_kriteria,
                    criteria2: props.data[j].nama_kriteria,
                    index1: i,
                    index2: j,
                });
            }
        }
    } else {
        for (let i = 0; i < props.data.length; i++) {
            for (let j = i + 1; j < props.data.length; j++) {
                pairs.value.push({
                    criteria1: props.data[i].nama_sub_kriteria,
                    criteria2: props.data[j].nama_sub_kriteria,
                    index1: i,
                    index2: j,
                });
            }
        }

    }


};

// Tampilkan nilai di tabel
const getDisplayValue = (rowIndex: number, colIndex: number): string => {
    const value = matrix.value[rowIndex][colIndex];

    return value === '-' ? '-' : value.toFixed(2).toString();
};

// Mulai proses perbandingan ulang
const startComparison = () => {
    if (pairs.value.length === 0) {
        alert('Tidak ada pasangan kriteria untuk dibandingkan.');
        return;
    }
    step.value = 'comparison';
    currentPairIndex.value = 0;
    currentScore.value = matrix.value[pairs.value[0].index1][pairs.value[0].index2] || 1;
};

// Simpan skor perbandingan
const saveComparison = () => {
    if (currentPair.value && currentScore.value !== null) {
        matrix.value[currentPair.value.index1][currentPair.value.index2] = currentScore.value;
        matrix.value[currentPair.value.index2][currentPair.value.index1] = 1 / currentScore.value;
    }
};


const uploadRef = ref<UploadInstance>();
const fileToUpload = ref<UploadRawFile | null>(null);

// Fungsi ini akan terpanggil setiap kali pengguna memilih atau mengubah file
const handleFileChange: UploadProps['onChange'] = (uploadFile) => {
    fileToUpload.value = uploadFile.raw ?? null;
};

// Fungsi untuk menangani jika pengguna memilih lebih dari 1 file (mengganti file lama)
const handleFileExceed: UploadProps['onExceed'] = (files) => {
    uploadRef.value!.clearFiles();
    const file = files[0] as UploadRawFile;
    file.uid = genFileId();
    uploadRef.value!.handleStart(file);
};

// Konfirmasi update bobot
const confirmUpdate = async () => {
    if (!fileToUpload.value) {
        ElMessage.error('Silakan unggah dokumen bukti persetujuan terlebih dahulu.');
        return; // Hentikan proses jika file tidak ada
    }

    if (props.updateService) {
        loading.value = true;
        try {

            const logFormData = new FormData();
            logFormData.append('bantuan_sosial_id', router.currentRoute.value.params?.id as string);
            logFormData.append('bukti_dokumen', fileToUpload.value);
            console.log('File yang diunggah:', logFormData.get('bukti_dokumen'));

            // Buat objek yang memetakan kriteria_id ke bobot
            const updatedWeights: { [key: number]: number } = {};
            criteria.value.forEach((criterion, index) => {
                updatedWeights[criterion.id] = Number(weights.value[index].toFixed(3));
            });

            await logWeightingStore.createData(logFormData);

            // Panggil updateService dengan payload yang mencakup bantuan_id dan weights
            await props.updateService({
                weights: updatedWeights,
            });

            visible.value = false;
            confirmUpdateVisible.value = false;
            fileToUpload.value = null;
            uploadRef.value?.clearFiles();

        } catch (error) {
            console.error('Gagal mereset data:', error);
            ElMessage.error('Gagal mereset data perbandingan.');
        } finally {
            loading.value = false;
        }
    }
};

// Konfirmasi reset data
const confirmReset = async () => {
    if (props.deleteService) {
        loading.value = true;
        try {
            await props.deleteService();
            confirmResetVisible.value = false;

            // Reset matriks lokal
            matrix.value = Array(props.data?.length)
                .fill(0)
                .map(() => Array(props.data?.length).fill('-'));
            matrix.value.forEach((row, i) => {
                row[i] = 1; // Diagonal tetap 1
            });

            startComparison(); // Mulai perbandingan ulang
        } catch (error) {
            console.error('Gagal mereset data:', error);
        } finally {
            loading.value = false;
        }
    }
};

// Navigasi antar pasangan
const previousPair = () => {
    if (currentPairIndex.value > 0) {
        saveComparison();
        currentPairIndex.value--;
        currentScore.value =
            matrix.value[pairs.value[currentPairIndex.value].index1][
            pairs.value[currentPairIndex.value].index2
            ] || 1;
    }
};

const nextPair = () => {
    if (currentPairIndex.value < pairs.value.length - 1) {
        saveComparison();
        currentPairIndex.value++;
        currentScore.value =
            matrix.value[pairs.value[currentPairIndex.value].index1][
            pairs.value[currentPairIndex.value].index2
            ] || 1;
    }
};

// Selesai perbandingan dan hitung bobot
const finishComparison = async () => {
    saveComparison();
    calculateWeights();
    if (props.createService) {
        loading.value = true;
        try {
            const comparisonDataList = [];
            for (let i = 0; i < criteria.value.length; i++) {
                for (let j = i + 1; j < criteria.value.length; j++) {
                    const nilai = matrix.value[i][j];
                    if (nilai !== '-') {
                        comparisonDataList.push({
                            kriteria_1_id: criteria.value[i].id,
                            kriteria_2_id: criteria.value[j].id,
                            nilai_perbandingan: nilai,
                            bantuan_sosial_id: router.currentRoute.value.params?.id as string,
                            tipe: props.tipe
                        });
                    }
                }
            }

            // Kirim sebagai satu payload bulk
            await props.createService(comparisonDataList);
            console.log('Semua perbandingan berhasil disimpan:', comparisonDataList);
            step.value = 'table';
            isComparisonComplete.value = true

        } catch (error) {
            console.error('Gagal menyimpan perbandingan:', error);
            alert('Gagal menyimpan perbandingan. Silakan coba lagi.');
        } finally {
            loading.value = false;
        }
    } else {
        step.value = 'table';
    }
};


const handleClose = (done: () => void) => {
    visible.value = false;
    emit('update:visible', false);
    step.value = 'table';
    weights.value = [];
    done();
};
</script>

<style scoped>
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
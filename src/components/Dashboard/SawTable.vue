<template>
    <div class="table-container">
        <!-- Grafik Total Nilai SAW -->
        <div v-if="props.data && props.data.length > 0" style="height: 400px;" class="mb-4">
            <h2 class="text-lg font-semibold mb-2">Grafik Total Nilai SAW</h2>
            <Bar id="my-chart-id" :options="chartOptions" :data="sawChartData" />
        </div>

        <!-- Tabel 1: Hasil Perhitungan SAW -->
        <el-table :data="data" style="width: 100%" border>
            {{ criteria }}
            <el-table-column prop="nama_lengkap" label="Nama" align="center" />
            <el-table-column v-for="k in criteria" :key="k.id" :label="k.nama_kriteria" align="center">
                <template #default="{ row }">
                    {{
                        getMatriksValue(row.matriks_keputusan, k.id, "nilai_saw") || "-"
                    }}
                </template>
            </el-table-column>
            <el-table-column label="Total" align="center">
                <template #default="{ row }">
                    {{
                        row.hasil_akhir && row.hasil_akhir.nilai_saw
                            ? parseFloat(row.hasil_akhir.nilai_saw).toFixed(3)
                            : "-"
                    }}
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { useCriteriaStore } from '@/stores/criteria';
import { computed, onMounted } from 'vue';
import { Bar, Radar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, RadarController, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';

// Daftarkan komponen Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, RadarController, RadialLinearScale, PointElement, LineElement, Filler);

const props = defineProps({
    data: {
        type: Array,
        required: true,
        default: () => []
    }
})

// Data untuk grafik SAW (Total Nilai)
const sawChartData = computed(() => ({
    labels: props.data.map(item => item.nama_lengkap),
    datasets: [
        {
            label: 'Total Nilai SAW',
            backgroundColor: '#409EFF',
            data: props.data.map(item => parseFloat(item.hasil_akhir.nilai_saw).toFixed(3)),
        },
    ],
}));


const criteriaStore = useCriteriaStore();
const criteria = computed(() => criteriaStore.criterias);

// Fungsi untuk mendapatkan nilai dari matriks_keputusan berdasarkan kriteria dan jenis nilai
const getMatriksValue = (matriksKeputusan, kriteriaId, valueType) => {
    if (!matriksKeputusan || !Array.isArray(matriksKeputusan)) return null;
    const matriks = matriksKeputusan.find(
        (m) => m.kriteria_bantuan_id.id == kriteriaId
    );


    if (matriks && matriks[valueType]) {
        return parseFloat(matriks[valueType]).toFixed(2);
    }
    return null;
};
// Opsi untuk Bar Chart (Total Nilai)
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Total Nilai SAW',
            },
        },
        x: {
            title: {
                display: true,
                text: 'Calon Penerima',
            },
        },
    }
};
// Pastikan data kriteria diambil saat komponen dimuat
onMounted(() => {
    if (!criteriaStore.criterias || criteriaStore.criterias.length === 0) {
        criteriaStore.fetchData(); // Pastikan store memiliki metode untuk mengambil data
    }
});
</script>

<style lang="scss" scoped></style>
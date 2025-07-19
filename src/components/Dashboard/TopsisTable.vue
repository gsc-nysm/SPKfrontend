<template>
    <div class="table-container">
        <!-- Grafik Total Nilai Preferensi TOPSIS (Horizontal Bar Chart) -->
        <div v-if="sortedTopsisData.length > 0" style="height: 600px;" class="mb-4">
            <h2 class="text-lg font-semibold mb-2">Grafik Total Nilai Preferensi TOPSIS (Horizontal Bar Chart)</h2>
            <Bar id="my-chart-id" :options="chartOptions" :data="topsisChartData" />
        </div>

        <!-- Dropdown untuk Memilih Calon Penerima -->
        <div v-if="sortedTopsisData.length > 0 && criteria.length > 0" class="mb-4">
            <h2 class="text-lg font-semibold mb-2">Pilih Calon Penerima untuk Perbandingan Kriteria</h2>
            <el-select v-model="selectedCalonPenerima" multiple placeholder="Pilih calon penerima (maks 5)" :limit="5">
                <el-option v-for="item in sortedTopsisData" :key="item.id"
                    :label="`${item.nama_lengkap} (Peringkat ${item.peringkat})`" :value="item.nama_lengkap" />
            </el-select>
        </div>

        <!-- Grafik Perbandingan Kriteria TOPSIS (Radar Chart) -->
        <div v-if="selectedCalonPenerima.length > 0" style="height: 400px;" class="mb-4">
            <h2 class="text-lg font-semibold mb-2">Grafik Perbandingan Kriteria TOPSIS (Radar Chart)</h2>
            <Radar id="my-radar-chart-id" :data="topsisKriteriaChartData" :options="radarChartOptions" />
        </div>

        <!-- Tabel: Hasil Perhitungan TOPSIS -->
        <el-table :data="paginatedData" style="width: 100%" border>
            <el-table-column prop="nama_lengkap" label="Nama" align="center" />
            <el-table-column v-for="k in criteria" :key="k.id" :label="k.nama_kriteria" align="center">
                <template #default="{ row }">
                    {{ getMatriksValue(row.matriks_keputusan, k.id, "nilai_normalisasi") || "-" }}
                </template>
            </el-table-column>
            <el-table-column label="Nilai Preferensi" align="center">
                <template #default="{ row }">
                    {{ row.hasil_akhir && row.hasil_akhir.nilai_preferensi ?
                        parseFloat(row.hasil_akhir.nilai_preferensi).toFixed(3) : "-" }}
                </template>
            </el-table-column>
            <el-table-column label="Peringkat" align="center">
                <template #default="{ row }">
                    {{ row.peringkat || "-" }}
                </template>
            </el-table-column>
        </el-table>

    </div>
</template>

<script setup>
import { useCriteriaStore } from '@/stores/criteria';
import { computed, ref, onMounted } from 'vue';
import { Bar, Radar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, RadarController, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';

// Daftarkan komponen Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, RadarController, RadialLinearScale, PointElement, LineElement, Filler);

const props = defineProps({
    data: {
        type: Array,
        required: true,
        default: () => []
    }
});

// Ambil data kriteria dari store
const criteriaStore = useCriteriaStore();
const criteria = computed(() => criteriaStore.criterias || []);

// Pastikan data kriteria diambil saat komponen dimuat
onMounted(() => {
    if (!criteriaStore.criterias || criteriaStore.criterias.length === 0) {
        criteriaStore.fetchData();
    }
    // Debugging: Periksa data awal
    console.log('Props Data:', props.data);
});

// Jika props.data adalah daftar calon penerima (bukan matriks keputusan), kita tidak perlu mengelompokkannya
const sortedTopsisData = computed(() => {
    if (!props.data || props.data.length === 0) {
        console.log('Props Data is empty');
        return [];
    }

    // Debugging: Periksa jumlah calon penerima
    console.log('Number of Calon Penerima:', props.data.length);

    return [...props.data].sort((a, b) => {
        const rankA = parseInt(a.peringkat || Infinity);
        const rankB = parseInt(b.peringkat || Infinity);
        return rankA - rankB;
    });
});

// Data untuk grafik TOPSIS (Total Nilai Preferensi - Horizontal Bar Chart)
const topsisChartData = computed(() => {
    if (!sortedTopsisData.value || sortedTopsisData.value.length === 0) {
        return {
            labels: [],
            datasets: [
                {
                    label: 'Nilai Preferensi TOPSIS',
                    backgroundColor: '#67C23A',
                    data: [],
                },
            ],
        };
    }

    return {
        labels: sortedTopsisData.value.map(item => `${item.nama_lengkap} (Peringkat ${item.peringkat})`),
        datasets: [
            {
                label: 'Nilai Preferensi TOPSIS',
                backgroundColor: '#67C23A',
                data: sortedTopsisData.value.map(item => {
                    if (item.hasil_akhir && item.hasil_akhir.nilai_preferensi) {
                        return parseFloat(item.hasil_akhir.nilai_preferensi) || 0;
                    }
                    return 0;
                }),
                axis: 'y',
            },
        ],
    };
});

// State untuk dropdown dan pagination
const selectedCalonPenerima = ref([]); // Calon penerima yang dipilih untuk Radar Chart
const pageSize = 10; // Jumlah data per halaman di tabel
const currentPage = ref(1); // Halaman saat ini

// Data untuk tabel dengan pagination
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return sortedTopsisData.value.slice(start, end);
});

// Handler untuk perubahan halaman
const handlePageChange = (page) => {
    currentPage.value = page;
};

// Data untuk grafik perbandingan kriteria TOPSIS (Radar Chart)
const topsisKriteriaChartData = computed(() => {
    if (!sortedTopsisData.value || sortedTopsisData.value.length === 0 || !criteria.value || criteria.value.length === 0 || selectedCalonPenerima.value.length === 0) {
        return {
            labels: [],
            datasets: [],
        };
    }

    const kriteriaList = criteria.value.map(criteria => criteria.nama_kriteria);
    const colors = Array.from({ length: selectedCalonPenerima.value.length }, () => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    });

    // Filter data hanya untuk calon penerima yang dipilih
    const filteredData = sortedTopsisData.value.filter(item => selectedCalonPenerima.value.includes(item.nama_lengkap));

    const datasets = filteredData.map((item, index) => ({
        label: item.nama_lengkap || 'Unknown',
        backgroundColor: colors[index % colors.length] + '33',
        borderColor: colors[index % colors.length],
        data: criteria.value.map(criteria => {
            const value = getMatriksValue(item.matriks_keputusan, criteria.id, "nilai_normalisasi");
            return value ? parseFloat(value) : 0;
        }),
    }));

    return {
        labels: kriteriaList,
        datasets,
    };
});

// Opsi untuk Horizontal Bar Chart (Total Nilai Preferensi)
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
        x: {
            beginAtZero: true,
            max: 1,
            title: {
                display: true,
                text: 'Nilai Preferensi TOPSIS',
            },
        },
        y: {
            title: {
                display: true,
                text: 'Calon Penerima',
            },
        },
    },
    plugins: {
        legend: {
            display: true,
        },
        tooltip: {
            callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw.toFixed(3)}`,
            },
        },
    },
};

// Opsi untuk Radar Chart (Perbandingan Kriteria)
const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        r: {
            beginAtZero: true,
            min: 0,
            suggestedMax: 0.5,
            ticks: {
                stepSize: 0.1,
            },
            pointLabels: {
                font: {
                    size: 12,
                },
            },
        },
    },
    plugins: {
        legend: {
            display: true,
        },
        tooltip: {
            callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw.toFixed(3)}`,
            },
        },
    },
};

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
</script>
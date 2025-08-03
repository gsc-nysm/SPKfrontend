// src/composables/useAHP.ts
import { ref, computed, type Ref } from 'vue';

// Composable function akan menerima matriks sebagai input
export function useAHP(matrix: Ref<any[][]>) {

    const weights = ref<number[]>([]);
    const consistencyIndex = ref({
        lambdaMax: null as string | null,
        ci: null as string | null,
        cr: null as string | null,
        isConsistent: undefined as boolean | undefined,
    });

    const calculateWeights = () => {
        if (!matrix.value.length || !matrix.value[0]) {
            weights.value = [];
            return;
        }
        // ... (SALIN SEMUA LOGIKA FUNGSI calculateWeights DARI KOMPONEN ANDA KE SINI) ...
        const numericMatrix = matrix.value.map(row =>
            row.map(value => (typeof value === 'number' ? value : 1))
        );
        const columnSums = numericMatrix[0].map((_, colIndex) =>
            numericMatrix.reduce((sum, row) => sum + row[colIndex], 0)
        );
        const normalizedMatrix = numericMatrix.map(row =>
            row.map((value, colIndex) => value / columnSums[colIndex])
        );
        weights.value = normalizedMatrix.map(row =>
            row.reduce((sum, value) => sum + value, 0) / row.length
        );

        // Panggil kalkulasi konsistensi setelah bobot dihitung
        calculateConsistencyIndex();
    };

    const calculateConsistencyIndex = () => {
        if (!matrix.value.length || !weights.value.length || matrix.value.length !== weights.value.length) {
            consistencyIndex.value = { lambdaMax: null, ci: null, cr: null, isConsistent: undefined };
            return;
        }
        // ... (SALIN SEMUA LOGIKA FUNGSI calculateConsistencyIndex DARI KOMPONEN ANDA KE SINI) ...
        const n = matrix.value.length;
        const numericMatrix = matrix.value.map(row => row.map(value => (typeof value === 'number' ? value : 1)));
        const weightedSumVector = new Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                weightedSumVector[i] += numericMatrix[i][j] * weights.value[j];
            }
        }
        const lambdaMax = weightedSumVector.reduce((sum, value, index) => {
            return weights.value[index] > 0 ? sum + (value / weights.value[index]) : sum;
        }, 0) / n;
        const ci = (lambdaMax - n) / (n > 1 ? n - 1 : 1);
        const riValues = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
        const ri = n <= riValues.length ? riValues[n - 1] : 1.49;
        const cr = ri > 0 ? ci / ri : 0;
        
        consistencyIndex.value = {
            lambdaMax: lambdaMax.toFixed(4),
            ci: ci.toFixed(4),
            cr: cr.toFixed(4),
            isConsistent: cr < 0.1,
        };
    };

    // Kembalikan semua state dan fungsi yang dibutuhkan
    return {
        weights,
        consistencyIndex,
        calculateWeights,
    };
}
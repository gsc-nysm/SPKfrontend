import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

export const useProgramStore = defineStore('program_selected', () => {
  // State untuk menyimpan programActive
    const route = useRoute();
    const programActive = ref<number | null>(Number(route.params.id) || null);

    // Action untuk mengatur programActive
    const setProgramActive = (id: number | null) => {
        programActive.value = id;
    };

    // Getter (opsional, untuk mengambil nilai programActive)
    const getProgramActive = () => programActive.value;

    return { programActive, setProgramActive, getProgramActive };
});
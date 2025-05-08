<template>
    <el-card shadow="never" style="border:none">
        <div class="flex justify-between">
            <h1 class="text-xl font-semibold w-full">Pengajuan Bantuan Sosial</h1> 
            <div class="flex lg:flex-row md:flex-row justify-end items-center gap-5 w-full">
                <!-- <el-select placeholder="Pilih Tingkatan" v-model="tingkatanFilter">
                    <el-option v-for="tingkatan in tingkatanOptions" :key="tingkatan.value" :label="tingkatan.label" :value="tingkatan.value" />                    
                </el-select> -->
                <el-input placeholder="Cari Bantuan ..." v-model="searchQuery" prefix-icon="el-icon-search" class="w-1/2 " clearable />
            </div>
        </div>        
    </el-card>
    <div class="my-4">
        <div v-if="registration_period.length === 0" class="text-center text-gray-500">
            Tidak ada periode pendaftaran yang tersedia.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RegistrationPeriodCard
                v-for="periode in registration_period"
                :key="periode.id"
                :periode="periode"
                :createService="store.createData"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import RegistrationPeriodCard from '@/components/Dashboard/RegistrationPeriodCard.vue'
import { ref, watch, computed, defineEmits, onMounted } from 'vue'
import type { IncomingApiData } from '@/models/Agency'
import { debounce } from 'lodash-es'
import { useRegistrationPeriodStore } from '@/stores/registration_period'
import { useSubmissionStore } from '@/stores/submission'

const searchQuery = ref<string>('')
const statusFilter = ref<string>('')
const tingkatanFilter = ref<string>('')
const debouncedFetch = debounce(() => registration_period_store.fetchData(1, 50, searchQuery.value,'','active'), 500)
const registration_period_store = useRegistrationPeriodStore()
const store = useSubmissionStore() // Gunakan store
const emit = defineEmits(['save', 'delete'])
const registration_period = computed(() => registration_period_store.registration_period)

const loading = computed(() => store.loading)
import {useRouter} from 'vue-router'
const router = useRouter();

const url = import.meta.env.VITE_API_BASE_URL + 'storage/'

const resetFilters = () => {
    searchQuery.value = ''
    statusFilter.value = ''
    tingkatanFilter.value = ''
}

watch([searchQuery, statusFilter, tingkatanFilter], debouncedFetch)

onMounted(() => {
    store.fetchData(1, 10)
    registration_period_store.fetchData(1, 50, '', '', 'active')
})
</script>

<style lang="scss" scoped>

</style>
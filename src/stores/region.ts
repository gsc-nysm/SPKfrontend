import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { regionService } from '@/services/RegionService'
import { useRouter } from 'vue-router'

export const useRegionStore = defineStore('region', () => {
    const regencies = ref<any[]>([])
    const districts = ref<any[]>([])
    const villages = ref<any[]>([])
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    
    const router = useRouter()

    const fetchRegencies = async () => {
        loading.value = true
        error.value = null
        
        try {
            const response = await regionService.getRegencies()
            regencies.value = response.data.data            
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat mengambil data kabupaten.'
        } finally {
            loading.value = false
        }
    }

    const fetchDistricts = async (regency_id: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await regionService.getDistricts(regency_id)
            districts.value = response.data.data            
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat mengambil data kecamatan.'
        } finally {
            loading.value = false
        }
    }

    const fetchVillages = async (district_id: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await regionService.getVillages(district_id)
            villages.value = response.data.data            
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat mengambil data desa.'
        } finally {
            loading.value = false
        }
    }

    return {
        regencies,
        districts,
        villages,
        loading,
        error,
        fetchRegencies,
        fetchDistricts,
        fetchVillages,        
    }
})
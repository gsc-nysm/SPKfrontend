import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pariWiseService } from '@/services/PairWiseService'
import type { IncomingApiData } from '@/models/PairWise'
import { useRouter } from 'vue-router'
import PairWise from '@/models/PairWise'

export const usePairWiseStore = defineStore('pair_wise', () => {
const pair_wise = ref<IncomingApiData[]>([])
const pagination = ref<any | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const searchQuery = ref<string>('')
const filterQuery = ref<string>('')
const router = useRouter()

// Kolom dinamis berdasarkan properti dari IncomingApiData
const columns = computed(() => {
    if (!pair_wise.value.length) return []
    const sampleData = pair_wise.value[0]
    return Object.keys(sampleData).map((prop) => {
    if (prop === 'id') {
        return { prop, label: 'ID', width: 80, sortable: true, filterable: false }
    } else if (prop === 'created_at') {
        return { prop, label: 'Tanggal Dibuat', sortable: true, filterable: false }
    }
    return { 
        prop, 
        label: prop.charAt(0).toUpperCase() + prop.slice(1).replace(/_/g, ' '), 
        sortable: true, 
        filterable: true 
    }
    })
})

const fetchData = async (page: number = 1, search: string = '', bantuan_sosial_id: string = '') => {
    loading.value = true
    error.value = null
    try {
        const response = await pariWiseService.getAll(page, search, router.currentRoute.value.params?.id as string ?? bantuan_sosial_id)
        pair_wise.value = response.data.data
        pagination.value = response.data.pagination
    } catch (err:any) {
        error.value = err.message || 'Terjadi kesalahan saat mengambil data instansi.'
    } finally {
        loading.value = false
    }
}

const createData = async (data: any) => {
    loading.value = true
    error.value = null
    try {
        const response = await pariWiseService.create(data)
        pair_wise.value.unshift(response.data)
        await fetchData(pagination.value?.current_page || 1)
    } catch (err:any) {
        error.value = err.message || 'Terjadi kesalahan saat membuat instansi.'
        throw err
    } finally {
        loading.value = false
    }
}

const updateData = async (id: number, data: any) => {
    loading.value = true
    try {
        const formData = new FormData()
        for (const key in data) {
            console.log(data[key]);
            
            if (data[key] === null) {
                continue // Jika data[key] bernilai null, maka tidak akan dikirim ke database
            }
            
            if (key === 'logo' && typeof data[key] === 'string') {
                // Skip if logo is a string (existing file path/URL)
                continue
            }          
            
            if (data[key] instanceof File) {
                formData.append(key, data[key]) // Tambahkan file logo baru ke formData
            } else if (data[key] !== undefined) {
                formData.append(key, data[key]) // Tambahkan field teks sebagai string
            }
        }
        formData.append('_method', 'PUT')
        const response = await pariWiseService.update(id, formData)
        // const index = pair_wise.value.findIndex(agency => agency.id === id)
        // if (index !== -1) {
        //     pair_wise.value[index] = response.data // Perbarui store dengan data terbaru dari backend
        // }
        fetchData(pagination.value?.current_page || 1)
        return response.data
    } catch (err) {
        console.error('Gagal memperbarui instansi:', err)
        throw err
    } finally {
        loading.value = false
    }
}

const showData = async (id: number) => {
    loading.value = true
    try {
        const response = await pariWiseService.show(id)
        return response.data
    } catch (err) {
        console.error('Gagal memuat detail instansi:', err)
        throw err
    } finally {
        loading.value = false
    }
}

const deleteMultipleData = async (ids: number[]) => {
    loading.value = true
    try {            
        await pariWiseService.deleteMultiple(ids); // Gunakan API multi-delete baru
        pair_wise.value = pair_wise.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
        await fetchData(pagination.value?.current_page || 1);
    } catch (err) {          
        throw err
    } finally {
        loading.value = false
    }
}

const deleteByBantuan = async () => {
        loading.value = true
        error.value = null
    try {
        await pariWiseService.deleteByBantuan(Array.isArray(router.currentRoute.value.params?.id) ? router.currentRoute.value.params?.id[0] : router.currentRoute.value.params?.id)
        pair_wise.value = pair_wise.value.filter(i => i.id !== Number(router.currentRoute.value.params?.id))
        await fetchData(pagination.value?.current_page || 1)
    } catch (err:any) {
        error.value = err.message || 'Terjadi kesalahan saat menghapus instansi.'
        throw err
    } finally {
        loading.value = false
    }
}

const deleteData = async (id: number) => {
        loading.value = true
        error.value = null
    try {
        await pariWiseService.delete(id)
        pair_wise.value = pair_wise.value.filter(i => i.id !== id)
        await fetchData(pagination.value?.current_page || 1)
    } catch (err:any) {
        error.value = err.message || 'Terjadi kesalahan saat menghapus instansi.'
        throw err
    } finally {
        loading.value = false
    }
}

const setSearchQuery = (query: string) => {
    searchQuery.value = query
    fetchData(1)
}

const setFilterQuery = (query: string) => {
    filterQuery.value = query
    fetchData(1)
}

return {
    pair_wise,
    pagination,
    loading,
    error,
    searchQuery,
    filterQuery,
    columns,
    fetchData,
    createData,
    deleteMultipleData,
    updateData,
    deleteData,
    deleteByBantuan,
    showData,
    setSearchQuery,
    setFilterQuery,
}
})
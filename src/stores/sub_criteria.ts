import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { subCriteriaService } from '@/services/SubCriteriaService'
import type { IncomingApiData, FormValue, OutgoingApiData } from '@/models/SubCriteria'
import SubCriteria from '@/models/SubCriteria'
import { useRouter } from 'vue-router'
import { sub } from 'date-fns'

export const useSubCriteriaStore = defineStore('sub_criterias', () => {
    const sub_criterias = ref<IncomingApiData[]>([])
    const pagination = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')
    const router = useRouter()

  // Kolom dinamis berdasarkan properti dari IncomingApiData
    const columns = computed(() => {
        if (!sub_criterias.value.length) return []
        const sampleAgency = sub_criterias.value[0]
        return Object.keys(sampleAgency).map((prop) => {
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

    const fetchData = async (page: number = 1, per_page: number = 10, search: string = '', kriteria_bantuan_id: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await subCriteriaService.getAll(page, per_page, search, router.currentRoute.value.params?.criteria_id as string ?? kriteria_bantuan_id)
            sub_criterias.value = response.data.data
            pagination.value = {
                current_page: response.data.pagination.current_page,
                per_page: per_page, // Gunakan perPage yang dikirim, bukan dari response
                total: response.data.pagination.total,
            };
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat mengambil data kriteria.'
        } finally {
            loading.value = false
        }
    }

    const createData = async (data: any) => {
        loading.value = true
        error.value = null
        try {
            const formData = new FormData()
            for (const key in data) {
                if (data[key] instanceof File) {
                    formData.append(key, data[key]) // Tambahkan file logo ke formData
                } else if (data[key] !== undefined) {
                    formData.append(key, data[key] as string) // Tambahkan field teks sebagai string
                }
                console.log(data);
                
                // formData.append('email', data.user_id.email)
            }
            formData.append('kriteria_bantuan_id',router.currentRoute.value.params?.criteria_id as string ?? null)
            const response = await subCriteriaService.create(formData)
            sub_criterias.value.unshift(response.data)
            await fetchData(pagination.value?.current_page || 1)
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat membuat kriteria.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateData = async (id: number, data: any) => {
        loading.value = true
        try {            
            data['kriteria_bantuan_id'] = router.currentRoute.value.params?.criteria_id as string ?? null
            
            const response = await subCriteriaService.update(id, data)
            fetchData(pagination.value?.current_page || 1)
            return response.data
        } catch (err) {
            console.error('Gagal memperbarui kriteria:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateBobot = async (data: any) => {
        loading.value = true
        try {    
                    
            const id = router.currentRoute.value.params?.criteria_id            
            const response = await subCriteriaService.updateBobot(Number(id), data)
            fetchData(pagination.value?.current_page || 1)
            return response.data
        } catch (err) {
            console.error('Gagal memperbarui kriteria:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const showData = async (id: number) => {
        loading.value = true
        try {
            const response = await subCriteriaService.show(id)
            return response.data
        } catch (err) {
            console.error('Gagal memuat detail kriteria:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteMultipleData = async (ids: number[]) => {
        loading.value = true
        try {            
            await subCriteriaService.deleteMultiple(ids); // Gunakan API multi-delete baru
            sub_criterias.value = sub_criterias.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
            await fetchData(pagination.value?.current_page || 1);
        } catch (err) {          
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteData = async (id: number) => {
            loading.value = true
            error.value = null
        try {
            await subCriteriaService.delete(id)
            sub_criterias.value = sub_criterias.value.filter(i => i.id !== id)
            await fetchData(pagination.value?.current_page || 1)
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat menghapus kriteria.'
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
        sub_criterias,
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
        showData,
        setSearchQuery,
        setFilterQuery,
        updateBobot
    }
})
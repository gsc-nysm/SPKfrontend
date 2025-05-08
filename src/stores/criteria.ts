import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { criteriaService } from '@/services/CriteriaService'
import type { IncomingApiData, FormValue, OutgoingApiData } from '@/models/Criteria'
import Criteria from '@/models/Criteria'
import { useRouter } from 'vue-router'

export const useCriteriaStore = defineStore('criterias', () => {
    const criterias = ref<IncomingApiData[]>([])
    const pagination = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')
    const router = useRouter()

  // Kolom dinamis berdasarkan properti dari IncomingApiData
    const columns = computed(() => {
        if (!criterias.value.length) return []
        const sampleAgency = criterias.value[0]
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

    const fetchData = async (page: number = 1, per_page:number = 10, search: string = '', bantuan_sosial_id: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await criteriaService.getAll(page, per_page, search, router.currentRoute.value.params?.id as string ?? bantuan_sosial_id)
            criterias.value = response.data.data
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
            formData.append('bantuan_sosial_id',router.currentRoute.value.params?.id as string ?? null)
            const response = await criteriaService.create(formData)
            criterias.value.unshift(response.data)
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
            const formData = new FormData()
            for (const key in data) {                
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
            formData.append('bantuan_sosial_id',router.currentRoute.value.params?.id as string ?? null)
            formData.append('_method', 'PUT')
            const response = await criteriaService.update(id, formData)
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
                    
            const id = router.currentRoute.value.params?.id
            // const formData = new FormData()
            // for (const key in data) {                
            //     if (data[key] === null) {
            //         continue // Jika data[key] bernilai null, maka tidak akan dikirim ke database
            //     }
                
            //     if (key === 'logo' && typeof data[key] === 'string') {
            //         // Skip if logo is a string (existing file path/URL)
            //         continue
            //     }          
                
            //     if (data[key] instanceof File) {
            //         formData.append(key, data[key]) // Tambahkan file logo baru ke formData
            //     } else if (data[key] !== undefined) {
            //         formData.append(key, data[key]) // Tambahkan field teks sebagai string
            //     }
                
            // }            
            // formData.append('_method', 'PUT')
            const response = await criteriaService.updateBobot(Number(id), data)
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
            const response = await criteriaService.show(id)
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
            await criteriaService.deleteMultiple(ids); // Gunakan API multi-delete baru
            criterias.value = criterias.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
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
            await criteriaService.delete(id)
            criterias.value = criterias.value.filter(i => i.id !== id)
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
        criterias,
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
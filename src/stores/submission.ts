import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { submissionService } from '@/services/SubmissionService'
import type { IncomingApiData, FormValue, OutgoingApiData } from '@/models/Submission'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth'

export const useSubmissionStore = defineStore('submissions', () => {
    const submissions = ref<IncomingApiData[]>([])
    const pagination = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')
    const router = useRouter()
    const auth = useAuthStore()

  // Kolom dinamis berdasarkan properti dari IncomingApiData
    const columns = computed(() => {
        if (!submissions.value.length) return []
        const sampleAgency = submissions.value[0]
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

    const fetchData = async (page: number = 1, per_page: number = 10, search: string = '', instansi_id: string = '', periode_pendaftaran_id: string = '', bantuan_sosial_id: string = '', status: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const instansi = auth.user?.role?.name === 'validator' 
                ? String(auth.user.instansi?.id) ?? instansi_id
                : instansi_id
            const response = await submissionService.getAll(
                page, 
                per_page, 
                search, 
                instansi_id, 
                periode_pendaftaran_id,
                bantuan_sosial_id,
                status
            )
            submissions.value = response.data.data
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
            data['instansi_id'] = String(auth.user?.instansi?.id)            
            const response = await submissionService.create(data)
            submissions.value.unshift(response.data)
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
            formData.append('instansi_id', auth.user?.role?.name == 'validator' ? String(auth.user?.instansi?.id) : String(data.instansi_id.id))
            formData.append('periode_pendaftaran_id', String(data.periode_pendaftaran_id.id))
            formData.append('status', String(data.status))  
            if(data.dokumen){
                formData.append('dokumen', data.dokumen)
            }  
            formData.append('_method', 'PUT')    
            const response = await submissionService.update(id, formData)
            fetchData(pagination.value?.current_page || 1)
            return response.data
        } catch (err) {
            console.error('Gagal memperbarui kriteria:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // const uploadData = async (id:number, data: any) => {
    //     loading.value = true
    //     try {    
            
    //         const response = await submissionService.upload(id, data)
    //         fetchData(pagination.value?.current_page || 1)
    //         return response.data
    //     } catch (err) {
    //         console.error('Gagal memperbarui kriteria:', err)
    //         throw err
    //     } finally {
    //         loading.value = false
    //     }
    // }

    // const updateStatus = async (id:number, data: any) => {
    //     loading.value = true
    //     try {

    //         const response = await submissionService.upload(id, data)
    //         fetchData(pagination.value?.current_page || 1)
    //         return response.data
    //     } catch (err) {
    //         console.error('Gagal memperbarui kriteria:', err)
    //         throw err
    //     } finally {
    //         loading.value = false
    //     }
    // }

    const showData = async (id: number) => {
        loading.value = true
        try {
            const response = await submissionService.show(id)
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
            await submissionService.deleteMultiple(ids); // Gunakan API multi-delete baru
            submissions.value = submissions.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
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
            await submissionService.delete(id)
            submissions.value = submissions.value.filter(i => i.id !== id)
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
        submissions,
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
        // uploadData
    }
})
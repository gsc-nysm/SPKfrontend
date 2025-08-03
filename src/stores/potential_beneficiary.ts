import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { potentialBeneficiaryService } from '@/services/PotentialBeneficiaryService'
import type { IncomingApiData, FormValue, OutgoingApiData } from '@/models/PotentialBeneficiary'
import { useAuthStore } from './auth'
import PotentialBeneficiary from '@/models/PotentialBeneficiary'
import { useRouter } from 'vue-router'
import axiosInstance from '@/utils/axios'

export const usePotentialBeneficiaryStore = defineStore('potential_beneficiaries', () => {
    const potential_beneficiaries = ref<IncomingApiData[]>([])
    const potential_beneficiaries_ranked = ref<IncomingApiData[]>([])
    const search_results = ref<any | null>(null)
    const pagination = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')
    const router = useRouter()
    const auth = useAuthStore()

  // Kolom dinamis berdasarkan properti dari IncomingApiData
    const columns = computed(() => {
        if (!potential_beneficiaries.value.length) return []
        const sampleAgency = potential_beneficiaries.value[0]
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

    const fetchData = async (page: number = 1,per_page:number = 10, search: string = '', bantuan_sosial_id: string = '',pengajuan_id: string = '',status: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await potentialBeneficiaryService.getAll(page,per_page, search, router.currentRoute.value.params?.id as string ?? bantuan_sosial_id, pengajuan_id, status)
            potential_beneficiaries.value = response.data.data
            pagination.value = {
                current_page: response.data.pagination.current_page,
                per_page: per_page, // Gunakan perPage yang dikirim, bukan dari response
                total: response.data.pagination.total,
            };
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat mengambil data calon penerima bantuan.'
        } finally {
            loading.value = false
        }
    }

    const fetchRanking = async (search: string = '',pengajuan_id: string = '',status: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await potentialBeneficiaryService.getRanking(search, pengajuan_id, status)
            potential_beneficiaries_ranked.value = response.data.data
            
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat mengambil data calon penerima bantuan.'
        } finally {
            loading.value = false
        }
    }

    const search = async (nik: string) => {
        loading.value = true
        error.value = null
        try {
            // Memanggil service
            const response = await potentialBeneficiaryService.search(nik)
            const data = response.data;

            if (!data) {
                // Jika tidak ada data (null atau undefined), set sebagai array kosong
                search_results.value = [];
            } else {
                // Jika ada data, cek apakah itu sudah array. Jika bukan, bungkus menjadi array.
                search_results.value = Array.isArray(data) ? data : data;
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mencari calon penerima.'
            error.value = errorMessage
            // Lempar error lagi agar bisa ditangkap di komponen
            throw new Error(errorMessage)
        } finally {
            loading.value = false
        }
    }

    const calculateTopsis = async () => {
        loading.value = true
        error.value = null
        try {
            const formData = new FormData();
            formData.append('pengajuan_id', router.currentRoute.value.params?.submission_id as string);
            const response = await potentialBeneficiaryService.calculateTopsis(formData)
            return response.data
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat membuat calon penerima bantuan.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const createData = async (data: any) => {
        loading.value = true
        error.value = null
        try {
            data['bantuan_sosial_id'] = router.currentRoute.value.params?.id as string
            data['pengajuan_id'] = router.currentRoute.value.params?.submission_id as string
            const response = await potentialBeneficiaryService.create(data)
            potential_beneficiaries.value.unshift(response.data)
            await fetchData(pagination.value?.current_page || 1, pagination.value?.per_page || 10, searchQuery.value, router.currentRoute.value.params?.id as string, router.currentRoute.value.params?.submission_id as string)
            return response.data
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat membuat calon penerima bantuan.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const importData = async (data: any) => {
        loading.value = true
        error.value = null
        try {
            const formData = new FormData()
            formData.append('file', data)
            formData.append('bantuan_sosial_id', router.currentRoute.value.params?.id as string)
            formData.append('pengajuan_id', router.currentRoute.value.params?.submission_id as string)
            const response = await potentialBeneficiaryService.import(formData)
            potential_beneficiaries.value.unshift(response.data)
            await fetchData(pagination.value?.current_page || 1)
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat membuat calon penerima bantuan.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Fungsi untuk menangani ekspor data
    const exportData = async (data:any) => {
        try {
            const response = await axiosInstance.get(`/v1/calon-penerima/export`, {                
                responseType: 'blob', // Penting untuk menangani file
                });
        
                // Buat URL dari blob response
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
        
                // Ambil nama file dari header Content-Disposition jika ada
                const contentDisposition = response.headers['content-disposition'];
                let fileName = 'calon-penerima.xlsx'; // Default nama file
        
                // Jika ada data untuk nama file dinamis
                if (data.data && data.data.instansi_id && data.data.periode_pendaftaran_id) {
                    const namaInstansi = data.data.instansi_id.nama_instansi?.replace(/\s+/g, '-') || 'unknown';
                    const namaBantuanSosial = data.data.periode_pendaftaran_id.bantuan_sosial_id?.nama_bantuan_sosial?.replace(/\s+/g, '-') || 'unknown';
                    fileName = `calon-penerima-${namaInstansi}-${namaBantuanSosial}.xlsx`;
                } else if (contentDisposition) {
                    const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1];
                }
            }
        
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
        
                return { success: true, message: 'Data berhasil diekspor.' };
        } catch (error) {
            throw new Error('Gagal mengekspor data: ' + (error as any).message);
        }
    } 

    const updateData = async (id: number, data: any) => {
        loading.value = true
        try {
            if(auth.user?.role?.name == 'verifikator') {
                data['bantuan_sosial_id'] = router.currentRoute.value.params?.id as string
                data['pengajuan_id'] = router.currentRoute.value.params?.submission_id as string
                const response = await potentialBeneficiaryService.update(id, data)
                fetchData(pagination.value?.current_page || 1, pagination.value?.per_page || 10, searchQuery.value, router.currentRoute.value.params?.id as string, router.currentRoute.value.params?.submission_id as string)
                return response.data
            }else {
                data['tipe'] = 'diskualifikasi'                
                const response = await potentialBeneficiaryService.updateStatus(id, data)
                fetchData(pagination.value?.current_page || 1, pagination.value?.per_page || 10, searchQuery.value, router.currentRoute.value.params?.id as string, router.currentRoute.value.params?.submission_id as string)
                return response.data
            }
        } catch (err) {
            console.error('Gagal memperbarui calon penerima bantuan:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateStatus = async (id: number, data: any) => {
        loading.value = true
        try {
            const response = await potentialBeneficiaryService.updateStatus(id, data)
            fetchData(pagination.value?.current_page || 1, pagination.value?.per_page || 10, searchQuery.value, router.currentRoute.value.params?.id as string, router.currentRoute.value.params?.submission_id as string)
            return response.data
        } catch (err) {
            console.error('Gagal memperbarui calon penerima bantuan:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const showData = async (id: number) => {
        loading.value = true
        try {
            const response = await potentialBeneficiaryService.show(id)
            return response.data
        } catch (err) {
            console.error('Gagal memuat detail calon penerima bantuan:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteMultipleData = async (ids: number[]) => {
        loading.value = true
        try {            
            await potentialBeneficiaryService.deleteMultiple(ids); // Gunakan API multi-delete baru
            potential_beneficiaries.value = potential_beneficiaries.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
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
            await potentialBeneficiaryService.delete(id)
            potential_beneficiaries.value = potential_beneficiaries.value.filter(i => i.id !== id)
            await fetchData(pagination.value?.current_page || 1)
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat menghapus calon penerima bantuan.'
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
        search_results,
        potential_beneficiaries,
        potential_beneficiaries_ranked,
        pagination,
        loading,
        error,
        searchQuery,
        filterQuery,
        columns,
        fetchData,
        search,
        calculateTopsis,
        fetchRanking,
        createData,
        deleteMultipleData,
        updateData,
        deleteData,
        updateStatus,
        importData,
        showData,
        setSearchQuery,
        setFilterQuery,
        exportData
    }
})
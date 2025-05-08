import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { beneficiaryGroupService } from '@/services/BeneficiaryGroupService'
import type { IncomingApiData, FormValue, OutgoingApiData } from '@/models/BeneficiaryGroup'
import { useAuthStore } from './auth'
import Beneficiary from '@/models/Beneficiary'
import { useRouter } from 'vue-router'
import axiosInstance from '@/utils/axios'

export const useBeneficiaryGroupStore = defineStore('beneficiary_group', () => {
    const beneficiary_group = ref<IncomingApiData[]>([])
    const pagination = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')
    const router = useRouter()
    const auth = useAuthStore()

  // Kolom dinamis berdasarkan properti dari IncomingApiData
    const columns = computed(() => {
        if (!beneficiary_group.value.length) return []
        const sampleAgency = beneficiary_group.value[0]
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

    const fetchData = async (page: number = 1,per_page:number = 10, search: string = '', instansi_id: string = '',bantuan_sosial_id: string = '',status: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await beneficiaryGroupService.getAll(page,per_page, search, instansi_id, router.currentRoute.value.params?.id as string ?? bantuan_sosial_id, status)
            beneficiary_group.value = response.data.data
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
            const formData = new FormData()
            formData.append('status', data['status'])
            formData.append('tanggal_penerimaan', data['tanggal_penerimaan'])
            formData.append('_method', 'PUT') // Menambahkan metode PUT ke data
            
            const response = await beneficiaryGroupService.update(id, formData)
            fetchData(pagination.value?.current_page || 1)
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
            const response = await beneficiaryGroupService.show(id)
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
            await beneficiaryGroupService.deleteMultiple(ids); // Gunakan API multi-delete baru
            beneficiary_group.value = beneficiary_group.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
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
            await beneficiaryGroupService.delete(id)
            beneficiary_group.value = beneficiary_group.value.filter(i => i.id !== id)
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
        beneficiary_group,
        pagination,
        loading,
        error,
        searchQuery,
        filterQuery,
        columns,
        fetchData,
        deleteMultipleData,
        updateData,
        deleteData,
        showData,
        setSearchQuery,
        setFilterQuery,
        exportData
    }
})
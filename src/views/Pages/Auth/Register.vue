<template>
    <div>
        <h1 class="text-2xl font-semibold mb-2">Registrasi</h1>
        <h1 class="text-md">Daftarkan Instansi Anda!</h1>
    </div>
    <el-divider />    
        <el-form 
            :model="form" 
            label-width="auto" 
            class="demo-ruleForm"
            :rules="rules"
            status-icon
            ref="ruleFormRef"
            @submit.prevent="onSubmit"
        >
            <template v-if="step == 1">
                <label id="el-id-4654-13" for="el-id-4654-17" class="block mb-2 text-sm font-medium text-gray-900">Pilih Jenis Instansi</label>
                
                <el-radio-group v-model="selectTingkatan" class="mb-4">
                    <el-radio-button value="desa" size="default" border>Desa</el-radio-button>
                    <el-radio-button value="kecamatan" size="default" border>Kecamatan</el-radio-button>
                    <el-radio-button value="kabupaten" size="default" border>Kabupaten</el-radio-button>
                    <el-radio-button value="provinsi" size="default" border>Provinsi</el-radio-button>
                </el-radio-group>
                <template v-if="selectTingkatan">
                    <template v-if="selectTingkatan != 'provinsi'">
                        <el-form-item label="Pilih Kabupaten" prop="regencies" label-position="top">
                        <el-select v-model="selectRegencies" placeholder="Pilih Kabupaten">
                            <el-option :label="item.name" :value="item.id" v-for="item in regencies" :key="item.id" />                        
                        </el-select>
                        </el-form-item>
                    </template>                    
                    <template v-if="selectRegencies && (selectTingkatan == 'desa' || selectTingkatan == 'kecamatan')">
                        <el-form-item label="Pilih Kecamatan" prop="districts" label-position="top">
                        <el-select v-model="selectDistricts" placeholder="Pilih Kecamatan">
                            <el-option :label="item.name" :value="item.id" v-for="item in districts" :key="item.id" />                        
                        </el-select>
                        </el-form-item>
                    </template>
                    <template v-if="selectDistricts && selectTingkatan == 'desa'">
                        <el-form-item label="Pilih Desa" prop="districts" label-position="top">
                        <el-select v-model="selectVillages" placeholder="Pilih Desa">
                            <el-option :label="item.name" :value="item.id" v-for="item in villages" :key="item.id" />                        
                        </el-select>
                        </el-form-item>
                    </template>
                    <el-form-item v-if="selectTingkatan != 'desa'" label="Nama Instansi" label-position="top" prop="nama_instansi">
                        <el-input v-model="form.nama_instansi" placeholder="Masukkkan Nama Instansi ..." />
                    </el-form-item>
                </template>               

            </template>
            <template v-else-if="step == 2">
                <el-form-item label="Pilih Bidang" prop="nama_bidang" label-position="top">
                    <el-select v-model="form.nama_bidang" placeholder="Pilih Bidang">
                        <el-option label="Keuangan" value="Keuangan" />
                        <el-option label="Umum dan Perencanaan" value="Umum dan Perencanaan" />
                        <el-option label="Pelayanan dan Kesejahteraan" value="Pelayanan dan Kesejahteraan" />
                        <el-option label="Pemerintahan" value="Pemerintahan" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Nama Lengkap" label-position="top" prop="nama_lengkap">
                    <el-input 
                        v-model="form.nama_lengkap" 
                        placeholder="Masukkkan Nama Lengkap ..." 
                    />
                </el-form-item>
                <el-form-item label="Email" label-position="top" prop="email">
                    <el-input v-model="form.email" placeholder="Masukkkan Email ..." />
                </el-form-item>
                <el-form-item label="Password" label-position="top" prop="password">
                    <el-input v-model="form.password" type="password" show-password placeholder="Masukkkan Password ..." />
                </el-form-item>   
                <div class="mt-4 flex justify-end">
                    <el-button type="primary" :loading="isLoading" class="bg-primary block w-full" native-type="submit">Daftar</el-button>     
                </div>
            </template>
        </el-form>
    
    <div :class="['flex', step === 1 ? 'justify-end' : 'justify-between', 'mt-4']">
        <el-button class="ml-0" :icon="ArrowLeft" circle @click="prevStep" v-if="step > 1" />
        <el-button class="mr-0" type="primary" :icon="ArrowRight" circle @click="nextStep" v-if="step < 2" />
    </div>

    <el-divider />
    <div class="text-center">
        Telah memiliki akun? <router-link class="font-bold text-primary" to="/auth/login">Masuk</router-link>    

    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive,ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
    ArrowRight,
    ArrowLeft
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { authService } from '@/services/AuthService'
import type { RegisterForm } from '@/types/registerForm'
import { useRegionStore } from '@/stores/region'

const ruleFormRef = ref<FormInstance>();
const router = useRouter()
const selectTingkatan = ref('')
const selectRegencies = ref('')
const selectDistricts = ref('') 
const selectVillages = ref('')

const regionStore = useRegionStore()
const regencies = computed(() => regionStore.regencies)
const districts = computed(() => regionStore.districts)
const villages = computed(() => regionStore.villages)

const selectedVillage = computed(() => {
    if (selectVillages.value) {
        return villages.value.find((village: any) => village.id === selectVillages.value);
    }
    return null;
});

onMounted(() => {
    regionStore.fetchRegencies()
});

watch(() => selectRegencies.value, () => {
    if (selectRegencies.value) {
        regionStore.fetchDistricts(selectRegencies.value)
    }
})

watch(() => selectDistricts.value, () => {
    if (selectDistricts.value) {
        regionStore.fetchVillages(selectDistricts.value)
    }
})

const form = reactive<RegisterForm>({
    nama_instansi:'',
    kode_instansi:'',
    alamat:'',
    tingkatan:'',
    nama_bidang:'',
    nama_lengkap:'',
    email:'',
    password:'',
})

const rules = reactive<FormRules<RegisterForm>>({
    nama_instansi: [
        { required: true, message: 'Nama Desa harus diisi', trigger: 'blur' },
    ],
    kode_instansi: [
        { required: true, message: 'Kode Desa harus diisi', trigger: 'blur' },
    ],
    alamat: [
        { required: true, message: 'Alamat Desa harus diisi', trigger: 'blur' },
    ],
    nama_bidang: [
        { required: true, message: 'Bidang harus diisi', trigger: 'blur' },
    ],
    nama_lengkap: [
        { required: true, message: 'Nama Lengkap harus diisi', trigger: 'blur' },
    ],
    email: [
        { required: true, type: 'email', message: 'Email harus valid', trigger: 'blur' },
    ],
    password: [
        { required: true, message: 'Password harus diisi', trigger: 'blur' },
    ]
})

const step = ref(1)
const isLoading = ref(false)

const nextStep = () => {
    step.value++    
}

const prevStep = () => {
    step.value--
}
const onSubmit = async () => {
    if (!ruleFormRef.value) {
        console.error('Form instance tidak tersedia.')
        return
    }
    isLoading.value = true
    try {
        await ruleFormRef.value.validate((valid: boolean, errors: any) => { // Gunakan callback
        if (valid) {
            if(selectTingkatan.value == 'desa') {
                if (selectedVillage.value) {
                    form.nama_instansi = `Pemerintah Desa ${selectedVillage.value.name}`; // Nama desa
                    form.kode_instansi = String(selectedVillage.value.id); // ID desa
                }
            } else if(selectTingkatan.value == 'kecamatan') {
                form.kode_instansi = String(selectDistricts.value)
            } else if(selectTingkatan.value == 'kabupaten') {
                form.kode_instansi = String(selectRegencies.value)
            }
            form.tingkatan = selectTingkatan.value // Tingkatan instansi
            form.alamat = `Alamat ${form.nama_instansi}` // Alamat instansi
            authService.register(form).then((response) => {            
                router.push('/auth/login')
            }).catch((error) => {
                console.error('Gagal registrasi:', error.message)
            }).finally(() => {
                isLoading.value = false
            })
        } else {
            console.error('Validasi gagal:', errors)
            isLoading.value = false
        }
        })
    } catch (error) {
        isLoading.value = false
        console.error('Error validasi:', error)
    }
}
</script>
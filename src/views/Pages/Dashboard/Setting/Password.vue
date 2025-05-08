<template>
    <el-row :gutter="20">
        <el-col :span="6">
            <el-card class="flex flex-col items-center justify-center" shadow="never">
                <div class="flex justify-center">
                    <el-avatar :size="120" />
                </div>
                <div class=" mt-4">
                    <div class="flex w-full flex-col items-center justify-center gap-4">
                        <router-link :to="{ name: 'Pengaturan Profile' }">
                            <el-button plain class="w-full">Perbarui Profil</el-button>
                        </router-link>
                        <router-link :to="{ name: 'Pengaturan Password' }">
                            <el-button plain type="primary" class="w-full !ml-0">Ganti Password</el-button>
                        </router-link>
                    </div>
                </div>
            </el-card>
        </el-col>
        <el-col :span="18">
            <el-card shadow="never" class="w-full">
                <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
                    <div class="w-full lg:w-1/2 md:w-1/2">
                        <h1 class="text-xl font-semibold">Ubah Password</h1>
                    </div>
                </div>
                <el-divider></el-divider>
                <el-form :model="passwords" label-width="200px" label-position="left">
                    <el-form-item label="Password Lama" label-position="left">
                        <el-input v-model="passwords.password_lama" type="password" />
                    </el-form-item>
                    <el-form-item label="Password Baru" label-position="left">
                        <el-input v-model="passwords.password_baru" type="password" />
                    </el-form-item>
                    <el-form-item label="Konfirmasi Password" label-position="left">
                        <el-input v-model="passwords.konfirmasi_password" type="password" />
                    </el-form-item>
                </el-form>
                <div class="flex justify-end">
                    <el-button type="primary" @click="store.changePassword(passwords)">Simpan</el-button>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { ref, watch, computed, defineEmits, onMounted } from 'vue'
import { useUserAgencyStore } from '@/stores/user_agency'
import { useAuthStore } from '@/stores/auth'

const store = useUserAgencyStore() // Gunakan store
const authStore = useAuthStore()
const auth = computed(() => authStore.user)
const user_agency = ref<any>(null)
const passwords = ref<{
    password_lama: string;
    password_baru: string;
    konfirmasi_password: string;
}>({
    password_lama: '',
    password_baru: '',
    konfirmasi_password: ''
})


onMounted(() => {
    console.log(auth.value);

    store.showData(Number(auth.value?.anggota_instansi?.id)).then(response => user_agency.value = response)
})
</script>

<style lang="scss" scoped></style>
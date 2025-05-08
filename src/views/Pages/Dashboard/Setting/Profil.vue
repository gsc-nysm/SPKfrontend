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
                            <el-button plain type="primary" class="w-full">Perbarui Profil</el-button>
                        </router-link>
                        <router-link :to="{ name: 'Pengaturan Password' }">
                            <el-button plain class="w-full !ml-0">Ganti Password</el-button>
                        </router-link>
                    </div>
                </div>
            </el-card>
        </el-col>
        <el-col :span="18">
            <el-card shadow="never" v-if="user_agency" class="w-full">
                <div class="mb-4 flex lg:flex-row md:flex-row gap-4 flex-col justify-between items-center">
                    <div class="w-full lg:w-1/2 md:w-1/2">
                        <h1 class="text-xl font-semibold">Profil Pengguna</h1>
                    </div>
                </div>
                <el-divider></el-divider>
                <el-form :model="user_agency" label-width="200px" label-position="left">
                    <el-form-item label="Nama Lengkap" label-position="left">
                        <el-input v-model="user_agency.nama_lengkap" />
                    </el-form-item>
                    <el-form-item label="Email" label-position="left">
                        <el-input v-model="user_agency.user_id.email" />
                    </el-form-item>
                    <el-form-item label="No. Telepon" label-position="left">
                        <el-input v-model="user_agency.no_hp" />
                    </el-form-item>
                </el-form>
                <div class="flex justify-end">
                    <el-button type="primary"
                        @click="store.updateProfile(user_agency.id, user_agency)">Simpan</el-button>
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


onMounted(() => {
    console.log(auth.value);

    store.showData(Number(auth.value?.anggota_instansi?.id)).then(response => user_agency.value = response)
})
</script>

<style lang="scss" scoped></style>
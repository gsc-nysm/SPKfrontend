<template>
    <div>
        <h1 class="text-2xl font-semibold text-black dark:text-black">Masuk</h1>
        <h1 class="text-md text-black dark:text-black">Akses Bantuan Sosial Kamu!</h1>
    </div>
    <el-divider />
    <el-form ref="ruleFormRef" :model="form" label-width="auto" @keydown.enter="handleEnterKey" :rules="rules"
        class="demo-ruleForm" status-icon>

        <el-form-item label="Email" label-position="top" prop="email">
            <el-input v-model="form.email" placeholder="Masukkkan Email ..." />
        </el-form-item>
        <el-form-item label="Password" label-position="top" prop="password">
            <el-input v-model="form.password" type="password" placeholder="Masukkan Password ..." show-password />
        </el-form-item>
    </el-form>
    <div class="mt-4 flex justify-end">
        <el-button type="primary" :loading="isLoading" class="block w-full" @click="onSubmit" native-type="submit"
            ref="loginButton">
            Masuk
        </el-button>
    </div>
    <el-divider />
    <div class="text-center text-black dark:text-black">
        Belum memiliki akun? <router-link class="font-bold text-primary" to="/auth/register">Daftar</router-link>

    </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { ElButton, FormInstance, FormRules } from 'element-plus'
import { authService } from '@/services/AuthService'
import { useRouter } from 'vue-router'

const ruleFormRef = ref<FormInstance>();
const loginButton = ref<InstanceType<typeof ElButton> | null>(null);


const isLoading = ref(false)
const router = useRouter()

interface RuleForm {
    email: string
    password: string
}

const form = reactive<RuleForm>({
    email: '',
    password: ''
});

const handleEnterKey = (event: any) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Mencegah behavior default
        loginButton.value?.$el.click(); // Trigger klik pada tombol Hapus       
    }
};

const onSubmit = async () => {
    if (!ruleFormRef.value) {
        console.error('Form instance tidak tersedia.')
        return
    }
    isLoading.value = true
    try {
        await ruleFormRef.value.validate((valid: boolean, errors: any) => { // Gunakan callback
            if (valid) {
                authService.login(form.email, form.password).then((response) => {
                    router.push({ name: 'dashboard' })
                }).catch((error) => {
                    console.error('Gagal registrasi:', error.message)
                    isLoading.value = false
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

const rules = reactive<FormRules<RuleForm>>({
    email: [
        { required: true, type: 'email', message: 'Email harus valid', trigger: 'blur' },
    ],
    password: [
        { required: true, message: 'Password harus diisi', trigger: 'blur' },
    ]
})
</script>
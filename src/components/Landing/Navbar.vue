<template>
    <div class="header">
        <div class="grid grid-cols-2 items-center sm:p-4 px-4 lg:py-0 lg:px-24 sm:px-4 p-0 w-full">
            <div>
                <div class="logo">
                    <img src="@/assets/logo.png" alt="Layak-in Logo" class="w-24">
                </div>
            </div>
            <div>
                <el-menu :default-active="activeMenu" mode="horizontal"
                    class="border-bottom-none w-full flex justify-end">
                    <el-menu-item index="1">Beranda</el-menu-item>
                    <el-menu-item index="2">Fitur</el-menu-item>
                    <el-menu-item index="3">Testimonial</el-menu-item>
                    <el-menu-item index="4">Kontak</el-menu-item>
                    <el-menu-item index="5">
                        <el-button type="primary" @click="handleLogin" :icon="User" round>{{ isLoggedIn ?
                            'Dashboard' : 'Masuk' }}</el-button>
                    </el-menu-item>
                </el-menu>
            </div>
        </div>
    </div>
</template>

<script setup>
import { User } from '@element-plus/icons-vue';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();

const handleLogin = () => {
    // Logic to handle login
    router.push({ name: 'login' });
};

// cek apakah user sudah login
const authStore = useAuthStore();
const isLoggedIn = ref(false);
const activeMenu = ref('1');
const checkLoginStatus = () => {
    if (authStore.isLoggedIn) {
        isLoggedIn.value = true;
    } else {
        isLoggedIn.value = false;
    }

    console.log('User login status:', authStore.user);


};
// Watch for changes in authStore.user
watch(() => authStore.user, () => {
    checkLoginStatus();
})

onMounted(() => {
    checkLoginStatus();
});
</script>

<style scoped>
.logo {
    display: flex;
    align-items: center;
}

.logo-text {
    font-size: 1.5em;
    font-weight: bold;
    color: #333;
}

.el-menu--horizontal.el-menu {
    background-color: transparent;
    border: none;
}
</style>
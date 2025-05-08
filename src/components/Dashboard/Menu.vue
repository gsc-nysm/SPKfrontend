<template>
    <el-menu :collapse="isCollapse" router @select="handleSelect">
        <div class="logo p-6 flex justify-center">
            <a href="/" target="_blank" rel="noopener noreferrer">
                <img src="@/assets/logo.png" width="100px" alt="">
            </a>
        </div>
        <template v-if="auth?.role?.name === 'admin'">
            <el-menu-item :index="menu.title" v-for="menu in menu_admin" :key="menu.title" :route="menu.route">
                <el-icon>
                    <component :is="menu.icon" />
                </el-icon>
                <template #title>{{ menu.title }}</template>
            </el-menu-item>
        </template>
        <template v-else-if="auth?.role?.name === 'verifikator'">
            <el-menu-item :index="menu.title" v-for="menu in menu_verifikator" :key="menu.title">
                <el-icon>
                    <component :is="menu.icon" />
                </el-icon>
                <template #title>{{ menu.title }}</template>
            </el-menu-item>
        </template>
        <template v-else-if="auth?.role?.name === 'validator'">
            <el-menu-item :index="menu.title" v-for="menu in menu_validator" :key="menu.title" :route="menu.route">
                <el-icon>
                    <component :is="menu.icon" />
                </el-icon>
                <template #title>{{ menu.title }}</template>
            </el-menu-item>
        </template>

    </el-menu>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { IncomingUser } from '@/models/User';
import { useRoute, useRouter } from 'vue-router';
import { useSocialAssistanceStore } from '@/stores/social_assistance';

const store = useAuthStore();
const socialAssistanceStore = useSocialAssistanceStore();
const auth = computed<IncomingUser | null>(() => store.user);


// Props agar bisa collapse saat di sidebar
defineProps({
    isCollapse: Boolean,
});

// Router dan Route
const router = useRouter();
const route = useRoute();

// State untuk menu aktif
const activeIndex = ref<string>('Dashboard');

// State untuk program bantuan yang dipilih
const social_assistance_selected = computed(() => {
    const id = Number(route.params.id);
    return socialAssistanceStore.social_assistances.find((assistance: any) => assistance.id === id) || null;
});

const menu_admin = [
    {
        icon: 'house',
        title: 'Dashboard',
        route: '/dashboard'
    },
    {
        icon: 'User',
        title: 'Kelola Instansi',
        route: '/agency'
    },
]

const menu_verifikator = [
    {
        icon: 'house',
        title: 'Dashboard ',
        route: (id: string | number) => `/social-assistance/${id}`,
    },
    {
        icon: 'Paperclip',
        title: 'Kriteria Bantuan',
        route: (id: string | number) => `/social-assistance/${id}/criteria`,
    },
    {
        icon: 'DocumentCopy',
        title: 'Periode Pendaftaran',
        route: (id: string | number) => `/social-assistance/${id}/registration-period`,
    },
    {
        icon: 'Promotion',
        title: 'Kelola Pengajuan',
        route: (id: string | number) => `/social-assistance/${id}/manage-submission`,
    },
    {
        icon: 'List',
        title: 'Kelola Penilaian',
        route: (id: string | number) => `/social-assistance/${id}/manage-evaluation`,
    },
    {
        icon: 'User',
        title: 'Kelola Penerima Bantuan',
        route: (id: string | number) => `/social-assistance/${id}/manage-beneficiary`,
    },
    {
        icon: 'Setting',
        title: 'Pengaturan',
        route: (id: string | number) => `/setting/profile`,
    },
]

const menu_validator = [
    {
        icon: 'house',
        title: 'Dashboard',
        route: '/dashboard',
    },
    {
        icon: 'Promotion',
        title: 'Pengajuan',
        route: '/submission',
    },
    {
        icon: 'Files',
        title: 'Kelola Pengajuan ',
        route: '/submission-history',
    },
    {
        icon: 'List',
        title: 'Penilaian ',
        route: '/evaluation',
    },
    {
        icon: 'User',
        title: 'Penerima Bantuan ',
        route: '/beneficiary-group',
    },
    {
        icon: 'Setting',
        title: 'Pengaturan',
        route: '/setting/profile',
    },
]

// Fungsi untuk menangani seleksi menu
const handleSelect = (index: string) => {
    const menu = menu_admin.find((m) => m.title === index) || menu_verifikator.find((m) => m.title === index);
    if (menu) {
        if (typeof menu.route === 'function') {
            // Untuk rute dinamis, gunakan id dari social_assistance_selected
            if (social_assistance_selected.value) {
                const id = social_assistance_selected.value.id;
                router.push(menu.route(id));
            } else if (auth.value?.role?.name === 'verifikator') {
                // Jika tidak ada social_assistance_selected.value, arahkan ke halaman dashboard untuk memilih kembali bantuan sosialnya
                router.push('/dashboard');
            }
            // const id = social_assistance_selected.value?.id || '1'; // Default ke '1' jika belum ada
            // router.push(menu.route(id));
        } else {
            // Untuk rute statis
            router.push(menu.route);
        }
        activeIndex.value = index; // Perbarui activeIndex
    }
};

// Perbarui activeIndex berdasarkan rute saat ini
const updateActiveIndex = () => {
    const path = route.path;
    const menu = menu_admin.find((m) => m.route === path) || menu_verifikator.find((m) => {
        if (typeof m.route === 'function') {
            const id = route.params.id;
            return id && m.route(String(id)) === path;
        }
        return m.route === path;
    });
    activeIndex.value = menu ? menu.title : 'Dashboard';
};

// Watch perubahan rute untuk memperbarui activeIndex
watch(() => route.path, () => {
    updateActiveIndex();
});

// Inisialisasi activeIndex saat komponen dimount
onMounted(() => {
    updateActiveIndex();
});
</script>
<template>
    <el-menu :collapse="isCollapse" :default-active="activeIndex" style="border-right: none;">
        <div class="logo p-6 flex justify-center">
            <a href="/" target="_blank" rel="noopener noreferrer">
                <img src="../../assets/Logo.png" width="100px" alt="">
            </a>
        </div>

        <template v-if="auth?.role?.name === 'admin'">
            <el-menu-item :index="menu.route" v-for="menu in menu_admin" :key="menu.title" @click="handleSelect(menu)">
                <el-icon>
                    <component :is="menu.icon" />
                </el-icon>
                <template #title>{{ menu.title }}</template>
            </el-menu-item>
        </template>

        <template v-else-if="auth?.role?.name === 'verifikator'">
            <el-menu-item :index="generateRoute(menu)" v-for="menu in menu_verifikator" :key="menu.title"
                @click="handleSelect(menu)">
                <el-icon>
                    <component :is="menu.icon" />
                </el-icon>
                <template #title>{{ menu.title }}</template>
            </el-menu-item>
        </template>

        <template v-else-if="auth?.role?.name === 'validator'">
            <el-menu-item :index="menu.route" v-for="menu in menu_validator" :key="menu.title"
                @click="handleSelect(menu)">
                <el-icon>
                    <component :is="menu.icon" />
                </el-icon>
                <template #title>{{ menu.title }}</template>
            </el-menu-item>
        </template>

    </el-menu>
</template>

<script setup lang="ts">
import { computed, defineProps, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { IncomingUser } from '@/models/User';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus'; // Impor ElMessage untuk notifikasi

const store = useAuthStore();
const auth = computed<IncomingUser | null>(() => store.user);

defineProps({
    isCollapse: Boolean,
});

const router = useRouter();
const route = useRoute();

const social_assistance_id = computed(() => route.params.id || null);

// State untuk menu aktif, sekarang di-set berdasarkan path
const activeIndex = ref<string>(route.path);

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
        icon: 'List',
        title: 'Cari Penerima Bantuan',
        route: `/search-beneficiary`,
    },
    {
        icon: 'List',
        title: 'Kelola Berita',
        route: `/news`,
    },
    {
        icon: 'Setting',
        title: 'Pengaturan',
        route: `/setting/profile`,
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

// Fungsi baru untuk menghasilkan route path dinamis (jika ada) untuk 'index'
const generateRoute = (menu: any) => {
    if (typeof menu.route === 'function') {
        // Jika id ada, buat path lengkap. Jika tidak, kembalikan null atau placeholder.
        return social_assistance_id.value ? menu.route(social_assistance_id.value) : `#${menu.title}`;
    }
    return menu.route;
};


// Fungsi handleSelect yang telah diperbaiki
const handleSelect = (menu: { title: string, route: string | Function }) => {
    let pathToGo: string;

    if (typeof menu.route === 'function') {
        // Logika untuk route yang butuh ID
        if (social_assistance_id.value) {
            pathToGo = menu.route(social_assistance_id.value);
        } else {
            // Jika ID tidak ada, beri peringatan dan alihkan ke dashboard
            ElMessage({
                message: 'Silakan pilih program bantuan sosial terlebih dahulu.',
                type: 'warning',
            });
            router.push('/dashboard');
            return; // Hentikan eksekusi lebih lanjut
        }
    } else {
        // Logika untuk route statis
        pathToGo = menu.route as string;
    }

    // Hanya navigasi jika path tujuan tidak sama dengan path saat ini
    if (route.path !== pathToGo) {
        router.push(pathToGo);
    }
};

// Watch perubahan rute untuk memperbarui activeIndex
watch(() => route.path, (newPath) => {
    activeIndex.value = newPath;
}, { immediate: true }); // 'immediate: true' akan menjalankan watcher saat komponen dimuat

</script>
<template>
    <el-menu
        class="el-menu-demo menu-container"
        style="border:none"
        mode="horizontal"
        :ellipsis="false"
        :popper-offset="16"
    >
        <!-- Tombol Toggle Sidebar -->
        <el-menu-item index="0" v-if="!isMobile">
            <el-button text class="toggle-btn" @click="toggleSidebar.toggle()">
                <el-icon v-if="toggleSidebar.drawer"><Plus /></el-icon>
                <el-icon v-else><Minus /></el-icon>
            </el-button>
        </el-menu-item>

        <!-- Bagian Tengah: Judul -->
        <div class="menu-title" @click="handleModal()" v-if="auth?.role?.name === 'verifikator'">
            <el-sub-menu index="1">
                <template #title>
                    <div class="menu-title-text">{{ social_assistance_selected?.nama_bantuan || 'Pilih Program Bantuan' }}</div>
                </template>
                <el-menu-item @click="handleSelect(item)" v-for="item in social_assistance" :key="item.id">
                    {{ item.nama_bantuan }}
                </el-menu-item>
            </el-sub-menu>
        </div>

        <!-- Bagian Kanan: Profil -->
        <div class="menu-right">
            <el-sub-menu index="2">
                <template #title>
                    <div class="profile-info">
                        <div v-if="!isMobile" class="profile-text">
                            <template v-if="auth?.role?.name === 'admin'">
                                <div class="profile-name">{{ auth.name }}</div>
                                <div class="profile-role">{{ auth.name }}</div>
                            </template>
                            <template v-else>
                                <div class="profile-name">{{ auth?.name }}</div>
                                <div class="profile-role">{{ auth?.instansi?.nama_instansi }}</div>
                            </template>
                        </div>
                        <el-avatar :size="30" :src="circleUrl" />
                    </div>
                </template>
                <el-menu-item index="2-1">Profile</el-menu-item>
                <el-menu-item index="2-2" @click="logout">Logout</el-menu-item>
            </el-sub-menu>
        </div>
    </el-menu>
    <ModalSocialAssitance 
        v-if="auth?.role?.name === 'verifikator'" 
        v-model:visible="visible" 
        :data="social_assistance" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useToggleSidebar } from '@/stores/toggleSidebar';
import { Minus, Plus } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { IncomingUser } from '@/models/User';
import ModalSocialAssitance from './ModalSocialAssitance.vue';
import { useSocialAssistanceStore } from '@/stores/social_assistance';
import type { IncomingApiData } from '@/models/SocialAssistance';
import { useProgramStore } from '@/stores/program_selected';

// State dan Store
const toggleSidebar = useToggleSidebar();
const isMobile = ref(window.innerWidth <= 768);
const circleUrl = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');
const store = useAuthStore();
const program_selected = useProgramStore();
const socialAssistanceStore = useSocialAssistanceStore();
const social_assistance = computed(() => socialAssistanceStore.social_assistances);

const router = useRouter();
const route = useRoute(); // Gunakan useRoute untuk rute reaktif
const programActive = ref<number | null>(null);
const auth = computed<IncomingUser | null>(() => store.user);
const visible = ref(route.params.id ? false : true);
const social_assistance_selected = ref<IncomingApiData | null>(null);

// Fetch data sosial bantuan
const fetchSocialAssistance = async () => {
    try {
        
        await socialAssistanceStore.fetchData(1);
        updateSelectedAssistance(); // Perbarui social_assistance_selected setelah fetch
    } catch (error) {
        console.error('Error fetching social assistance:', error);
    }
};

// Fungsi untuk memperbarui social_assistance_selected berdasarkan params.id
const updateSelectedAssistance = () => {
    const id = Number(route.params.id);
    program_selected.setProgramActive(id)
    // programActive.value = isNaN(id) ? null : id;
    social_assistance_selected.value = social_assistance.value.find((assistance: IncomingApiData) => assistance.id === program_selected.programActive) || null;
};

// Watch perubahan rute untuk memperbarui social_assistance_selected
watch(() => route.params.id, () => {
    updateSelectedAssistance();
});

const logout = () => {
    try {
        store.logout();
        router.push({ name: 'login' });
    } catch (err) {
        console.error(err);
    }
};

const handleModal = async () => {
    visible.value = !visible.value;
    if (visible.value && social_assistance.value.length === 0) {
        await fetchSocialAssistance();
    }
};

const replaceIdInPath = (currentPath: string, currentId: string, newId: string): string => {
    // Ganti currentId dengan newId di path
    const regex = new RegExp(`/social-assistance/${currentId}(/|$)`);
    return currentPath.replace(regex, `/social-assistance/${newId}$1`);
};

const handleSelect = (item: IncomingApiData) => {
    const currentPath = route.path;
    const currentId = route.params.id?.toString();
    const targetId = item.id.toString();
    
    if(currentPath == '/dashboard'){
        router.push(`/social-assistance/${item.id}`).then(() => {
            program_selected.setProgramActive(item.id);
        })
    }else {
        const newPath = replaceIdInPath(currentPath, currentId, targetId);
        router.push(newPath).then(() => {
            program_selected.setProgramActive(item.id); // Sinkronisasi store setelah navigasi
        });
    }
    
};

// Fetch data saat komponen dimount
onMounted(async () => {
    if(auth.value?.role?.name === 'verifikator'){
        await fetchSocialAssistance();
    }
});
</script>

<style scoped>
.menu-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.menu-title {
    flex: 2;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.menu-title-text {
    font-weight: bold;
    font-size: 16px;
}

.menu-right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.profile-info {
    display: flex;
    align-items: center;
    gap: 4px;
}

.profile-text {
    display: flex;
    flex-direction: column;
    font-size: 12px;
}

.profile-name {
    font-weight: bold;
    line-height: 16px;
}

.profile-role {
    color: gray;
    font-size: 10px;
    line-height: 16px;
}
</style>
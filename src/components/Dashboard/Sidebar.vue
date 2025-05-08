<template>
    <div class="sidebar-container">
        <!-- Tombol Toggle untuk Mobile -->
        <el-button @click="drawerVisible = true" v-if="isMobile" class="toggle-btn">
            <el-icon><Plus /></el-icon>
        </el-button>

        <!-- Sidebar untuk Desktop -->
        <Menu style="border:none" v-if="!isMobile" :collapse="toggleSidebar.drawer"  :isCollapse="toggleSidebar.drawer" />        

        <!-- Drawer untuk Mobile -->
        <el-drawer v-model="drawerVisible" lock-scroll size="70%" direction="ltr">
            <Menu :isCollapse="false" />
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useToggleSidebar } from '@/stores/toggleSidebar';
import Menu from './Menu.vue';
import { Plus } from '@element-plus/icons-vue';

const toggleSidebar = useToggleSidebar();

const activeIndex = ref('1')
const drawerVisible = ref(false);

// Toggle Drawer
const toggleDrawer = () => {
    drawerVisible.value = !drawerVisible.value;
};

const isCollapse = ref(window.innerWidth <= 768); // Default collapse jika layar kecil
const isMobile = ref(window.innerWidth <= 768); // Mode mobile


// Fungsi untuk cek ukuran layar (responsive)
const checkScreenSize = () => {
    isMobile.value = window.innerWidth <= 768;
    isCollapse.value = isMobile.value; // Otomatis collapse jika di mobile
};

// Pasang event listener untuk resize
onMounted(() => {
    window.addEventListener("resize", checkScreenSize);
});

onUnmounted(() => {
    window.removeEventListener("resize", checkScreenSize);
});

const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath);
};

const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath);
};
</script>

<style scoped>
.sidebar-container {
    display: flex;
    align-items: center;
}

/* Tombol toggle */
.toggle-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
}

.el-menu {
    min-height: 100vh;
}

/* Atur ukuran sidebar */
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 100vh;
}

/* Responsif: Sidebar kecil di tampilan mobile */
@media (max-width: 768px) {
    .el-menu-vertical-demo {
    width: 64px;
     /* Ukuran minimal sidebar */
    }
    .el-menu {
        min-height: auto;
    }
}
</style>

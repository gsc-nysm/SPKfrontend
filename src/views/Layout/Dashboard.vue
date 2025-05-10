<template>
    <div class="common-layout bg-gray-50">
        <el-container>
            <el-aside width="auto">
                <Sidebar />
            </el-aside>
            <el-container style="height:100vh">
                <el-header class="bg-white">
                    <Navbar />
                </el-header>
                <el-main class="bg-gray-50">
                    <Breadcrumb />
                    <router-view :key="$route.path"></router-view>
                </el-main>
                <el-footer class="bg-gray-50">
                    <Footer></Footer>
                </el-footer>
            </el-container>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Dashboard/Sidebar.vue'
import Navbar from '@/components/Dashboard/Navbar.vue';
import Footer from '@/components/Dashboard/Footer.vue';
import Breadcrumb from '@/components/Dashboard/Breadcrumb.vue';
</script>

<style></style>
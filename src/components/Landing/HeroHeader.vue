<template>
    <section class="hero-section">
        <el-row :gutter="40" class="px-24" type="flex" align="middle">
            <el-col :span="24" class="text-center">
                <h1 class="hero-title">Optimalkan Bantuan Sosial dengan Layak-in</h1>
                <p class="hero-subtitle">
                    Platform terpercaya untuk mengelola bantuan sosial secara transparan, efisien, dan adil.
                </p>
                <el-button type="primary" size="large" :icon="ArrowRight" @click="$router.push('/auth/register')">Daftar
                    Sekarang</el-button>
            </el-col>
        </el-row>
    </section>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue';


</script>

<style scoped>
/* Hero Section */
.hero-section {
    padding: 150px 20px;
    background-color: #f5f7fa;
    text-align: left;
}

.hero-title {
    font-size: 2.5em;
    color: #333;
    margin-bottom: 20px;
}

.hero-subtitle {
    font-size: 1.2em;
    color: #666;
    margin-bottom: 30px;
}

.hero-button {
    background-color: #409eff;
    border: none;
}

.hero-image {
    width: 100%;
    max-width: 500px;
    height: auto;
}
</style>
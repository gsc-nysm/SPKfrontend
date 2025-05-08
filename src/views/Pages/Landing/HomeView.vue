<template>
  <div class="landing-page">
    <!-- Header / Navbar -->
    <Navbar />

    <!-- Hero Section -->
    <HeroHeader />

    <!-- Fitur Utama -->
    <section class="features-section px-24 py-16">
      <h2 class="section-title">Fitur Unggulan</h2>
      <el-row class="" :gutter="30">
        <el-col :span="8" v-for="(feature, index) in features" :key="index">
          <el-card shadow="hover" class="feature-card">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- Testimonial -->
    <section class="testimonial-section px-24 py-16">
      <h2 class="section-title">Apa Kata Pengguna Kami</h2>
      <el-carousel :interval="5000" type="card" height="250px">
        <el-carousel-item v-for="(testimonial, index) in testimonials" :key="index">
          <el-card class="testimonial-card">
            <p class="testimonial-text">{{ testimonial.text }}</p>
            <p class="testimonial-author">{{ testimonial.author }}</p>
          </el-card>
        </el-carousel-item>
      </el-carousel>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/Landing/Navbar.vue';
import HeroHeader from '@/components/Landing/HeroHeader.vue';
import Footer from '@/components/Landing/Footer.vue';
import { ArrowRight, Plus } from '@element-plus/icons-vue';
import { ref } from 'vue';

interface Feature {
  title: string;
  description: string;
}

interface Testimonial {
  text: string;
  author: string;
}

const activeMenu = ref<string>('1');

const features = ref<Feature[]>([
  {
    title: 'Pengelolaan Transparan',
    description: 'Kelola bantuan sosial dengan data yang jelas dan terbuka.',
  },
  {
    title: 'Efisiensi Tinggi',
    description: 'Proses cepat dan akurat dengan teknologi terbaru.',
  },
  {
    title: 'Akses Mudah',
    description: 'Akses kapan saja, di mana saja dengan antarmuka yang ramah.',
  },
]);

const testimonials = ref<Testimonial[]>([
  {
    text: 'Layak-in sangat membantu kami dalam mengelola bantuan sosial secara efisien!',
    author: 'Budi, Verifikator Desa',
  },
  {
    text: 'Antarmuka yang intuitif dan fitur yang sangat bermanfaat!',
    author: 'Siti, Pengelola Instansi',
  },
  {
    text: 'Proses penilaian jadi lebih transparan dan adil.',
    author: 'Ahmad, Penerima Bantuan',
  },
]);
</script>

<style scoped>
/* Features Section */
.features-section {
  background-color: #fff;
}

.section-title {
  text-align: center;
  font-size: 2em;
  color: #333;
  margin-bottom: 40px;
}

.feature-card {
  text-align: center;
  height: 200px;
}

.feature-card h3 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}

.feature-card p {
  color: #666;
}

/* Testimonial Section */
.testimonial-section {
  background-color: #f5f7fa;
}

.testimonial-card {
  text-align: center;
  padding: 20px;
}

.testimonial-text {
  font-size: 1.1em;
  color: #666;
  margin-bottom: 15px;
}

.testimonial-author {
  font-weight: bold;
  color: #333;
}
</style>
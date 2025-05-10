<template>
    <div class="h-screen flex items-center justify-center bg-gray-50">
        <div
            class="lg:w-[30rem] bg-white w-full border border-gray-200 flex items-center justify-center p-8 rounded-lg">
            <div class="w-full">
                <div class="card-header flex mb-4 justify-start items-center">
                    <router-link :to="{ name: 'homeview' }" class="flex items-center gap-2">
                        <el-button type="text" class="!p-0 !m-0 !border-none" :icon="ArrowLeft">
                        </el-button>
                        <img src="../../assets/Logo.png" alt="" width="100" />
                    </router-link>
                </div>
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue';


</script>

<style lang="scss" scoped></style>
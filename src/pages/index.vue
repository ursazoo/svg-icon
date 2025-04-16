<template>
    <div class="index">
        <Header title="首页" />
        <div class="content">
            <h1>首页</h1>
            <p>这是首页内容</p>
        </div>
    </div>
</template>

<script setup>
import Header from '../components/Header.vue';
</script>

<style lang="scss" scoped>
.index {
    background-color: #f0f0f0;
    .content {
        padding: 20px;
        background-color: #fff;
    }
}
</style>

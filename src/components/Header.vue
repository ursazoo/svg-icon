<template>
    <div class="header">
        <h1 @click="handleClick">{{ title || '默认的title' }}</h1>
    </div>
</template>

<script setup>

import { ref } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:title']);

const title = ref(props.title);

const handleClick = () => {
    emit('update:title', 'New Title');
};

</script>

<style scoped>
.header {
    background-color: #f0f0f0;
}
</style>
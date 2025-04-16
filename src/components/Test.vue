<template>
    <div class="test">
        <h1>Test</h1>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:title']);

onMounted(() => {
    console.log(props.title);
    setTimeout(() => {
        emit('update:title', 'New Title');
    }, 1000);
});

</script>
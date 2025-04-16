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
});

</script>
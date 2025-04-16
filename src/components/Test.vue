<template>
    <div class="test">
        <h1>Test</h1>
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

</script>
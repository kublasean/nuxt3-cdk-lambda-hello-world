<script setup lang="ts">
const { data } = await useFetch('/api/hello')
</script>

<template>
    <div>
        <h1>Hello World V2</h1>
        <p>Nuxt Lambda example</p>
        <pre>Data is {{ data }}</pre>
    </div>
</template>
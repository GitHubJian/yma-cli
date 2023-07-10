<template>
    <div>
        <h1>Hello</h1>
        <nav-bar />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import { NavBar } from "common/src/export/base";

export default defineComponent({
    components: {
        NavBar,
    },
});
</script>

<style >
h1 {
    color: red;
}
</style>
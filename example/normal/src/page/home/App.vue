<template>
    <div>
        {{ a }}
    </div>
</template>

<script lang="ts">
export default {
    name: 'APP',
    data() {
        return {
            a: 1,
            b: 2,
        };
    },
    created() {
        this.fetch();
    },
    watch: {
        a(newVal, oldVal) {
            debugger;
        },
    },
    methods: {
        fetch() {

        },
    },
};
</script>

<style>
div {
    color: red;
}
</style>

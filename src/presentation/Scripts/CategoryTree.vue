<template>
    <div>
        <CardList v-if="isGrouped">
        </CardList>
        <SelectableTree></SelectableTree>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
    import { Category } from '@/domain/Category';
    import { StatefulVue } from '@/presentation/StatefulVue';

    /** Shows content of single category or many categories */
    @Component
    export default class CategoryTree extends StatefulVue {
        @Prop() public data!: Category | Category[];
    }
</script>
<template>
  <div class="card-wall">
    <employee-item v-for="item in items" v-bind:key="item.id" v-bind:item="item" v-bind:is-show-all="isShowAll"></employee-item>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import EmployeeItem from './EmployeeItem.vue';

@Component({
    name: 'employee-list-simple',
    components: {
      EmployeeItem,
    }
})
export default class EmployeeListSimple extends Vue {

    @Prop() items!: any;

    @Prop() isShowAll!: boolean;

}

</script>

<style scoped lang="scss">

.card-wall {
    display: flex;
    width: 100vw;
    flex-wrap: wrap;
    padding: .75rem 0;
}

</style>
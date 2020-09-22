<template>
    <div class="grouped-wall" v-if="items.length > 0">
        <div v-for="state in getStates(!isShowAll)" v-bind:key="state.name">
            <div class="group-header">
                <h1>
                    <i class="material-icons">{{state.icon}}</i>
                    {{state.name}}
                    <small> ({{getItemCountByState(state.key)}})</small>
                </h1>
                <div class="strike"></div>
            </div>
            <div class="card-wall">
                <employee-item v-for="item in filterItemsByState(state.key)" v-bind:item="item" v-bind:key="item.id" v-bind:is-show-all="isShowAll"></employee-item>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import EmployeeItem from './EmployeeItem.vue';

@Component({
    name: 'employee-list-grouped',
    components: {
      EmployeeItem,
    }
})
export default class EmployeeListGrouped extends Vue {

    @Prop() items!: any;

    @Prop() isShowAll!: boolean;

    getStates(skipOptional = false): any[] {
        return ([
            {
                key: 'HOMEOFFICE',
                name: 'Im Homeoffice',
                icon: 'home_work',
            },
            {
                key: 'CUSTOMER',
                name: 'Kundentermin',
                icon: 'calendar_today',
            },
            {
                key: 'PAUSE',
                name: 'Gerade in Pause',
                icon: 'free_breakfast',
            },
            {
                key: 'OFFLINE',
                name: 'Nicht anwesend',
                optional: true,
                icon: 'exit_to_app',
            }
        ] as any[]).filter((opt: any) => (skipOptional ? (skipOptional && opt.optional !== true) : true));
    }

    filterItemsByState(stateKey: string): any[] {
        return this.items.filter((item: any) => {
            return item.state && item.state.state === stateKey;
        });
    }

    getItemCountByState(stateKey: string): number {
        return this.filterItemsByState(stateKey).length;
    }

}

</script>

<style scoped lang="scss">

.grouped-wall {

    .group-header {
        display: flex;
        align-items: center;
        padding: .5rem .75rem;

        i {
            margin: 0 .25rem 0 0;
        }

        h1 {
            margin: 0 .5rem 0 0;
            padding: 0;
            font-size: 1rem;
        } 

        small {
            font-weight: normal;
            color: #b3b3b3;
        }

        .strike {
            border-bottom: solid 1px var(--secondary-color-lighter);
            flex-grow: 1;
            height: 1px;
        }

    }

    .card-wall {
        display: flex;
        width: 100vw;
        flex-wrap: wrap;
        padding: .25rem 0;
    }

}

</style>
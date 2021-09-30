<template>
    <div id="view-container">
        <div v-if="isKioskView">
            <h2 class="text-center pb-0">Homeoffice Wall</h2>
        </div>
        <div v-if="!isKioskView" class="header d-flex">
            <div class="btn-group pr-2">
                <button v-on:click="onChangeViewMode()" class="btn" v-bind:class="{'btn-primary': !isShowAll}">Anwesend</button>
                <button v-on:click="onChangeViewMode()" class="btn" v-bind:class="{'btn-primary': isShowAll}">Alle</button>
            </div> 
                
            <div class="flex-grow"></div>

            <div class="pr-2 pl-2">
                <button class="btn" v-has-role="'*'" v-if="isShowAll" v-on:click="isEditDialogShown = true">
                    <i class="material-icons">add_box</i>
                </button>
            </div>

            <div class="btn-group">
                <button v-on:click="onChangeGroupView(true)" class="btn" v-bind:class="{'btn-primary': isGroupedView}">
                    <i class="material-icons">list</i>
                </button>
                <button v-on:click="onChangeGroupView(false)" class="btn" v-bind:class="{'btn-primary': !isGroupedView}">
                    <i class="material-icons">grid_view</i>
                </button>
            </div> 
        </div>
            
        <employee-list-simple v-if="!isGroupedView" v-bind:items="items" v-bind:is-show-all="isShowAll"></employee-list-simple>
        <employee-list-grouped v-if="isGroupedView" v-bind:items="items" v-bind:is-show-all="isShowAll"></employee-list-grouped>
            
        <p v-if="items.length < 1 && !isShowAll" class="p-2 m-2 text-center emoji-p">
            <span class="emoji">
                {{[':-|', ':-/', ';-|)'][Math.ceil(Math.random()*3)-1]}}
            </span>
            <em>Niemand anwesend</em>
        </p>
            
        <employee-edit-dialog v-if="isEditDialogShown" v-on:close="isEditDialogShown = false"></employee-edit-dialog>
            
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import EmployeeListSimple from '../components/EmployeeListSimple.vue';
import EmployeeListGrouped from '../components/EmployeeListGrouped.vue';
import { DataService } from '../services/data.service';
import { Employee } from '../models/employee';
import EmployeeEditDialog from '../components/EmployeeEditDialog.vue';
import { createLogger, Logger } from '../services/logger.service';
import { AuthService } from '../services/auth.service';

@Component({
    name: 'EmplyoeeView',
    components: {
        EmployeeListSimple,
        EmployeeListGrouped,
        EmployeeEditDialog,
    },
})
export default class EmplyoeeView extends Vue {
    
    private logger: Logger = createLogger(EmplyoeeView.name);

    private dataService: DataService = DataService.getInstance();

    private authService: AuthService = AuthService.getInstance();

    private eventSource!: EventSource;

    items: Employee[] = [];

    isShowAll = true;
    isGroupedView = false;
    isEditDialogShown: boolean = false;

    async loadData() {
        this.items = await this.dataService.getEmployees(this.isShowAll);
    }

    get isKioskView(): boolean {
        return this.authService.isKioskView();
    }

    onChangeViewMode() {
        this.isShowAll = !this.isShowAll;
        this.loadData();
        this.authService.setProperty("employeeView.isShowAll", this.isShowAll);
    }

    onChangeGroupView(isGrouped: boolean) {
        this.isGroupedView = isGrouped;
        this.authService.setProperty("employeeView.isGroupedView", this.isGroupedView);
    }

    mounted() {
        this.logger.info("Component mounted");
        this.loadData();

        this.isShowAll = this.authService.getProperty("employeeView.isShowAll", false);
        this.isGroupedView = this.authService.getProperty("employeeView.isGroupedView", true);

        this.eventSource = this.dataService.subscribeEvents((_: string, p: any) => {
            this.logger.info(`Employee state changed:`, p);
            this.loadData();
        }, ['EmployeeStateChange', 'EmployeeCreated', 'EmployeeDeleted', 'EmployeeUpdated', 'OnConnect']);
    }

    beforeDestroy() {
        this.logger.info(`Going to destroy component ...`);
        if (this.eventSource) {
            this.eventSource.close();
        }
    }

}

</script>

<style lang="scss" scoped>

#view-container {
    padding: .75rem;
}

p.emoji-p {
    margin: 2rem auto 0 auto;
}

p.emoji-p span {
    font-size: 100px;
    line-height: 150px;
    display: block;
    transform: rotate(90deg);
    color: rgba(0, 0, 0, .25);
    margin: 0 0 .5rem 0;
}

</style>
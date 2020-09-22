<template>
    <div class="modal active">
        <a href="#close" class="modal-overlay" v-on:click="close($event)" aria-label="Close"></a>
        <div class="modal-container">
            <div class="modal-header">
                <a href="#" class="btn btn-clear float-right" v-on:click="close($event)" aria-label="Close"></a>
                <div class="modal-title h5">
                    Status &auml;ndern
                </div>
            </div>
            <div class="modal-body">
                <div class="content">
                    <input class="form-input" type="text" v-model="message" placeholder="Kurze Nachricht?" />
                    
                    <div class="pt-2 pb-2"></div>
                    
                    <div class="option-wall">
                        <button class="btn" v-for="state in states" v-bind:key="state.id" v-on:click="onTriggerStateChange(state.id)">
                            <div class="p-2">
                                <i class="material-icons">{{state.icon}}</i>
                            </div>
                            <div class="desc">
                                <strong>{{state.name}}</strong>
                                <p>{{state.description}}</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" v-on:click="close()">Abbruch</button>
            </div>
        </div>
    </div>      
</template>


<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import EmployeeItem from './EmployeeItem.vue';
import { Employee } from '../models/employee';
import AbstractDialog from './abstract-dialog';
import { DataService } from '../services/data.service';
import { createLogger, Logger } from '../services/logger.service';

@Component({
    name: 'employee-state-change-dialog',
})
export default class EmployeeStateChangeDialog extends AbstractDialog {

    private loger: Logger = createLogger(EmployeeStateChangeDialog.name);
    
    private dataService: DataService = DataService.getInstance();

    @Prop() employee!: Employee;

    message: string = '';

    states: Array<any> = [];

    async mounted() {
        this.states = await this.dataService.getAvailableStates();
        console.log(this.states);
    }

    async onTriggerStateChange(newState: string) {
        this.loger.info(`onTriggerStateChange:`, newState);

        try {
            await this.dataService.setEmployeeState(this.employee.id, newState, this.message);
            this.close();
        } catch (ex) {
            this.loger.error(`Cannot set employee state:`, newState, this.message, ex);
        }
    }

}
</script>

<style scoped lang="scss">

.option-wall {
    display: flex;
    flex-direction: column;

    .btn {
        width: 100%;
        border-bottom-width: 0;
        display: flex;
        height: auto !important;

        .desc {
            flex-grow: 1;
            text-align: left;
            padding-left: 8px;

            p {
                margin: 0;
                padding: 0;
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                word-break: break-all; 
            }
        }

        &:first-child {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
        }

        &:last-child {
            border-top-left-radius: 0 !important;
            border-top-right-radius: 0 !important;
            border-bottom-width: 1px;
        }
    }
}

</style>
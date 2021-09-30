<template>
    <div class="avatar-card-container">
        <div class="context-menu-container">
            <div class="dropdown dropdown-right">
                <a class="btn btn-primary dropdown-toggle" tabindex="0">
                    <i class="material-icons">settings</i>
                </a>
                <ul class="menu text-left">
                    <li class="menu-item">
                        <a href="#" v-on:click="isStateChangeDialogShown = true">
                            <i class="material-icons mi-std">card_travel</i> Status ändern
                        </a>
                        <a href="#" v-has-role="'*'" v-if="isShowAll" v-on:click="$event.preventDefault(); isEditDialogShown = true;">
                            <i class="material-icons mi-std">edit</i> Bearbeiten
                        </a>
                        <a href="#" v-has-role="'*'" v-if="isShowAll" v-on:click="onDeleteEmployee($event, item)">
                            <i class="material-icons mi-std">delete</i> Löschen
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div v-bind:class="getAvatarClasses(item)" v-on:click="isStateChangeDialogShown = true">
            <div class="s-circle avatar-circle" v-bind:style="getAvatarBackgroundImageStyle(item)">
                <div v-if="!!item.state.description" class="popover popover-bottom">
                    <button class="btn btn-link">
                        <i  class="material-icons">chat</i>
                    </button>
                    <div class="popover-container">
                        <div class="card">
                            <div class="card-body">
                                {{item.state.description}}
                            </div>
                        </div>
                    </div>
                </div>
                
                <span class="no-avatar" v-if="!item.avatarUrl">
                    {{item.abbr || ''}}
                </span>
            </div>
        </div>

        <div class="avatar-footer">
            <span>{{item.name}}</span>
        </div>

        <employee-edit-dialog v-if="isEditDialogShown" v-on:close="isEditDialogShown = false" v-bind:employee="item"></employee-edit-dialog>

        <employee-state-change-dialog v-if="isStateChangeDialogShown" v-on:close="isStateChangeDialogShown = false" v-bind:employee="item"></employee-state-change-dialog>

        <confirm-delete-dialog v-if="isConfirmDeleteDialogShown" v-on:close="isConfirmDeleteDialogShown = false" v-bind:employee="item.name" v-on:confirm="onDeleteEmployee($event, item, true)"></confirm-delete-dialog> 

    </div>
</template>


<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Employee } from '../models/employee';
import EmployeeEditDialog from './EmployeeEditDialog.vue';
import EmployeeStateChangeDialog from './EmployeeStateChangeDialog.vue';
import ConfirmDeleteDialog from './ConfirmDeleteDialog.vue';
import { DataService } from '../services/data.service';
import { createLogger, Logger } from '../services/logger.service';

@Component({
    name: 'employee-item',
    components: {
      'employee-edit-dialog': EmployeeEditDialog,
      'employee-state-change-dialog': EmployeeStateChangeDialog,
      'confirm-delete-dialog': ConfirmDeleteDialog,
    }
})
export default class EmployeeItem extends Vue {

    private logger: Logger = createLogger(EmployeeItem.name);

    private dataService: DataService = DataService.getInstance();

    @Prop() item!: Employee;

    @Prop() isShowAll!: boolean;

    isEditDialogShown: boolean = false;
    isStateChangeDialogShown: boolean = false;
    isConfirmDeleteDialogShown: boolean = false;
        
    getAvatarBackgroundImageStyle(employee: Employee) {
        if (!employee || !employee.avatarUrl) {
            return {};
        }

        return { backgroundImage: 'url(' + employee.avatarUrl + ')' };
    }
        
    getAvatarClasses(item: Employee) {
        const classes = {
            'avatar-circle-container': true, 
            'active-ho': item.state.state === 'HOMEOFFICE' || item.state.state === 'OFFICE', 
            'active-pause': item.state.state === 'PAUSE',
            'active-cust': item.state.state === 'CUSTOMER',
        };
        return classes;
    }
        
    async onDeleteEmployee(evt: Event, employee: Employee, execute: boolean = false) {
        evt && evt.preventDefault();
        this.logger.info(`onDeleteEmployee:`, employee, execute);

        // Actually perform the action
        if (execute === true) {
            const ok = await this.dataService.deleteEmployee(employee.id);
            this.logger.info(`Delete successfull:`, ok);
            return;
        }

        this.isConfirmDeleteDialogShown = true;
    }

}

</script>

<style scoped lang="scss">

$avatarSize: 8rem;
$avatarBorder: .5rem;

.avatar-card-container {
    position: relative;
    margin: .25rem;

    .context-menu-container {
        position: absolute;
        top: 0;
        right: 0;

        .menu {
            min-width: 175px !important;
        }

        .dropdown-toggle {
            background: none;
            border: none;
            outline: none;
            box-shadow: none;
            padding: .25rem;

            i {
                transition: all ease-in-out 0.3s;
                color: var(--secondary-color-light);
                transform: rotate(0deg);
            }

            &:hover {
                background-color: var(--secondary-color-lightest);

                i {
                    color: var(--primary-color);
                    transform: rotate(90deg);
                }
            }
        }
    }

    .avatar-circle-container {
        position: relative;
        border-radius: 100%;
        box-shadow: 0 0.25rem 1rem rgba(48,55,66,.15);
        border: solid 1px #dfdfdf;
        background-color: #dfdfdf;
        cursor: pointer;
        margin: $avatarBorder;
        display: block;

        .card {
            text-align: center;
            display: inline-block;
            margin: 1rem 0 0 1rem;
        }


        .avatar-circle {
            width: $avatarSize;
            height: $avatarSize;
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            background-color: #eee !important;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            margin: $avatarBorder;

            .no-avatar {
                color: #999;
                font-size: 50px !important;
            }

            .material-icons {
                color: #999;
                font-size: 50px;
                line-height: 100px;
            }    

            .popover {
                display: inline-block !important;
                
                button i {
                    font-size: 32px !important;
                    line-height: 32px !important;
                    color: #2faa3f;
                }
            }

        }

        &.active-ho {
            background-color: #32b643;
            border-color:  #2faa3f;
        }

        &.active-pause {
            background-color: #b6a932;
            border-color:  #aaa22f;
        }

        &.active-cust {
            background-color: #327bb6;
            border-color:  #2f73aa;
        }
    }   

    .avatar-footer {
        width: 100%;
        text-align: center;
        color: var(--secondary-color);

        span {
            display: inline-block;
            width: 100%;
            max-width: 150px;
            margin: 0 auto;
            font-size: 90%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

}

</style>

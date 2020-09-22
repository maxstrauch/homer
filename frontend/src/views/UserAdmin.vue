<template>
    <div>
        <h3 class="flex-justify-center d-flex">
            <router-link to="/" class="back-btn"><i class="material-icons mi-24">arrow_back</i></router-link>
            <i class="material-icons mi-32 pl-2 pr-2">people</i>
            Benutzer
        </h3>
        
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Rollen</th>
                    <th>Direkt-URL</th>
                    <th>Erweitert</th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" v-bind:key="user.id">
                    <td>
                        {{user.id}}
                    </td>
                    <td>
                        <span v-if="editModelId !== user.id">
                            {{user.name}}
                        </span>
                        
                        <input v-if="editModelId === user.id" type="text" class="form-input" v-model="user.name" />
                    </td>
                    <td>
                        <span v-if="editModelId !== user.id">
                            <span v-for="role in user.roles" class="chip" v-bind:key="role">{{role}}</span>
                        </span>

                        <select v-if="editModelId === user.id" multiple class="form-input" v-model="user.roles">
                            <option v-for="role of roles" v-bind:value="role.value" v-bind:key="role.value">{{role.name}}</option>
                        </select>
                    </td>
                    <td>
                        <div v-if="!!user.directLoginUrl" class="input-group">
                            <input type="text" v-bind:id="'cred' + user.id" class="form-input" value="*****" v-bind:rel="getDirectLoginUrlAbs(user)" />
                            <button class="btn btn-primary input-group-btn" v-on:click="onShowCredentials('cred' + user.id)">
                                <i class="material-icons">remove_red_eye</i>
                            </button>
                        </div>
                    </td>
                    <td>
                        <div class="form-group disabled">
                            <label class="form-switch">
                                <input :disabled="editModelId !== user.id" type="checkbox" v-model="(user.optional || {}).isKioskView"  />
                                <i class="form-icon"></i> Kiosk Ansicht
                            </label>
                        </div>
                    </td>
                    <td>
                        <div v-if="editModelId === user.id">
                            <div class="btn-group">
                                <button class="btn btn-success" v-on:click="onUpdateUser($event, user)">
                                    <i class="material-icons">send</i>
                                </button>
                                
                                <button class="btn btn-error" v-on:click="onClearUserEdit($event)">
                                    <i class="material-icons">cancel</i>
                                </button>
                            </div>
                        </div>
                        <div v-if="editModelId !== user.id">
                            <div class="btn-group">
                                <button class="btn btn-success" v-on:click="onEditUser($event, user)">
                                    <i class="material-icons">edit</i>
                                </button>
                                
                                <button class="btn btn-error" v-on:click="onDeleteUser($event, user)">
                                    <i class="material-icons">delete</i>
                                </button>
                                
                                <button class="btn btn-primary" v-on:click="user._isPasswordChangeDialogShown = true">
                                    <i class="material-icons">vpn_key</i>
                                </button>
                            </div> 
                            
                            <user-change-password-dialog v-if="user._isPasswordChangeDialogShown" v-on:close="user._isPasswordChangeDialogShown = false" v-bind:user-id="user.id"></user-change-password-dialog>

                        </div>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td>
                        <input type="text" class="form-input" v-model="newUserName" />
                    </td>
                    <td>
                        <select multiple class="form-input" v-model="newUserRoles">
                            <option v-for="role of roles" v-bind:value="role.value" v-bind:key="role.value">{{role.name}}</option>
                        </select>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-success" v-on:click="onCreateUser($event)">
                                <i class="material-icons">send</i>
                            </button>
                            
                            <button class="btn btn-error" v-on:click="onClearForm($event)">
                                <i class="material-icons">cancel</i>
                            </button>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { User } from '../models/User';
import { DataService } from '../services/data.service';
import UserChangePasswordDialog from '../components/UserChangePasswordDialog.vue';
import { createLogger, Logger } from '../services/logger.service';
const urlJoin = require('url-join');


@Component({
    name: 'user-admin',
    components: {
        UserChangePasswordDialog,
    }
})
export default class UserAdmin extends Vue {

    private logger: Logger = createLogger(UserAdmin.name);

    private dataService: DataService = DataService.getInstance();

    users: User[] = [];

    roles = [
        {
            value: '*',
            name: 'Administrator'
        },
        {
            value: 'default',
            name: 'Nutzer'
        },
        {
            value: 'kiosk',
            name: 'Kiosk-Modus'
        }
    ];

    newUserName = '';
    newUserRoles: string[] = [];
    editModelId = '';
    _editModel = null as any;
    
    mounted() {
        this.logger.info("Starting user admin!");
        this.loadData();
    }

    async loadData() {
        this.users = (await this.dataService.getUsers()).map(u => ({ ...u, _isPasswordChangeDialogShown: false }));
        this.logger.info("Loaded users:", this.users);
    }

    onEditUser(event: Event, user: User) {
        event && event.preventDefault();
        this.editModelId = user.id;
        this._editModel = JSON.parse(JSON.stringify(user));
    }

    async onDeleteUser(event: Event, user: User) {
        event && event.preventDefault();
        await this.dataService.deleteUserById(user.id);
        this.loadData();
    }

    async onCreateUser(event: Event) {
        event && event.preventDefault();

        await this.dataService.createUser({
            name: this.newUserName,
            roles: this.newUserRoles,
        });

        this.onClearForm(event);
        this.loadData();
    }

    onClearForm(event: Event) {
        event && event.preventDefault();
        this.newUserName = '';
        this.newUserRoles = [];
    }
        
    onClearUserEdit(event: Event) {
        event && event.preventDefault();
        if (this.editModelId) {
            this.logger.info(`onClearUserEdit`, this.users);
            const idx = this.users.findIndex((user: User) => (user.id === this.editModelId));
            if (idx > -1) {
                this.users[idx] = this._editModel;
                this._editModel = null;
                this.editModelId = '';
            }
        }
    }

    async onUpdateUser(event: Event, user: User) {
        event && event.preventDefault();
        if (this.editModelId) {
            await this.dataService.updateUserById(user.id, {
                name: user.name,
                roles: user.roles,
                optional: user.optional || {},
            });
            
            this._editModel = null;
            this.editModelId = '';
            // OK
            this.loadData();
        }
    }

    getDirectLoginUrlAbs(user: User) {
        if (!user.directLoginUrl) {
            return null;
        }
        return urlJoin(window.location.origin, user.directLoginUrl);
    }

    onShowCredentials(htmlId: string) {
        const el = document.getElementById(htmlId) as HTMLInputElement;
        if (el.value.indexOf('**') === 0) {
            el.value = el.getAttribute('rel') || '';
        } else {
            el.value = '*****';
        }
    }

}

</script>

<style scoped lang="scss">

.back-btn {
    line-height: 28px;
}

.user-entry-row {
    cursor: pointer;
}

</style>

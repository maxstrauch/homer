<template>
    <div class="home">
        <nav v-if="!isKioskView" id="main-nav">
            <div class="logo-container">
                <div class="main-logo" v-on:click="$event.preventDefault(); $router.push('/').catch(()=>{});">
                    <homer-logo></homer-logo>
                    <span>Homer</span>
                </div>
                <div class="logo-appendum">
                </div>
            </div>
            <div class="flex-grow-1"></div>
            <div v-if="hasQuickStateToggle && !!quickStateToggleEmployee" class="quick-toggle-wrapper">
                <div class="quick-toggle" v-bind:class="getAvatarClassesForToggle()" v-on:click="isStateChangeDialogShown = true">
                    <div class="main-wrap-button">
                        <span>
                            {{quickStateToggleEmployee.name}}
                        </span>
                    </div>
                    <div class="main-wrap-avatar">
                        <div class="s-circle avatar-circle" v-bind:style="getAvatarBackgroundImageStyleForQuickToggle()">
                            <span v-if="hasNoBackgroundImage()" class="no-bg-image">
                                {{quickStateToggleEmployee.abbr}}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex-grow-1"></div>
            <div class="ctrls-container">
                <router-link to="/admin" v-has-role="'*'" class="btn btn-secondary dropdown-toggle" tabindex="0" type="button">
                    <i class="material-icons">settings</i>
                </router-link>

                <div class="dropdown dropdown-right ml-2">
                    <a class="btn btn-secondary dropdown-toggle" tabindex="0" href="#" v-on:click="$event.preventDefault();">
                        {{userName}}
                        <i class="material-icons mi-std">person</i>
                    </a>
                    <ul class="menu">
                        <li class="menu-item" v-if="!isSSO">
                            <a href="#" v-has-role="'default'" v-on:click="isPasswordChangeDialogShown = true">
                                <i class="material-icons">vpn_key</i> Passwort ändern
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="#" v-on:click="onLogout($event)">
                                <i class="material-icons">exit_to_app</i> Abmelden
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="#" v-on:click="isAboutDialogShown = true">
                                <i class="material-icons">info_outline</i> Über
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div id="app-container">
            <router-view></router-view>
        </div>

        <about-dialog v-if="isAboutDialogShown" v-on:close="isAboutDialogShown = false"></about-dialog>

        <user-change-password-dialog v-if="isPasswordChangeDialogShown" v-on:close="isPasswordChangeDialogShown = false" v-bind:user-id="currentUserId"></user-change-password-dialog>

        <employee-state-change-dialog v-if="isStateChangeDialogShown && !!quickStateToggleEmployee" v-on:close="isStateChangeDialogShown = false" v-bind:employee="quickStateToggleEmployee"></employee-state-change-dialog>        
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AboutDialog from '../components/AboutDialog.vue';
import UserChangePasswordDialog from '../components/UserChangePasswordDialog.vue';
import EmployeeStateChangeDialog from '../components/EmployeeStateChangeDialog.vue';
import HomerLogo from '../components/HomerLogo.vue';
import Login from '../views/Login.vue'
import { AuthService } from '../services/auth.service';
import { EmployeeStateTransision, LAST_STATE_TRANSISIONS_KEY } from '../definitions';
import { DataService } from '../services/data.service';
import { Employee } from '../models/employee';
import { EventService, TOPIC_EMPLOYEE_STATE_CHANGE, Unsubscribe } from '../services/event.service';

@Component({
name: 'Home',
  components: {
    Login,
    AboutDialog,
    UserChangePasswordDialog,
    HomerLogo,
    EmployeeStateChangeDialog
  },
})
export default class Home extends Vue {

    private authService: AuthService = AuthService.getInstance();
    private dataService: DataService = DataService.getInstance();

    currentUserId!: string;
    isKioskView!: boolean;
    isAboutDialogShown: boolean = false;
    isPasswordChangeDialogShown: boolean = false;
    userName!: string;

    isSSO: boolean = false;

    hasQuickStateToggle: boolean = false;
    quickStateToggleEmployee: Employee | null = null;

    isStateChangeDialogShown: boolean = false;

    subscription: Unsubscribe | null = null;

    created() {
        this.currentUserId = this.authService.userId;
        this.userName = this.authService.getUserName();
        this.isKioskView = this.authService.isKioskView();

        const isSSO = this.authService.getTokenValue<boolean | number>('isSSO');
        this.isSSO = (isSSO === true || isSSO === 1);

        this.subscription = EventService.subscribe<string | null>(TOPIC_EMPLOYEE_STATE_CHANGE, _ => {
            this.updateQuickStateToggleState();
        });
    }

    beforeDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    async onLogout() {
        if ((await this.authService.logout())) {
            this.$router.push({ name: 'Login' });
        }
    }

    hasNoBackgroundImage() {
        return !this.quickStateToggleEmployee || !this.quickStateToggleEmployee.avatarUrl;
    }

    getAvatarBackgroundImageStyleForQuickToggle() {
        if (this.hasNoBackgroundImage()) {
            return {};
        }

        return { backgroundImage: 'url(' + (this.quickStateToggleEmployee?.avatarUrl || '') + ')' };
    }

    getAvatarClassesForToggle() {
        const item = this.quickStateToggleEmployee;
        if (!item) {
            return {};
        }

        const classes = {
            'active-ho': item.state.state === 'HOMEOFFICE', 
            'active-pause': item.state.state === 'PAUSE',
            'active-cust': item.state.state === 'CUSTOMER',
        };
        return classes;
    }    

    async updateQuickStateToggleState() {
        const trans = this.authService.getProperty<EmployeeStateTransision[]>(LAST_STATE_TRANSISIONS_KEY, []);
        const uid = this.getCurrentUserForEmployeeStateTransisions(trans);
        this.hasQuickStateToggle = uid !== null;

        if (uid !== null) {
            this.quickStateToggleEmployee = await this.dataService.getEmployeeById(uid);
        }
    }


    getCurrentUserForEmployeeStateTransisions(trans: EmployeeStateTransision[]): string | null {
        if (!trans || !Array.isArray(trans) || trans.length < 1) {
            return null;
        }

        // Count the results
        const probMap: { [key: string]: number; } = {};
        trans.forEach((v: EmployeeStateTransision) => {
            if ((typeof probMap[v.employeeId]) === 'undefined') {
                probMap[v.employeeId] = 0;
            }
            probMap[v.employeeId]++;
        });

        // Get the highest match
        let maxCount = -1;
        let userId = null;
        for (let key in probMap) {
            if (probMap[key] > maxCount) {
                maxCount = probMap[key];
                userId = key;
            }
        }

        return userId;
    }   

}

</script>

<style scoped lang="scss">

nav#main-nav {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: row;
    box-shadow: 0px 6px 16px 2px rgba(0, 0, 0, 0.075);
    border-bottom: solid 1px #e0e0e0;
    background-color: white;

    .logo-container {
        display: flex;
        flex-direction: row;

        .main-logo {
            background-color: #5755d9;
            color: white;
            height: 100%;
            padding: 0 1rem;
            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 18px;
            cursor: pointer;

            svg {
                height: 28px;
                margin-right: .5rem;
            }
        }

        .logo-appendum {
            height: 100% !important;
            width: 30px;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 100'%3E%3Cpath d='M0,100C24.984,99.819 37.099,86.847 41.252,52.196C45.111,20.001 47.187,0 47.187,0L0,0L0,100Z' style='fill:rgb(87,85,217);'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: left top;
            background-size: contain;
        }
    }

    .ctrls-container {
        padding: .5rem;
    }

    .quick-toggle-wrapper {
        display: flex;
        align-items: center;

        .quick-toggle {
            border: solid 2px #dfdfdf;
            background-color: #f3f3f3;
            padding: .25rem;
            border-radius: 2rem;
            display: flex;
            flex-direction: row;
            transition: all ease-in-out 210ms;
            cursor: pointer !important;


            &.active-ho {
                background-color: #32b64418;
                border-color: #2faa3f49;
            }

            &.active-ho:hover {
                background-color: #32b6432e;
                border-color: #2faa3f91;
            }

            &.active-pause {
                background-color: #b6a93218;
                border-color:  #aaa22f49;
            }

            &.active-pause:hover {
                background-color: #b6a9322e;
                border-color:  #aaa22f91;
            }

            &.active-cust {
                background-color: #327bb618;
                border-color:  #2f73aa49;
            }

            &.active-cust:hover {
                background-color: #327bb62e;
                border-color:  #2f73aa91;
            }

            .main-wrap-button {
                flex-grow: 1;
                padding-right: .25rem;
                display: flex;
                align-items: center;

                span {
                    min-width: 4rem;
                    padding-left: .5rem;
                    padding-right: .5rem;
                }
            }

            .main-wrap-avatar {

                .avatar-circle {
                    width: 1.25rem;
                    height: 1.25rem;
                    background-position: center;
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                }

                .no-bg-image {
                    font-size: 70%;
                }
            }
        }
    }
}

</style>

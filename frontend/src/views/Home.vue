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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AboutDialog from '../components/AboutDialog.vue';
import UserChangePasswordDialog from '../components/UserChangePasswordDialog.vue';
import HomerLogo from '../components/HomerLogo.vue';
import Login from '../views/Login.vue'
import { AuthService } from '../services/auth.service';

@Component({
name: 'Home',
  components: {
    Login,
    AboutDialog,
    UserChangePasswordDialog,
    HomerLogo,
  },
})
export default class Home extends Vue {

    private authService: AuthService = AuthService.getInstance();

    currentUserId!: string;
    isKioskView!: boolean;
    isAboutDialogShown: boolean = false;
    isPasswordChangeDialogShown: boolean = false;
    userName!: string;

    created() {
        this.currentUserId = this.authService.userId;
        this.userName = this.authService.getUserName();
        this.isKioskView = this.authService.isKioskView();
    }

    async onLogout() {
        if ((await this.authService.logout())) {
            this.$router.push({ name: 'Login' });
        }
    }

    get isSSO(): boolean {
        const isSSO = this.authService.getTokenValue<boolean | number>('isSSO');
        return (isSSO === true || isSSO !== 0) ? true : false;
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
}

</style>

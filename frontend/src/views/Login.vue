<template>
    <div class="login">
        <div class="icon-container">
            <homer-logo></homer-logo>
            <h1>Homer</h1>
        </div>
        
        <form v-on:submit="onLogin($event)">
            <div v-if="loginErrMsg || ssoErrorMessage" v-bind:class="errorBoxClasses">
                <button v-on:click="onCloseMessage($event)" class="btn btn-clear float-right"></button>
                <span v-if="ssoErrorMessage">
                    Das Anmelden über den Single Sign-On ist leider fehlgeschlagen: {{ ssoErrorMessage }}
                </span>
                <span v-else>
                    Das Anmelden ist leider fehlgeschlagen. Existieren Benutzername und Passwort? Bitte erneut versuchen!
                </span>
            </div>

            <div v-if="ssoEnabled && ssoEnabled.isSupported === true" class="sso-container">
                <button class="btn btn-success" type="button" v-on:click="onSSOLogin($event)">
                    <i class="material-icons">lock</i>
                    {{ ssoEnabled.name }} Single Sign-on
                </button>
                <hr/>
            </div>

            <div class="input-container">
                <div class="input-group">
                    <span class="input-group-addon">
                        <i class="material-icons">person</i>
                    </span>
                    <input type="text" class="form-input" ref="usernameInput" v-model="name" autocomplete="false" placeholder="Benutzername" />
                </div>
                
                <div class="input-group">
                    <span class="input-group-addon">
                        <i class="material-icons">vpn_key</i>
                    </span>
                    <input type="password" class="form-input" v-model="password" autocomplete="false" placeholder="Passwort" />
                </div>
            </div>
            
            <div class="control-container">
                <div class="flex-grow-1"></div>
                <button class="btn btn-primary" v-on:click="onLogin($event)">Anmelden</button>
            </div>
        </form>

        <div class="footer">
            &copy; 2020 - {{ new Date().getFullYear() }}. <a href="https://github.com/maxstrauch/homer/" target="_blank" rel="noopener noreferrer">Homer - The Homeoffice Manager</a>. Designed and built with <span class="text-error">♥</span> by <a href="https://maxstrauch.github.io/" target="_blank" rel="noopener noreferrer">Max</a>.
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { createLogger, Logger } from '../services/logger.service';
import { AuthService } from '../services/auth.service';
import { SSOEnabledResponse } from '@/models/APILoginResponse';
import HomerLogo from '../components/HomerLogo.vue';

@Component({
    components: {
        HomerLogo,
    },
})
export default class Login extends Vue {

    private logger: Logger = createLogger(Login.name);

    name: string = '';
    password: string = '';

    loginErrMsg = false;

    errorBoxClasses = {
        'toast': true,
        'toast-error': true,
        'animated': true,
        'fadeIn': true,
        'fadeOut': false,
    };

    hideTimeoutHandle!: NodeJS.Timeout;

    ssoEnabled: SSOEnabledResponse | null = null;

    ssoErrorMessage: string | null = null;

    mounted() {
        (this.$refs.usernameInput as HTMLInputElement).focus();

        AuthService.getInstance().isOAuth2Supported().then((e) => {
            this.ssoEnabled = e;
        }).catch(err => {
            this.ssoEnabled = null;
        });
        
        if (this.$route.query.error === '1' && this.$route.query.errmsg) {
            this.ssoErrorMessage = this.$route.query.errmsg as string;
        }

        console.log();
    }

    async onLogin(evt: Event) {
        evt && evt.preventDefault();
        this.logger.info("onLogin: ", this.name);

        const success = await AuthService.getInstance().login(this.name, this.password);

        if (!success) {
            this.loginErrMsg = true;
            this.hideTimeoutHandle = setTimeout(this.onCloseMessage, 8400);
        } else {
            this.$router.push('/');
        }
    }

    onSSOLogin() {
        if (this.ssoEnabled) {
            window.location.href = this.ssoEnabled.authRedirectUrl;
        }
    }

    onCloseMessage() {
        if (this.hideTimeoutHandle) {
            clearTimeout(this.hideTimeoutHandle);
        }

        this.errorBoxClasses.fadeIn = false;
        this.errorBoxClasses.fadeOut = true;
        setTimeout(() => {
            this.errorBoxClasses.fadeIn = true;
            this.errorBoxClasses.fadeOut = false;
            this.loginErrMsg = false;
        }, 1000);
    }

}
</script>

<style scoped lang="scss">

.login {
    width: 100vw;
    height: 100vh;
    background-image: linear-gradient(to bottom,#5755d9,#43418b);
    background-color: #5755d9;
    background-repeat: no-repeat;
    position: absolute;
    top: 0px;
    left: 0px;

    .icon-container {
        display: flex;
        justify-content: center;
        flex-direction: column;
        margin: 5rem auto 2rem auto;
        max-width: 430px;
        align-items: center;

        svg {
            width: 82px;
        }

        h1 {
            display: block;
            color: white;
            margin: 1rem 0 0 0;
            padding: 0;
        }
    }

    form {
        background-color: #fff;
        box-shadow: 0 1px 3px 5px rgba(0,0,0,0.075);
        max-width: 430px;
        margin: 0 auto 2rem;
        border-radius: 8px;

        .toast {
            border-radius: 8px 8px 0 0;
        }

        .sso-container {
            width: 100%;
            padding: 2rem 2rem 0 2rem;

            button {
                width: 100%;
                font-size: 110%;
                transition: all ease-in-out 210ms;
                cursor: pointer;

                &:hover {
                    transform: scale(1.025);
                }
            }

            hr {
                border: none;
                border-bottom: 0.05rem solid #bcc3ce;
                margin-top: 1.5rem;
            }
        }

        .input-container {
            padding: .75rem 1rem;

            .input-group {
                margin: .5rem 0;

                .input-group-addon {
                    display: flex;
                    align-items: center;

                    i {
                        color: #9ea3aa;
                        margin: 0;
                        padding: 0;
                        font-size: 16px;
                    }
                }
            }
        }

        .control-container {
            padding: .75rem 1rem;
            border-top: solid 1px #e7ebf3;
            background-color: #f1f4f8;
            border-radius: 0 0 8px 8px;
            display: flex;
        }
    }

    .footer {
        margin: 0 auto;
        max-width: 430px;
        color: rgba(255, 255, 255, 0.21);
        font-size: 90%;
        text-align: center;

        .text-error {
            opacity: 0.42;
        }

        a, a:visited {
            color: rgba(255, 255, 255, 0.42);
        }
    }
}

</style>
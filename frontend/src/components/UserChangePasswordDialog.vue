<template>
    <div class="modal active">
        <a href="#close" class="modal-overlay" v-on:click="close($event)" aria-label="Close"></a>
        <div class="modal-container">
            <div class="modal-header">
                <a href="#close" class="btn btn-clear float-right" v-on:click="close($event)" aria-label="Close"></a>
                <div class="modal-title h5">
                    Passwort &auml;ndern
                </div>
            </div>
            <div class="modal-body">
                <div class="content">
                    <form>
                        <div class="form-group">
                            <label class="form-label" for="original_pwd">Bisheriges Passwort:</label>
                            <input class="form-input" :disabled="isLoading" type="password" id="original_pwd" name="original_pwd" autocomplete="false" v-model="currentPassword" />
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="new_pwd1">Neues Passwort:</label>
                            <input class="form-input" :disabled="isLoading" type="password" id="new_pwd1" name="new_pwd1" autocomplete="false" v-model="newPassword" />
                            
                            <div class="bar bar-sm">
                                <div class="bar-item" role="progressbar" v-bind:style="getStylesForBar(newPassword)"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="new_pwd2">Neues Passwort (Wdh.):</label>
                            <input class="form-input" :disabled="isLoading" type="password" id="new_pwd2" name="new_pwd2" autocomplete="false" v-model="newPasswordRpt" />
                        </div>
                    </form>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" :disabled="isLoading" v-on:click="close()">Abbruch</button>
                <button class="btn btn-success" v-bind:class="{'loading': isLoading}" :disabled="isLoading || !isValid()" v-on:click="onChangePassword()">Ändern</button>
            </div>
        </div>
    </div>         
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import AbstractDialog from './abstract-dialog';
import { DataService } from '../services/data.service';
import owasp, { test } from "owasp-password-strength-test";
import { ToastService } from '../services/toast.service';

@Component({
    name: 'user-change-password-dialog',
})
export default class UserChangePasswordDialog extends AbstractDialog {

    private dataService: DataService = DataService.getInstance();

    private toastService: ToastService = ToastService.getInstance();

    @Prop() userId!: string;

    currentPassword: string = '';
    newPassword: string = '';
    newPasswordRpt: string = '';
    isLoading = false;

    isValid() {
        return this.newPassword === this.newPasswordRpt 
            && !!this.newPassword 
            && this.newPassword.length > 0;
    }

    getStylesForBar(pwd: string) {
        // Test the password
        const r = owasp.test(pwd);
        let q = Math.round((r.passedTests.length / (r.passedTests.length + r.failedTests.length)*100));
        if (pwd.length > 1 && q < 10) {
            q = 10;
        } else if (!pwd) {
            q = 0;
        }

        return {
            'backgroundColor': (q < 25 ? '#e85600' : (q < 75 ? '#ffb700' : '#32b643')),
            'width': `${q}%`
        };
    }

    async onChangePassword() {
        this.isLoading = true;

        const ok = await this.dataService.changePassword(
            this.userId, this.currentPassword, this.newPassword
        );

        if (ok) {
            this.close();
        } else {
            this.toastService.alert(
                `Das Passwort konnte nicht geändert werden! Prüfen Sie auf Tippfehler und versuchen Sie es erneut!`
            );
        }

        this.isLoading = false;
    }

}

</script>

<style scoped lang="scss">

.bar-item {
    border-radius: 0px !important;
}

.modal-footer {
    .btn {
        width: 4rem;

        &:last-child {
            margin-left: .5rem;
        }
    }
}

</style>
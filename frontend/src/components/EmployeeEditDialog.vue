<template>

  <div class="modal active">
        <a href="#close" class="modal-overlay" v-on:click="close()" aria-label="Close"></a>
        <div class="modal-container">
            <div class="modal-header">
                <a href="#close" class="btn btn-clear float-right" v-on:click="close()" aria-label="Close"></a>
                <div v-if="isNewEployee" class="modal-title h5">
                    Person erstellen
                </div>
                <div v-else class="modal-title h5">
                    Person bearbeiten
                </div>
            </div>
            <div class="modal-body">
                <div class="content">
                    
                    <div class="container">
                        <div class="columns">
                            <div class="column col-4">

                                <div class="s-circle avatar-circle mb-4" v-bind:style="getAvatarCirlceStyle()">
                                    <span class="no-avatar" v-if="!_employee.avatarUrl">
                                        <i class="material-icons">broken_image</i>
                                    </span>
                                </div>
                                
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-success" v-on:click="onUploadAvatar($event)">
                                        <i class="material-icons">upload_file</i>
                                    </button>
                                    
                                    <button class="btn btn-sm btn-error" v-bind:disabled="!canDeleteAvatar()" v-on:click="onDeleteAvatar()">
                                        <i class="material-icons">delete</i>
                                    </button>
                                </div>

                                <input type="file" class="hidden" ref="fileInput" v-on:change="onPerformUpload($event.target.files)" name="employee_avatar" id="employee_avatar" />
                                
                            </div>
                            <div class="column col-8">
                                
                                <div class="form-group">
                                    <label class="form-label" for="employee_name">Name:</label>
                                    <input class="form-input" type="text" id="employee_name" v-model="_employee.name" placeholder="Name" />
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="employee_email">E-Mail-Adresse:</label>
                                    <input class="form-input" type="text" id="employee_email" v-model="_employee.email" placeholder="E-Mail" />
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="employee_abbr">Kürzel:</label>
                                    <input class="form-input" type="text" id="employee_abbr" v-model="_employee.abbr" placeholder="Name" />
                                </div>
                                
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" v-on:click="close()">Abbruch</button>
                <button class="btn btn-primary" v-on:click="onSave()">Speichern</button>
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
    name: 'employee-edit-dialog',
})
export default class EmployeeEditDialog extends AbstractDialog {

    private dataService: DataService = DataService.getInstance();

    private logger: Logger = createLogger(EmployeeEditDialog.name);

    @Prop({ default: () => ({} as Employee) }) employee!: Employee;

    _stagedUpload= null as any;

    _forceDeleteAvatarOnSave: boolean = false;

    _employee!: Employee;

    get isNewEployee(): boolean {
        return !this._employee || !this._employee.id;
    }

    beforeMount() {
        if (this.employee) {
            this._employee = JSON.parse(JSON.stringify(this.employee));
        } else {
            this._employee = { } as Employee;
        }
        this.logger.info(`Mounted, data-object:`, this._employee);
    }

    onUploadAvatar(event: Event) {
        this.logger.debug(`Trigger OS file dialog ...`);
        const ele = this.$refs.fileInput as HTMLInputElement;
        ele.click();
    }

    getAvatarCirlceStyle(): { [key: string]: string; } {
        return {
            ...(this._employee.avatarUrl ? {
                backgroundImage: 'url(' + this._employee.avatarUrl + ')',
            } : { })
        };
    }

    onPerformUpload(files: FileList) {
        if (!files || files.length < 1) {
            this.logger.info(`Nothing to upload!`);
            return; // Nothing to upload
        }
        const file = files[0];
        this.logger.info(`onPerformUpload`, file);

        // Always stage the upload:
        this._stagedUpload = file;

        // Read-in the image to display it immediately
        let fr = new FileReader();
        fr.onload = (progress: ProgressEvent) => {
            const dataUrl = (progress.target as any).result;
            this._employee.avatarUrl = dataUrl;
            this.$forceUpdate();
        };
        fr.readAsDataURL(file);
    }

    canDeleteAvatar(): boolean {
        return this._stagedUpload || this._employee.avatarUrl;
    }

    onDeleteAvatar() {
        this.logger.debug(`onDeleteAvatar:`, this.canDeleteAvatar(), this._stagedUpload, this._employee.avatarUrl);
        if (!this.canDeleteAvatar()) {
            return;
        }

        // First delete the staged upload, if any
        if (this._stagedUpload) {
            this._stagedUpload = null;

            // Restore the old avatar, iff any
            if (this.employee.avatarUrl) {
                this._employee.avatarUrl = this.employee.avatarUrl;
            }
            return;
        }
        
        // Delete the existing avatar
        if (this._employee.avatarUrl) {
            this._employee.avatarUrl = null;
            this._forceDeleteAvatarOnSave = true;
            this.$forceUpdate();
        }
    }

    async onSave() {
        this.logger.debug(`onSave:`, this.isNewEployee, this._employee, this.employee);

        // Update or create the employee
        if (this.isNewEployee) {
            // Create a new employee, since not yet created
            const emp = await this.dataService.createEmployee({
                email: this._employee.email,
                name: this._employee.name,
                abbr: this._employee.abbr,
            });

            if (!emp) {
                this.logger.error(`Cannot create employee!`);
                return;
            }

            this._employee = emp;
            this.logger.debug(`Employee created:`, this._employee);
        } else {
            // Only save the changes
            await this.dataService.saveEmployeeById(this._employee.id, this._employee);

            // Check if avatar needs to be deleted
            if (this._forceDeleteAvatarOnSave === true) {
                await this.dataService.deleteAvatar(this._employee.id);
            }
        }

        // If there is an avatar image added, upload if available
        if (this._stagedUpload) {
            this.logger.debug(`Staged upload:`, this._stagedUpload);
            await this.dataService.uploadAvatar(this._employee.id, this._stagedUpload);
        }

        this.logger.debug(`Done`);
        this.close();
    }

}

</script>

<style scoped lang="scss">

.column.col-4 {

    .avatar-circle {
        margin: 0;
        background-color: #ececec;
        width: 150px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-size: cover;
    }

    .btn-group {
        display: inline-flex;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 1rem;
        width: 150px;
    }

}

.modal-footer {
    .btn {
        width: 5rem;

        &:last-child {
            margin-left: .5rem;
        }
    }
}

</style>

<template>

  <div class="modal active" id="edit-employee">
        <a href="#close" class="modal-overlay" v-on:click="close($event)" aria-label="Close"></a>
        <div class="modal-container">
            <div class="modal-header">
                <a href="#close" class="btn btn-clear float-right" v-on:click="close($event)" aria-label="Close"></a>
                <div class="modal-title h5">
                    Löschen bestätigen
                </div>
            </div>
            <div class="modal-body">
                <p>Wirklich sicher, dass folgendes Element gelöscht werden soll?</p>
                {{ message }}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" v-on:click="close()">Nein</button>
                <button class="btn btn-primary ml-3" v-on:click="onConfirm()">Ja</button>
            </div>
        </div>
    </div>
  
</template>

<script lang="ts">

import { Component, Vue, Prop } from 'vue-property-decorator';
import AbstractDialog from './abstract-dialog';

@Component({
    name: 'confirm-delete-dialog',
})
export default class ConfirmDeleteDialog extends AbstractDialog {

    @Prop() message!: string;

    onConfirm() {
        this.$emit('confirm');
        this.close();
    }

}

</script>

<style scoped lang="scss">

.modal-footer {
    .btn {
        width: 4rem;

        &:last-child {
            margin-left: .5rem;
        }
    }
}

</style>
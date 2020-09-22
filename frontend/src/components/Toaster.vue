<template>
    <div id="toast-container">
        <div v-bind:class="getClassNames(toast)" v-for="toast of toasts" v-bind:key="toast.uid">
            <button v-on:click="onCloseToast(toast)" class="btn btn-clear float-right"></button>
            {{toast.text}}
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import AbstractDialog from './abstract-dialog';
import { DataService } from '../services/data.service';
import { Toast } from '../models/toast';
import { ToastService } from '../services/toast.service';

@Component({
    name: 'toaster',
})
export default class Toaster extends AbstractDialog {

    private uid: number = 0;
    
    toasts: Toast[] = [];
    
    _intervalHandle: NodeJS.Timeout | null = null;

    created() {
        this._intervalHandle = setInterval(() => {
            this.houskeep();
        }, 1000);

        ToastService.getInstance().listen(this.dispatch.bind(this));
    }

    dispatch(text: string, duration: number, className?: string) {
        // Prevent multiple equal messages
        for (let i = 0; i < this.toasts.length; i++) {
            if (this.toasts[i].text === text && this.toasts[i].class === className) {
                return; // Ignore ...
            }
        }

        this.toasts.push({
            uid: this.uid++,
            text,
            duration: duration,
            class: className,
            isHiding: false,
        });
    }

    getClassNames(toast: Toast) {
        return {
            toast: true,
            ...(toast.class ? { [toast.class]: true } : {}),
            'animate__animated': true,
            'animate__fadeInDown': !toast.isShown,
            'animate__fadeOutUp': toast.isHiding,
        };
    }

    houskeep() {
        for (let i = 0; i < this.toasts.length; i++) {
            this.toasts[i].duration--;
            this.toasts[i].isShown = true;

            if (this.toasts[i].duration <= 0) {
                if (this.toasts[i].isHiding) {
                    this.toasts.splice(i, 1);
                } else {
                    this.toasts[i].isHiding = true;
                }
            }
        }
    }

    onCloseToast(toast: Toast) {
        const idx = this.toasts.indexOf(toast);
        this.toasts.splice(idx, 1);
    }

}

</script>

<style scoped lang="scss">

#toast-container {
    width: 50%;
    min-width: 400px;
    position: absolute;
    z-index: 999;
    top: 1.25rem;
    margin-left: 25%;
    
    .toast {
        box-shadow: 0 0.25rem 1rem rgba(48,55,66,.15);
        margin-top: .75rem;
    }
}

</style>
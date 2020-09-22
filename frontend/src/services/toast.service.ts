import Vue from 'vue';

export class ToastService {

    private toastEventBus = new Vue();

    alert(text: string, duration?: number) {
        this.toastEventBus.$emit('toast', [text, duration || 10, 'toast-error']);
    }

    success(text: string, duration?: number) {
        this.toastEventBus.$emit('toast', [text, duration || 5, 'toast-success']);
    }

    info(text: string, duration?: number) {
        this.toastEventBus.$emit('toast', [text, duration || 8]);
    }

    listen(dispatchFn: (text: string, duration: number, className?: string) => void): void {
        this.toastEventBus.$on('toast', (args: [string, number, (string | undefined)?]) => {
            dispatchFn.apply(null, args);
        });
    }

    static getInstance(): ToastService {
        return INSTANCE;
    }

}

const INSTANCE = new ToastService();

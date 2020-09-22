import { Component, Vue } from 'vue-property-decorator';

type KeyUpCallback = (((this: GlobalEventHandlers, ev: KeyboardEvent) => any) & ((this: Window, ev: KeyboardEvent) => any));

@Component({})
export default class AbstractDialog extends Vue {

  private originalOnKeyUpFn: KeyUpCallback | null = null;

  mounted() {
    this.originalOnKeyUpFn = window.onkeyup;
    window.onkeyup = (e: KeyboardEvent) => { if (e.keyCode === 27) { this.close(); } };
  }

  destroyed() {
    window.onkeyup = this.originalOnKeyUpFn || null;
  }

  close(event?: Event): boolean {
    if (event) {
      event.preventDefault();
    }
    this.$emit('close');
    return false;
  }

}
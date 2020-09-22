<template>

    <div class="modal active">
        <a href="#close" class="modal-overlay" v-on:click="close()" aria-label="Close"></a>
        <div class="modal-container">
            <div class="modal-header">
                <a href="#close" class="btn btn-clear float-right" v-on:click="close()" aria-label="Close"></a>
                <div class="modal-title h5">
                    Über Homer
                </div>
            </div>
            <div class="modal-body">
                <strong>Homer {{versionString}}</strong><br/>
                <p>
                    &copy; 2020. Designed and built with <span class="text-error">♥</span> by Max.
                </p>
                
                <strong>Changelog:</strong>
                <pre class="changelog">{{changelog}}</pre>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" v-on:click="close()">Schließen</button>
            </div>
        </div>
    </div>

</template>

<script lang="ts">

import { Component, Vue, Prop } from 'vue-property-decorator';
import AbstractDialog from './abstract-dialog';
import { DataService } from '../services/data.service';

@Component({
    name: 'about-dialog',
})
export default class AboutDialog extends AbstractDialog {

  changelog: string = '';
  versionString: string = '';

  private dataService: DataService = DataService.getInstance();

  async mounted() {
    const [ver, changelog] = await Promise.all([
      this.dataService.getVersion(),
      this.dataService.getChangelog(),
    ]);

    this.versionString = ver;
    this.changelog = changelog;
  }

}

</script>

<style scoped lang="scss">

.changelog {
    max-height: 300px;
    height: 300px;
    overflow: scroll;
    border: solid 1px var(--color-border-light);
    padding: .75rem;
    font-size: 12px;
}

</style>
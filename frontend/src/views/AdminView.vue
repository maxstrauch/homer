<template>
    <div>
        <nav id="sub-nav">
            <div class="ctrls-container">
                <router-link to="/admin/user" v-has-role="'*'">
                    <i class="material-icons">people</i> Benutzer verwalten
                </router-link>
            </div>
            <div class="flex-grow-1"></div>
        </nav>
        <div id="view-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import EmployeeListSimple from '../components/EmployeeListSimple.vue';
import EmployeeListGrouped from '../components/EmployeeListGrouped.vue';
import { DataService } from '../services/data.service';
import { Employee } from '../models/employee';
import EmployeeEditDialog from '../components/EmployeeEditDialog.vue';
import { createLogger, Logger } from '../services/logger.service';
import { AuthService } from '../services/auth.service';

@Component({
    name: 'AdminView',
})
export default class AdminView extends Vue {

}

</script>

<style lang="scss" scoped>

nav#sub-nav {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: row;
    box-shadow: 0px 10px 16px 0px rgba(0, 0, 0, 0.075);
    border-bottom: solid 1px #e0e0e0;
    background-color: white;

    .ctrls-container {
        padding: .5rem;
    }
}

#view-container {
    padding: .75rem;
}

</style>
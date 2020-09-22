import Vue from 'vue';
import { createLogger } from '@/services/logger.service';
import { AuthService } from '@/services/auth.service';

const logger = createLogger(`hasRole`);

export default Vue.directive('hasRole', (el, binding) => {
    const currentRoles = AuthService.getInstance().getRoles();

    if (currentRoles.indexOf('*') > -1) {
        // Admin: go ahead!
        return;
    }

    let reqRoles: string[] = [];
    if (Array.isArray(binding.value)) {
        reqRoles = reqRoles.concat(binding.value);
    } else {
        reqRoles.push(`${binding.value}`);
    }

    const hasRole: boolean = reqRoles.map((role) => (currentRoles.indexOf(role) > -1)).reduce((a, v) => (a || v), false);

    logger.debug(el, reqRoles, currentRoles, hasRole);

    if (!hasRole) {
        el.style.display = 'none';
    }
});

import { RestService } from './rest.service';
import { LoginResponse, LoginToken } from '@/models/login';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import { Logger, createLogger } from './logger.service';
import { ToastService } from './toast.service';
import { SSOEnabledResponse } from '@/models/APILoginResponse';

export const LOCAL_STORAGE_SETTINGS_KEY = "homer.userData";
export const COOKIE_TOKEN_NAME = "htoken";
export const LOCAL_STORAGE_API_KEY = "apiKey";

let INSTANCE: AuthService | null = null;

export class AuthService extends RestService {

    private toast: ToastService = ToastService.getInstance();

    private apiToken: string | null = null;

    private loginToken: LoginToken | null = null;

    private userData: { [key: string]: string | number | boolean } = {};

    constructor(
        private readonly logger: Logger,
    ) {
        super();
        this.loadToken();
        this.loadProperties();

        this.logger.info(`New AuthService, signed in? ${this.isSignedIn()}`);

        this.checkIfExpired.bind(this);
        setInterval(this.checkIfExpired.bind(this), 5000);
    }

    async getApiKey(): Promise<string> {
        return this.apiToken || '';
    }

    getLogger(): Logger {
        return this.logger;
    }

    get userId(): string {
        return `${this.loginToken?.id || ''}`;
    }

    getTokenValue<T>(key: (keyof LoginToken)): T | null {
        return this.loginToken ? ((typeof this.loginToken[key]) !== 'undefined' ? (this.loginToken[key] as unknown as T): null) : null;
    }

    getUserName(): string {
        return `${this.loginToken?.name || ''}`;
    }

    getRoles(): string[] {
        return this.loginToken?.roles || [];
    }

    isSignedIn(): boolean {
        return !!this.apiToken && !!this.loginToken;
    }

    isKioskView(): boolean {
        return !!this.loginToken && this.loginToken.isKioskView === true;
    }

    async isOAuth2Supported(): Promise<SSOEnabledResponse | null> {
        try {
            const ret = await this.httpGet<SSOEnabledResponse>('/auth/sso/supported', {}, true);
            return ret;
        } catch (ex) {
            return null;
        }
    }

    async login(username: string, password: string): Promise<boolean> {
        try {
            const ret = await this.httpPost<LoginResponse>('login', {
                name: username,
                password: password,
            }, true);

            if (!ret) {
                throw new Error();
            }

            this.loadToken(ret.token);

            return true;
        } catch (ex) {
            return false;
        }
    }

    public setProperty<T>(key: string, val: T): T {
        this.userData[key] = val as unknown as string | number | boolean;
        this.logger.debug(`setProperty(${key}, ${val})`);
        this.storeProperties();
        return val;
    }

    public getProperty<T>(key: string, defaultValue?: T): T {
        if (!(key in this.userData)) {
            this.setProperty(key, defaultValue);
        }
        this.logger.debug(`getProperty(${key}, ${defaultValue}) = ${this.userData[key]}`);
        return this.userData[key] as unknown as T;
    }

    async logout(): Promise<boolean> {
        document.cookie = 'htoken=; Max-Age=-99999999;';
        localStorage.removeItem(LOCAL_STORAGE_API_KEY);
        localStorage.removeItem(LOCAL_STORAGE_SETTINGS_KEY);
        Cookies.remove(COOKIE_TOKEN_NAME);
        this.apiToken = null;
        this.loginToken = null;
        return true;
    }

    applySession(token: string): void {
        localStorage.setItem(LOCAL_STORAGE_API_KEY, token);
        this.loadToken();
    }

    // ---

    private loadToken(token?: string): void {
        if (!token && !this.apiToken) {
            this.apiToken = Cookies.get(COOKIE_TOKEN_NAME) || '';
        }

        if (localStorage.getItem(LOCAL_STORAGE_API_KEY)) {
            this.apiToken = localStorage.getItem(LOCAL_STORAGE_API_KEY);
            this.logger.debug(`Load API token from local storage`);
        }

        this.logger.info(`Load token:`, this.apiToken, token);

        try {
            this.loginToken = jwtDecode(token ?? (this.apiToken || ''));
            if (token) {
                this.apiToken = token;
            }
        } catch (ex) {
            this.apiToken = null;
            this.loginToken = null;
        }
        
        this.logger.info(`Load token:`, this.apiToken, this.loginToken);
    }

    private loadProperties() {
        if (!localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY)) {
            this.storeProperties();
        }

        try {
            const rawData = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY) || '';
            this.userData = JSON.parse(rawData);
            if (!this.userData) {
                throw new Error(`Failed to parse!`);
            }
        } catch (ex) {
            this.logger.error(`Failed to read user data:`, ex);
            this.logger.error(localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY));
            this.userData = {};
        }
    }

    private storeProperties() {
        localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(this.userData, null, 0));
    }

    private async checkIfExpired(): Promise<void> {
        if (!this.isSignedIn()) {
            return; // Nothing to do
        }

        let exp = 0;
        try {
            const ext: { exp: number; } = this.loginToken || { exp: 0 };
            exp = ext.exp || exp;
        } catch (_) { /* silence is gold */ }

        if (exp < Date.now()) {
            this.logger.info(`Session expired!`);
            this.toast.alert(`Ihre Sitzung ist abgelaufen! Bitte melden Sie sich erneut an.`);
            await this.logout();
            window.vueLocation.push({ name: 'Login' });
        }
    }    

    // ---

    static getInstance(): AuthService {
        return INSTANCE ?? (INSTANCE = new AuthService(createLogger(AuthService.name)));
    }

}

AuthService.getInstance();

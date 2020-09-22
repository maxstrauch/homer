import axios from "axios";
import { Logger } from './logger.service';
import { ToastService } from './toast.service';
const urlJoin = require('url-join');

export abstract class RestService {

    private toaster: ToastService = ToastService.getInstance();

    protected getFullUrlForEndpoint(endpoint: string): string {
        return urlJoin(window.location.origin, 'api', endpoint);
    }

    handleErrorInternally(err: (Error & { isAxiosError: boolean; response: { status: number; statusText: string; } })) {
        if (err.isAxiosError && err.response) {
            switch (err.response.status) {
                case 400:
                    this.toaster.alert(
                        `Der Server akzeptiert die Anfrage nicht, da die Argumente falsch oder unvollständig sind!`
                    );
                    return;

                case 401:
                    this.toaster.alert(
                        `Zugriff verweigert - Sie besitzen nicht genügend Rechte für diese Operation!`
                    );
                    return;

                case 413:
                    this.toaster.alert(
                        `Die angegebene Datei kann nicht hochgeladen werden, da sie zu groß ist!`
                    );
                    return;

                default:
                    this.toaster.alert(
                        (`Die Operation konnte aufgrund eines Fehlers nicht durchgeführt werden.`) + 
                        (err.response.statusText ? ` Fehlermeldung: ${err.response.statusText}` : '')
                    );
                    return;
            }
        } else {
            this.toaster.alert(
                `Es kann keine Verbindung mit dem Server hergestellt werden. Sind Sie offline?`
            );
        }
    }

    async httpGet<O>(endpoint: string, params?: any, throwError = false): Promise<O | null> {
        try {
            
            const resp = await axios.get<O>(this.getFullUrlForEndpoint(endpoint), {
                params: (params || {}),
                headers: {
                    'Authorization': `Bearer ${await this.getApiKey()}`
                }                
            });
            return resp.data;
        } catch (ex) {
            if (throwError) {
                throw ex;
            } else {
                this.handleErrorInternally(ex);
            }
        }
        return null;
    }

    async httpPost<T>(endpoint: string, body: any, throwError = false): Promise<T | null> {
        try {
            const resp = await axios.post(this.getFullUrlForEndpoint(endpoint), body, {
                headers: {
                    'Authorization': `Bearer ${await this.getApiKey()}`
                }
            });

            return resp.data;
        } catch (ex) {
            if (throwError) {
                throw ex;
            } else {
                this.handleErrorInternally(ex);
            }
        }
        return null;
    }

    async httpPut<I>(endpoint: string, body: I, throwError = false) {
        try {
            const resp = await axios.put(this.getFullUrlForEndpoint(endpoint), body, {
                headers: {
                    'Authorization': `Bearer ${await this.getApiKey()}`
                }
            });
            return resp.data;
        } catch (ex) {
            if (throwError) {
                throw ex;
            } else {
                this.handleErrorInternally(ex);
            }
        }
        return;
    }

    async httpDelete(endpoint: string, params?: any, throwError = false) {
        try {
            await axios.delete(this.getFullUrlForEndpoint(endpoint), { 
                params: (params || {}),
                headers: {
                    'Authorization': `Bearer ${await this.getApiKey()}`
                }  
            });
        } catch (ex) {
            if (throwError) {
                throw ex;
            } else {
                this.handleErrorInternally(ex);
            }
        }
        return;
    }

    abstract async getApiKey(): Promise<string>;

    abstract getLogger(): Logger;

}
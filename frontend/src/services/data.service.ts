import { RestService } from './rest.service';
import { AuthService } from './auth.service';
import { Employee, UpdateEmployeeStateRequest } from '../models/employee';
import axios from 'axios';
import { Logger, createLogger } from './logger.service';
import { User, CreateUser } from '../models/User';
import { ApiResponse } from '@/models/api-response';
import { EmployeeStateTransision, LAST_STATE_TRANSISIONS_KEY, LAST_STATE_TRANSISIONS_MAX } from '@/definitions';
import { EventService, TOPIC_EMPLOYEE_STATE_CHANGE } from './event.service';

let INSTANCE: DataService | null = null;

export class DataService extends RestService {

    private versionInfo: any;

    constructor(
        private readonly authService: AuthService,
        private readonly logger: Logger,
    ) {
        super();
    }

    async getApiKey(): Promise<string> {
        return this.authService.getApiKey() || '';
    }

    getLogger(): Logger {
        return this.logger;
    }

    /// ----

    async getEmployees(isShowAll: boolean): Promise<Employee[]> { 
        const emps: any = await this.httpGet('employees', 
            (isShowAll ? {} : { notState: 'OFFLINE' })
        );

        this.logger.info("Loaded employees:", (emps).data, isShowAll);

        return (emps.data || []) as any[];
    }

    async getEmployeeById(id: string): Promise<Employee> { 
        const emps: any = await this.httpGet(`employees/${id}`);
        this.logger.info("Loaded employee for id:", id, emps);
        return emps.data as Employee;
    }    

    async setEmployeeState(employeeId: string, state: string, description?: string): Promise<void> {
        try {
            await this.httpPut<UpdateEmployeeStateRequest>(
                `employees/${employeeId}/state`,
                {
                    state,
                    description
                },
                true
            );

            // Store the last state transitions inside the local store
            const lastChanges = this.authService.getProperty<EmployeeStateTransision[]>(LAST_STATE_TRANSISIONS_KEY, []);
            lastChanges.push({
                actionAt: new Date().toISOString(),
                employeeId: employeeId,
                targetState: state,
            });
            while (lastChanges.length > LAST_STATE_TRANSISIONS_MAX) {
                lastChanges.shift();
            }
            this.authService.setProperty<EmployeeStateTransision[]>(LAST_STATE_TRANSISIONS_KEY, lastChanges);
        } catch (ex) {
            this.handleErrorInternally(ex);
            throw ex;
        }
    }

    async saveEmployeeById(id: string, employee: Partial<Employee>) {
        await this.httpPut(`employees/${id}`, {
            email: employee.email,
            name: employee.name,
            abbr: employee.abbr,
            state: employee.state,
        });
    }

    async createEmployee(employee: Partial<Employee>): Promise<Employee | null> {
        const resp = await this.httpPost<Employee>(`employees`, employee);
        this.logger.info("Created employee:", resp);
        return resp;
    }

    subscribeEvents(evtHandler: (evt: string, payload: any) => void, filter?: string[]): EventSource {
        const eventSource = new EventSource(this.getFullUrlForEndpoint(`events`));
        eventSource.onerror = () => {
            //@ts-ignore
            console.error("ERROR", arguments);
        }
        eventSource.onmessage = (eventData: MessageEvent) => {
            try {
                const parsedData = JSON.parse(eventData.data);

                if (!parsedData.evt) {
                    throw new Error(`No event type defined!`);
                }

                if (filter && filter.includes(parsedData.evt)) {
                    evtHandler(parsedData.evt, parsedData.p || {});
                } else if (!filter) {
                    evtHandler(parsedData.evt, parsedData.p || {});
                }

                // Forward events
                if (parsedData.evt === 'OnConnect') {
                    EventService.emit<string | null>(TOPIC_EMPLOYEE_STATE_CHANGE, null);
                } else if (parsedData.evt === 'EmployeeStateChange') {
                    EventService.emit<string | null>(TOPIC_EMPLOYEE_STATE_CHANGE, parsedData.p?.employee?.id || null);
                }
            } catch (ex) {
                this.logger.error(`Cannot parse event data from server:`, ex, eventData);
            }
        };
        return eventSource;
    }

    async changePassword(id: string, password: string, newPassword: string): Promise<boolean> {
        try {
            await this.httpPut(`users/${id}/password`, { 
                newPassword,
                password,
            }, true);
            return true;
        } catch (ex) {
            this.logger.error(`changePassword(${id}, ...) failed:`, ex);
            return false;
        }
    }

    async uploadAvatar(employeeId: string, file: File): Promise<Employee | null> {
        var formData = new FormData();
        formData.append("file", file);

        let res = null;
        try {
            res = await axios.put<Employee>(
                this.getFullUrlForEndpoint(`employees/${employeeId}/avatar`), 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${this.getApiKey()}`
                    }
                }
            );
        } catch (ex) {
            this.handleErrorInternally(ex);
        }

        return res ? res.data : null;
    }

    async deleteEmployee(employeeId: string): Promise<boolean> {
        try {
            await this.httpDelete(`employees/${employeeId}`);
            return true;
        } catch (ex) {
            return false;
        }
    }

    async deleteAvatar(employeeId: string): Promise<void> {
        await this.httpDelete(`employees/${employeeId}/avatar`);
        this.logger.info("Deleted avatar");
    }

    async getAvailableStates(): Promise<Array<{ id: string; icon: string; name: string; description: string; }>> {
        return [
            {
                id: 'HOMEOFFICE',
                icon: 'home_work',
                name: 'Homeoffice',
                description: 'Im Homeoffice anwesend melden',
            },
            {
                id: 'PAUSE',
                icon: 'free_breakfast',
                name: 'Pause',
                description: 'Aktuell in der Pause bzw. gerade nicht erreichbar',
            },
            {
                id: 'CUSTOMER',
                icon: 'calendar_today',
                name: 'Kundentermin',
                description: 'Anwesend aber auf einem Kundentermin und nicht (gut) erreichbar',
            },
            {
                id: 'OFFLINE',
                icon: 'exit_to_app',
                name: 'Offline',
                description: 'Für heute das Homeoffice verlassen',
            },
        ];
    }

    private async load() {
        this.versionInfo = await this.httpGet(`status`);
    }

    async getVersion(): Promise<string> {
        if (!this.versionInfo) {
            await this.load();
        }
        return `v.${this.versionInfo ? this.versionInfo.version : 'N/A'}`;
    }

    async getChangelog(): Promise<string> {
        return (await this.httpGet('changelog.txt')) || '';
    }

    async getUsers(): Promise<User[]> {
        const resp = await this.httpGet<ApiResponse<User[]>>('users');
        return resp?.data ?? [];
    }

    async deleteUserById(id: string): Promise<void> {
        await this.httpDelete(`users/${id}`);
    }

    async createUser(newUser: CreateUser) {
        await this.httpPost<CreateUser>(`users`, newUser);
    }

    async updateUserById(id: string, user: Partial<User>) {
        await this.httpPut(`users/${id}`, user);
    }

    // ---

    static getInstance(): DataService {
        return INSTANCE ?? (INSTANCE = new DataService(
            AuthService.getInstance(),
            createLogger(DataService.name),
        ));
    }

}

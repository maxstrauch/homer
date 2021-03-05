
export class Config {

    static get PORT(): number {
        return Number(process.env.PORT) || 3009;
    }

    static get JWT_SECRET(): string {
        return process.env.SECRET || "this is secret!";
    }

    static get COOKIE_NAME(): string {
        return "htoken";
    }

    static get SQLITE_FILE_PATH(): string {
        return "data/db.sqlite";
    }

    static get ENABLED_WEBHOOKS(): string {
        return process.env.WEBHOOKS || '';
    }

    static get SLACK_API_URL(): string | null {
        return process.env.SLACK_API_URL || null;
    }

    static get SLACK_CHANNEL_NAME(): string | null {
        return process.env.SLACK_CHANNEL_NAME || null;
    }

    static get MAX_FILE_SIZE(): number {
        return 26214400; // 25 MB
    }

    static get USER_TOKEN_EXP_DAYS(): number {
        return 14;
    }

    static get DIRECT_TOKEN_EXP_DAYS(): number {
        return 365;
    }

    static get OAUTH_SETTINGS() {
        return {
            externalAppBaseUrl: process.env.EXTERNAL_APP_BASE_URL || '',
            oauth2ClientId: process.env.OAUTH2_CLIENT_ID || '',
            oauth2ClientSecret: process.env.OAUTH2_CLIENT_SECRET || '',
            oauth2AuthorizeEndpoint: process.env.OAUTH2_AUTHORIZE_ENDPOINT || 'https://accounts.google.com/o/oauth2/v2/auth',
            oauth2TokenEndpoint: process.env.OAUTH2_TOKEN_ENDPOINT || 'https://www.googleapis.com/oauth2/v4/token',
            oauth2UserInfoEndpoint: process.env.OAUTH2_USER_INFO_ENDPOINT || 'https://www.googleapis.com/oauth2/v3/userinfo',
            oauth2ProviderDisplayName: process.env.OAUTH2_PROVIDER_DISPLAY_NAME || 'Google',
            roleForOAuth2User: process.env.OAUTH2_USER_ROLE || 'default',
        };
    }

}

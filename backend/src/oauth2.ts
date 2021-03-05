import { AccessToken, AuthorizationCode } from 'simple-oauth2';
import axios from 'axios';
import Joi from 'joi';
import { Config } from './config';
import { URL } from 'url';
import debug from 'debug';
const urlJoin = require('url-join');

const logger = debug('app:oauth2');

export type OAuth2SupportedResponse = {
    isSupported: boolean;
    authRedirectUrl: string;
    name: string;
};

/**
 * Checks if OAuth2 SOO is supported for the current configuration
 */
export function supportsOAuth2(): OAuth2SupportedResponse {
    if (OAUTH2_CLIENT === null) {
        return {
            isSupported: false,
            authRedirectUrl: '',
            name: '',
        };
    }

    return {
        isSupported: true,
        authRedirectUrl: urlJoin(Config.OAUTH_SETTINGS.externalAppBaseUrl, 'api/auth/sso/auth'), 
        name: Config.OAUTH_SETTINGS.oauth2ProviderDisplayName || '',
    };
}

/**
 * Generates a redirect URL for login
 */
export function getRedirectUrl(): string {
    if (!OAUTH2_CLIENT) {
        throw new Error(`Single sign-on not supported!`);
    }

    const authorizationUri = OAUTH2_CLIENT.authorizeURL({
        redirect_uri: REDIRECT_URL_ASSERT,
        scope: 'profile email',
        state: `state_${Math.random().toString(32).substring(3)}_${Date.now()}`
    });

    return authorizationUri;
}

export type OAuth2CallbackResponse = {
    code: string;
    scope: string;
};

export type OAuth2UserData = {
    id: string; // User id
    name: string; // Full name
    given_name: string;
    family_name: string;
    picture: string; // URL to profile image
    email: string;
    locale: string; // Language code
}

/**
 * Validates the OAuth2 reponse from the IdP and returns the
 * data of the current user
 * 
 * @param response The response including the OAuth2 code etc.
 */
export async function validateOAuth2CallbackResponse(response: OAuth2CallbackResponse): Promise<OAuth2UserData> {
    if (!OAUTH2_CLIENT) {
        throw new Error(`SSO not configured`);
    }

    // Try to validate the response by requesting a token from the IdP
    let ret: AccessToken | null = null;
    try {
        ret = await OAUTH2_CLIENT.getToken({
            code: response.code,
            scope: response.scope,
            redirect_uri: REDIRECT_URL_ASSERT,
        });
    } catch (ex) {
        logger(`Failed to perfrom SSO login:`, ex, response);
        throw new Error(`Invalid token from IdP received`);
    }

    // Try to fetch the user data
    try {
        const retUserData = await axios({
            method: 'GET',
            url: Config.OAUTH_SETTINGS.oauth2UserInfoEndpoint,
            headers:{
                'Authorization': `Bearer ${ret.token.access_token}`,
            }
        });

        const data = retUserData.data;
        data.id = data.sub;
        delete data.sub;

        return data as OAuth2UserData;
    } catch (ex) {
        logger(`Failed to request user information:`, ex);
        throw new Error(`Cannot read user-data from the IdP`);
    }
}


// Configure OAuth2 SSO, if available
// ---
let OAUTH2_CLIENT: AuthorizationCode | null = null;
const REDIRECT_URL_ASSERT = urlJoin(Config.OAUTH_SETTINGS.externalAppBaseUrl, 'api/auth/sso/assert');

try {
    Joi.assert(
        Config.OAUTH_SETTINGS, 
        Joi.object({
            externalAppBaseUrl: Joi.string().uri({ allowRelative: false, scheme: ['http', 'https'] }).required(),
            oauth2ClientId: Joi.string().min(1).max(400).required(),
            oauth2ClientSecret: Joi.string().min(1).max(400).required(),
            oauth2AuthorizeEndpoint: Joi.string().uri({ allowRelative: false, scheme: ['http', 'https'] }).required(),
            oauth2TokenEndpoint: Joi.string().uri({ allowRelative: false, scheme: ['http', 'https'] }).required(),
            oauth2UserInfoEndpoint: Joi.string().uri({ allowRelative: false, scheme: ['http', 'https'] }).required(),
            oauth2ProviderDisplayName: Joi.string().min(1).max(100).optional(),
            roleForOAuth2User: Joi.string().allow('*', 'default', 'kiosk').required(),
        })
    );

    const authEndpointUrl = new URL(Config.OAUTH_SETTINGS.oauth2AuthorizeEndpoint);
    const tokenEndpointUrl = new URL(Config.OAUTH_SETTINGS.oauth2TokenEndpoint);

    const config = {
        client: {
          id: Config.OAUTH_SETTINGS.oauth2ClientId,
          secret: Config.OAUTH_SETTINGS.oauth2ClientSecret
        },
        auth: {
            authorizeHost: authEndpointUrl.origin,
            authorizePath: authEndpointUrl.pathname,
            tokenHost: tokenEndpointUrl.origin,
            tokenPath: tokenEndpointUrl.pathname,
        }
    };

    OAUTH2_CLIENT = new AuthorizationCode(config);
    logger(`OAuth2 configured:`);
    logger(`OAuth2: assert redirect endpoint = ${REDIRECT_URL_ASSERT}`);
    logger(`OAuth2: authorize endpoint = ${Config.OAUTH_SETTINGS.oauth2AuthorizeEndpoint}`);
    logger(`OAuth2: token endpoint = ${Config.OAUTH_SETTINGS.oauth2TokenEndpoint}`);
    logger(`OAuth2: client id = ${Config.OAUTH_SETTINGS.oauth2ClientId}`);
    logger(`OAuth2: target role for oauth users = ${Config.OAUTH_SETTINGS.roleForOAuth2User}`);
} catch (ex) {
    logger(`Error: OAuth2 SSO not supported or configured:`, (ex.details || [`${ex}`]).map((d: any) => d.message).join(', '));
    OAUTH2_CLIENT = null;
}

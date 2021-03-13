import { Request, Response } from "express";
import { OAuth2CallbackResponse, OAuth2UserData, validateOAuth2CallbackResponse } from "../oauth2";
import { Config } from "../config";
import { AuthInfo } from "../models/AuthenticatedRequest";
import * as jwt from 'jsonwebtoken';
import { UserEntity } from "../models/UserEntity";
const urlJoin = require('url-join');

export async function AssertOAuthLogin(req: Request, res: Response) {
    let ret: OAuth2UserData | null = null;
    try {
        ret = await validateOAuth2CallbackResponse(req.query as OAuth2CallbackResponse);
    } catch (ex) {
        res.redirect(urlJoin(Config.OAUTH_SETTINGS.externalAppBaseUrl, `#/login?error=1&errmsg=${ex.message}`));
        return;
    }

    if (!ret) {
        res.redirect(urlJoin(Config.OAUTH_SETTINGS.externalAppBaseUrl, `#/login?error=1&errmsg=Unknown error`));
        return;
    }

    const payloadToken: AuthInfo = {
        id: `${ret.id}`,
        name: ret.email || ret.name,
        roles: [
            Config.OAUTH_SETTINGS.roleForOAuth2User || 'default',
        ],
        isSSO: true,
    };
    payloadToken.exp = Date.now() + 1000*24*60*60 * Config.USER_TOKEN_EXP_DAYS;

    // Check if there is a user with that name to "overlay" it
    const user = await UserEntity.findOne({
        where: {
            name: ret.email || ret.name
        },
    });
    if (user) {
        payloadToken.roles = user.getRoles();
        payloadToken.id = `${user.id}`;
    }

    const token = jwt.sign(payloadToken, Config.JWT_SECRET);
    
    res
        .cookie(Config.COOKIE_NAME, token, { expires: new Date(payloadToken.exp), httpOnly: false })
        .status(200)
        .redirect(Config.OAUTH_SETTINGS.externalAppBaseUrl);
}

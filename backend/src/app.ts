import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import os from "os";
import bodyParser from "body-parser";
import { HandleErrors } from "./middlewares/errorHandler";
import { asyncRouteHandler as a } from "./middlewares/asyncRouteHandler";
import { Config } from "./config";
import { HandleAuthentication } from "./middlewares/authenticationHandler";
import { initStorage } from "./storage";
import {
    ChangeEmployeeState,
    ChangePassword,
    ListUsers,
    CreateUser,
    ChangeUser,
    DeleteUser,
    Logout,
    DeleteAvatar,
    UpdateEmployee,
    Login,
    CreateEmployee,
    UpdateEmployeeAvatar,
    GetAvatar,
    DeleteEmployee,
    ListEmployees,
    AutoLogin,
    Version,
    Events,
    SupportsOAuthLogin,
    PerformOAuthLogin,
    AssertOAuthLogin,
    GetEmployeeById,
} from "./endpoints";
import { requireRole } from "./middlewares/hasRole";
import { initHooks } from "./webhooks";

async function main() {
    await initStorage();
    await initHooks();

    const app = express();
    const upload = multer({
        dest: os.tmpdir(),
        limits: {
            fileSize: Config.MAX_FILE_SIZE
        }
    });
    console.log("Temp Dir: ", os.tmpdir());

    app.options('*', cors());
    app.use(cors());
    app.use(bodyParser.json());
    app.use(cookieParser());

    app.use('/', express.static(__dirname + '/../public'));

    const router = express.Router();

    router.get('/auth/sso/supported', a(SupportsOAuthLogin));
    router.get('/auth/sso/auth', a(PerformOAuthLogin));
    router.get('/auth/sso/assert', a(AssertOAuthLogin));

    router.get('/status', a(Version));
    router.post('/login', a(Login));
    router.get('/AutoLogin', a(AutoLogin));
    app.get('/AutoLogin', a(AutoLogin));
    router.use(HandleAuthentication);
    router.get('/logout', a(Logout));

    // Routes
    // ----
    router.post('/employees', requireRole('default'), a(CreateEmployee));
    router.get('/employees', a(ListEmployees));
    router.get('/employees/:id', a(GetEmployeeById));
    router.put('/employees/:id', requireRole('default'), a(UpdateEmployee));
    router.delete('/employees/:id', requireRole('default'), a(DeleteEmployee));
    router.get('/employees/:id/avatar', a(GetAvatar));
    router.put('/employees/:id/avatar', upload.single('file'), a(UpdateEmployeeAvatar));
    router.delete('/employees/:id/avatar', requireRole('default'), a(DeleteAvatar));
    router.put('/employees/:id/state', a(ChangeEmployeeState));

    router.get('/users', requireRole('admin'), a(ListUsers));
    router.post('/users', requireRole('admin'), a(CreateUser));
    router.put('/users/:id', requireRole('admin'), a(ChangeUser));
    router.put('/users/:id/password', a(ChangePassword));
    router.delete('/users/:id', requireRole('admin'), a(DeleteUser));

    router.get('/events', a(Events));
    router.use('/', express.static(__dirname + '/../public'));

    app.use('/api', router);

    app.use('/', router);

    app.use(HandleErrors);

    app.listen(Config.PORT, function () {
        console.log(`[${(new Date()).toISOString()}] Server listening on port ${Config.PORT} ...`);
    });
}

main().catch((ex) => { console.error(ex); process.exit(1); });
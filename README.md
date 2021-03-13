<img align="left" width="64" height="64" src="docu/logo.png?raw=true" alt="Homer app icon" />

# Homer

Homer, _aka_ "The Homeoffice-Manager", is a simple tool to keep track over who is currently in homeoffice or at other locations. It is therefore especially useful for small to mid-sized companies, groups or clubs. _But you can certainly use it to "monitor" any other fitting use-case._

![Screenshot of the main web-interface](docu/screenshots/main-screen.png?raw=true "Screenshot of the main web-interface of Homer")

__Technologies:__ [NodeJS](https://nodejs.org/en/), [SQLite](https://www.npmjs.com/package/sqlite3) (backend) and [VueJS](https://vuejs.org/), [Spectre.css](https://picturepan2.github.io/spectre/) (frontend), both using [TypeScript](https://www.typescriptlang.org/)

---

# How to use

There is a docker image available on Docker Hub:

 
    docker run --rm -it -v $(pwd):/app/data/ -p 3000:8080 maxstrauch/homer:latest

Open the browser at [http://localhost:3000](http://localhost:3000).

__Note:__ initially the user `admin` is created with a random password. It is shown on the console output of the container.

You can certainly use a fixed version (and should on production). The database file will be created in the current directory on the host where this command is executed.

# Features

 * Track the _working-state_ employees by photo or initials 
 * Simple app, focused on one use-case: _who is where?_
 * Add employees with photos and names
 * Set the state of employees (Homeoffice, customer appointment, pause, offline)
 * Single Sign-On (SSO) via any compatible OAuth2 identity provider (Google, ...)
 * Create independent accounts to login
 * Create login-links (no username/password needed for login)
 * Slack integration to get notifications who changed state
 * Quick employee state toggle
 * Beautifully designed 😉

_Please have also a look at the `CHANGELOG` file with the full change history, if you are interested._

# Developing

In order to start developing, checkout this repository and then run `npm run dev`. This will install all dependencies and run the frontend and backend in dev mode with hot reloading. After this finished, you can open `http://localhost:1234` in your browser.

# Project history & background

Homer came as an idea into my mind last year (2019) when Homeoffice got more and more important for me. Finally the development started in January 2020, before COVID-19 was that big of a thing. But it is a perfect use-case for it. 

Initially I wanted to use the project _"only"_ to try out new technologies (I'm used to working with the Angular & NodeJS stack) and get further insights on new technologies.

The tool developed more and more into a productive tool, when it got introduced as the main tool to visually see the presence at my current employer. It has been tested in a "private beta" there since February 2020. And finally I'm going to release it to the public.

# Single Sign-On configuration

In order to use Single Sign-On support, the following environment variables need to be set for the container:

- `EXTERNAL_APP_BASE_URL`: The base URL of the app, e.g. _https://homer.example.org/_
- `OAUTH2_CLIENT_ID`: The client id, configured at your OAuth2 IdP
- `OAUTH2_CLIENT_SECRET`: The client secret, configured at your OAuth2 IdP
- `OAUTH2_AUTHORIZE_ENDPOINT`: The URL to the OAuth2 compatible authorization (frontend flow) API endpoint, e.g. for Google SSO: _https://accounts.google.com/o/oauth2/v2/auth_ __(default)__
- `OAUTH2_TOKEN_ENDPOINT`: The URL to the OAuth2 compatible token API endpoint, e.g. for Google SSO: _https://www.googleapis.com/oauth2/v4/token_ __(default)__
- `OAUTH2_USER_INFO_ENDPOINT`: The URL to the OAuth2 user information endpoint, e.g. for Google SSO: _https://www.googleapis.com/oauth2/v3/userinfo_ __(default)__
- `OAUTH2_PROVIDER_DISPLAY_NAME`: Display name (shown in the app) for the OAuth2 IdP, e.g. _Google_ __(default)__
- `OAUTH2_USER_ROLE`: The role which is assigned by Homer to any user which loggs in via SSO. It can be one of the following values: `*` for admin, `kiosk` to view Homer only or `default` __(default)__ to read and write

Besides this you need to configure the "assert" endpoint (where the user is redirected after successful login at the IdP). It's value is `${EXTERNAL_APP_BASE_URL}/api/auth/sso/assert` (also printed out on service start to stdout).

# Upcoming features

The following features are planned for the near future (whenever I have some spare time for it 😉):

 * Add translation of English / German language with switcher
 * Favicon shows the current state (if previous enabled)
 * Dynamic states: new can be created
 * Fixup of long-term execution (browser tab never closed) issues
 * Get details about the last state change
 * Cleanup of legacy stuff

# License

This software is licensed under the MIT License. See file `LICENSE`. If you like this software, feel free to contact me and inform me - I'ld appreciate it 😉

# Screenshots

__"Kiosk" mode (no controls, for running on a big monitor in the office):__

![Kiosk-mode of Homer](docu/screenshots/kiosk-mode.png?raw=true "Kiosk-mode of Homer")

__Different view modes are available (grouped, compact):__

![View modes of homer](docu/screenshots/overview-screen.png?raw=true "View modes of homer")

__Edit dialog for employees (new/existing):__

![Main employee edit dialog](docu/screenshots/employee-edit-dialog.png?raw=true "Main employee edit dialog")

__Main user admin view:__

![User admin view](docu/screenshots/user-admin.png?raw=true "User admin view")

__Login screen:__

![Login screen](docu/screenshots/login-screen.png?raw=true "Login screen")

# Trivia

It is rather courious, but initially I created a logo for Homer which is very similar to the right now, commonly used logo for COVID-19. As you can see, the final file has been created on 29th of February 2020 and this is way before the first logos for COVID-19 have been spreading (and I did concept art even before that).

The message I wanted to show with the logo is, that multiple nodes are connected to a central hub, _aka_ Homer. But it certainly works for a virus, too 😅. So I changed the logo the new one shown here. But I don't wanted to sweep this story under the carpet.

![Original logo of Homer](docu/trivia_initial-logo.png?raw=true "Original logo of Homer")

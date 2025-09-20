<p align="center">
  <a href="http://nodejs.org/" target="blank"><img src="https://nodejs.org/static/images/logo.svg" width="200" alt="Node.js Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nodejs/node/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nodejs/node

  <p align="center">A powerful <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/org/nodejs" target="_blank"><img src="https://img.shields.io/npm/v/node.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/org/nodejs" target="_blank"><img src="https://img.shields.io/npm/l/node.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/org/nodejs" target="_blank"><img src="https://img.shields.io/npm/dm/node.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nodejs/node" target="_blank"><img src="https://img.shields.io/circleci/build/github/nodejs/node/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nodejs/node?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nodejs/node/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/node#backer" target="_blank"><img src="https://img.shields.io/badge/Backers-Open%20Collective-41B883.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/node#sponsor" target="_blank"><img src="https://img.shields.io/badge/Sponsors-Open%20Collective-41B883.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/nodejs" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/node#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nodejs" target="_blank"><img src="https://img.shields.io/twitter/follow/nodejs.svg?style=social&label=Follow"></a>
</p>

# Core NodeJS Project Typescript
This project is a Node.js application built with TypeScript. It uses Express for the web server, Knex.js for database migrations and queries, and various other libraries for handling authentication, file uploads, and more.

##### Table of Contents
- Installation
- Configuration
- Scripts
- Project Structure
- Database Migrations
- API Endpoints
- License

##### Installation

1. Clone the repository:
```bash
    git clone <repository-url>
    cd core_nodejs_ts
```
2. Install dependencies:
```bash
    npm install
```

3. Create a .env file in the root directory and add the following environment variables:
```bash
    PORT=10093
    PORT_SOCKET=10094
    ACCESS_TOKEN_SECRET="ACCESS_TOKEN_SECRET"
    REFRESH_TOKEN_SECRET="REFRESH_TOKEN_SECRET"
    DB_NAME="core_nodejs_ts"
    DB_USER_NAME="root"
    DB_USER_PASS=""
    DB_HOST="localhost"
    DB_PORT=3306
    EMAIL_PASS="ckvnixgpidkecgpm"
    EMAIL_USERNAME="maseotrang2020@gmail.com"
    NODE_ENV='local'
```

##### Configuration
The project uses a knexfile.js  for database configuration. Ensure your .env file contains the correct database credentials.

##### Scripts
- Build the project:
```bash
    npm run build
```
- Start the project:
```bash
    npm start
```

- Run the project in development mode:
```bash
    npm run dev
```

- Run database migrations:
```bash
    npx knex migrate:latest --env development
```

- Rollback the last migration:
```bash
    npx knex migrate:rollback --env development
```

##### Project Structure
```bash
    .env
    .gitignore
    knexfile.js
    migrations/
        20241011115840_create_roles_table.js
        20241011115843_create_users_table.js
        20241011115845_create_user_roles_table.js
        20241015153814_otps_table.js
        20241206084237_add_email_to_users_table.js
        20241206090113_add_verifyEmail_to_users_table.js
        20241206093249_update_opts_table.js
    note.txt
    package.json
    readme.md
    src/
        configs/
        constants/
        controllers/
        core/
        db/
        environments/
        global.d.ts
        helpers/
        index.ts
        interfaces/
        middlewares/
        router/
        services/
        utils/
    test_ictu/
        main.js
        tinhdiem.js
    tsconfig.json
```

- migrations: Contains database migration files.
- src: Contains the main source code of the application.
- test_ictu: Contains test-related files.
- tsconfig.json: TypeScript configuration file.
- package.json: Project metadata and dependencies.

##### Database Migrations
To create a new migration:
```bash
    npx knex migrate:make <migration_name> --env development
```

To run all pending migrations:
```bash
    npx knex migrate:latest --env development
```

To rollback the last migration:
```bash
    npx knex migrate:rollback --env development
```

##### API Endpoints
    Authentication
        - Register: POST /api/auth/register
        - Login: POST /api/auth/login
        - Forgot Password: POST /api/auth/forgot-password
        - Send Email: POST /api/auth/send-email
        - Verify Email: POST /api/auth/verify-email
    User Profile
        - Get Profile: GET /api/profile
    File Upload
        - Upload Single File: POST /api/media/file
        - Upload Multiple Files: POST /api/media/files
        - Delete File: DELETE /api/media/file
    Dynamic Endpoints
        - Create Record: POST /api/:router
        - Get Records: GET /api/:router
        - Update Record: PUT /api/:router/:id
        - Delete Record: DELETE /api/:router/:id
    Destroy records: DELETE /api/destroy/:router/:id
##### API Endpoints
This project is licensed under the MIT License.
    


// src/index.ts
import express, { Express } from "express";
import https from "https"; // Import https module
import http from "http"; // Import http module
import fs from "fs"; // Import file system module
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";
import { BcryptService } from "@services/bcrypt.service";

// Load environment variables
dotenv.config();

// Import router
import route from "./router/index.router";

// Connect to DB
import "./db/config.db";
import swaggerDocs from "./swagger/swagger";

// Initialize Express app
const app: Express = express();

// Port configuration
const port = process.env.PORT || 5000;

// Serve static files
app.use(express.static(__dirname + "/public"));

// Use body-parser for JSON
app.use(bodyParser.json());

// Configure CORS
app.use(cors({ origin: '*' }));

// Serve static files (to access images from public folder)
app.use('/img_avatar', express.static(path.join(__dirname, 'public/img_avatar')));



// Define routes
route(app);

swaggerDocs(app, port);
// Determine whether to use HTTP or HTTPS based on the environment
const server = process.env.NODE_ENV === 'production'
    ? https.createServer({
        key: fs.readFileSync(path.join(__dirname, '../../../../conf/web/trang-dev.ictu.vn/ssl/trang-dev.ictu.vn.key')),
        cert: fs.readFileSync(path.join(__dirname, '../../../../conf/web/trang-dev.ictu.vn/ssl/trang-dev.ictu.vn.crt')),
        ca: fs.readFileSync(path.join(__dirname, '../../../../conf/web/trang-dev.ictu.vn/ssl/trang-dev.ictu.vn.ca')),
    }, app)
    : http.createServer(app);

// Start the server
server.listen(port, () => {
    console.log(`App running on ${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://localhost:${port}`);
});

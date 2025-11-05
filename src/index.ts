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

// SSL Configuration - Check if SSL certificates exist
const sslKeyPath = path.join(__dirname, '../../../../conf/web/haninhacademy.edu.vn/ssl/haninhacademy.edu.vn.key');
const sslCertPath = path.join(__dirname, '../../../../conf/web/haninhacademy.edu.vn/ssl/haninhacademy.edu.vn.crt');
const sslCaPath = path.join(__dirname, '../../../../conf/web/haninhacademy.edu.vn/ssl/haninhacademy.edu.vn.ca');

// Helper function to check if file exists
const fileExists = (filePath: string): boolean => {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
};

// Determine whether to use HTTP or HTTPS
let server;
let isHttps = false;

if (process.env.NODE_ENV === 'production' && 
    fileExists(sslKeyPath) && 
    fileExists(sslCertPath) && 
    fileExists(sslCaPath)) {
    try {
        server = https.createServer({
            key: fs.readFileSync(sslKeyPath),
            cert: fs.readFileSync(sslCertPath),
            ca: fs.readFileSync(sslCaPath),
        }, app);
        isHttps = true;
        console.log('SSL certificates found. Starting HTTPS server...');
    } catch (error) {
        console.warn('Failed to load SSL certificates, falling back to HTTP:', error);
        server = http.createServer(app);
    }
} else {
    if (process.env.NODE_ENV === 'production') {
        console.warn('SSL certificates not found. Starting in HTTP mode.');
        console.warn('Certificate paths checked:');
        console.warn(`  Key: ${sslKeyPath}`);
        console.warn(`  Cert: ${sslCertPath}`);
        console.warn(`  CA: ${sslCaPath}`);
    }
    server = http.createServer(app);
}

// Start the server
server.listen(port, () => {
    const protocol = isHttps ? 'https' : 'http';
    console.log(`✅ App running on ${protocol}://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

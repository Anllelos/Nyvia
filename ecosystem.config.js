/**
 * PM2 Configuration File for Hosting on VPS
 * 
 * This file is intended for users who are deploying the application 
 * using PM2 on a Virtual Private Server (VPS). 
 * Feel free to delete this file if not needed.
 */

module.exports = {
    apps: [{
        // Application name as it will appear in PM2
        name: "Razor",

        // Script to run the application
        script: "node index.js"
    }]
};
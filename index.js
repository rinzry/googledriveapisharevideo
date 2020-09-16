const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');
const log4js = require('log4js');

log4js.configure({
    appenders: { everything: { type: 'file', filename: 'logs.log' } },
    categories: { default: { appenders: ['everything'], level: 'ALL' } }
});

const logger = log4js.getLogger();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({
        "corpora": "drive",
        "driveId": "",
        "fields": "files(id, name, size, modifiedTime, thumbnailLink)",
        "includeItemsFromAllDrives": true,
        "orderBy": "modifiedByMeTime desc",
        "q": "visibility = 'limited' and mimeType contains 'video/'",
        "supportsAllDrives": true,
        "supportsTeamDrives": true
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            // logger.debug(files);
            console.log('Files:');
            // files.map((file) => {
            //     console.log(`${file.name} (${file.id})`);
            // });
            files.filter(file => file.modifiedTime < (new Date(Date.now() - 3.6e+6)).toISOString()).map((file) => {
                console.log(`${file.name} (${file.id}) (${file.thumbnailLink})`);

                logger.debug(`${file.name} (${file.id}) (${file.thumbnailLink})`);
                drive.permissions.create({
                    "fileId": `${file.id}`,
                    "supportsAllDrives": true,
                    "supportsTeamDrives": true,
                    "resource": {
                        "role": "reader",
                        "type": "anyone"
                    }
                }, (err, res) => {
                    if (err) { console.log('The API returned an error: ' + err); } else {
                        logger.debug(`File shared successfully: ${file.name} (https://drive.google.com/file/d/${file.id}/view?usp=drivesdk)`);
                    }
                })

            })
        } else {
            console.log('No files found.');
        }
    });
}
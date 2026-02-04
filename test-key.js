
const https = require('https');

const API_KEY = 'AIzaSyDeBXHiGYGHEW9OfOdJNcEchHQ_eM8ZePg';

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${API_KEY}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
};

console.log("Listing models for Key ending in:", API_KEY.slice(-4));

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            if (json.models) {
                console.log("Available Models:");
                json.models.forEach(m => {
                    if (m.supportedGenerationMethods.includes('generateContent')) {
                        console.log("- " + m.name);
                    }
                });
            } else {
                console.error("No models found or error:", JSON.stringify(json));
            }
        } catch (e) {
            console.error("Failed to parse response:", body);
        }
    });
});

req.on('error', (error) => {
    console.error("Network Error:", error);
});

req.end();

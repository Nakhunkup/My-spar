import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
// Serve static files from the current directory
app.use(express.static('.'));

const API_KEY = process.env.GEMINI_API_KEY;

// Match the Vercel route /api/chat
app.post('/api/chat', async (req, res) => {
    console.log("Received request at /api/chat");
    try {
        const { prompt, model = "gemini-2.0-flash" } = req.body;

        // Basic system instruction is handled by client in "prompt" for now,
        // or we can move it here if we want to secure the system prompt too.

        if (!API_KEY) {
            console.error("Server: API Key is missing!");
            return res.status(500).json({ error: { message: "Server: API Key not configured in .env file." } });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        console.log(`Forwarding request to Gemini (${model})...`);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", response.status, errorText);
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                // Non-JSON error from Google
                throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
            }
            throw new Error(errorData.error?.message || `Gemini API Error: ${errorText}`);
        }

        const data = await response.json();
        console.log("Gemini response received successfully.");
        res.json(data);

    } catch (error) {
        console.error("Server Error Handler:", error);
        res.status(500).json({ error: { message: error.message } });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    if (API_KEY) {
        console.log("API Key loaded: Yes (Ends with " + API_KEY.slice(-4) + ")");
    } else {
        console.error("WARNING: API Key NOT loaded. Check .env file.");
    }
});

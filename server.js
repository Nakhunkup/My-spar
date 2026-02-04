import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;

app.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // Basic system instruction (can be expanded)
        const systemInstruction = "คุณเป็นประธานพรรค สภาในโรงเรียน มีหน้าที่ตอบคำถามของ นักเรียนเกี่ยวกับการเมืองในโรงเรียน ตอบแค่คำถามที่ผู้ใช้ถามเท่านั้น หากคำถามไม่เกี่ยวข้องกับการเมืองในโรงเรียน ให้ตอบกลับอย่างสุภาพว่า 'ขออภัยครับ คำถามนี้อยู่นอกเหนือขอบเขตหน้าที่ของผม' หากผู้ใช้ถามชื่อครูในหมวดหลายคนให้ขึ้นบรรทัดใหม่ก่อนที่จะไปบอกชื่อครูคนถัดไป";

        // Construct the prompt
        // Note: For a more robust implementation, we should use the history properly.
        // For now, we'll keep it simple to match the original frontend logic which seemed to send a single prompt.
        // However, the original code had school data injection. We should probably accept the full prompt from client OR move that logic here.
        // To keep it simple and secure, we'll let the client send the "prompt" (which includes the system instruction and context constructed on client)
        // OR we can rebuild it here. 
        // Rebuilding here is safer but requires moving school_data.json reading here.
        // Let's stick to the prompt provided by the client's body for 'contents' to minimize friction, 
        // BUT we must inject the Key here.
        
        // Actually, the original code constructed `finalPrompt`. 
        // Let's accept `prompt` from the body.
        
        const finalPrompt = req.body.prompt; 
        const model = req.body.model || "gemini-1.5-flash";

        if (!API_KEY) {
            return res.status(500).json({ error: { message: "Server: API Key not configured." } });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Gemini API Error");
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: { message: error.message } });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when a link is clicked
    const navItems = document.querySelectorAll('.nav-links li a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // Simple Form Validation for Contact Page
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = contactForm.querySelectorAll('input, textarea');
            let isEmpty = false;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isEmpty = true;
                    input.style.borderColor = 'var(--primary-pink)';
                } else {
                    input.style.borderColor = '#ddd';
                }
            });

            if (isEmpty) {
                alert('Please fill in all fields.');
            } else {
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            }
        });
    }
    // Language Toggle
    const langToggleBtn = document.getElementById('lang-toggle');
    const translatableElements = document.querySelectorAll('[data-en][data-th]');

    // Check localStorage
    let currentLang = localStorage.getItem('language') || 'en';
    updateLanguage(currentLang);

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'th' : 'en';
            updateLanguage(currentLang);
            localStorage.setItem('language', currentLang);
        });
    }

    function updateLanguage(lang) {
        // Toggle body class
        if (lang === 'th') {
            document.body.classList.add('th-lang');
            langToggleBtn.textContent = '🇬🇧'; // Show flag to switch back to EN
        } else {
            document.body.classList.remove('th-lang');
            langToggleBtn.textContent = '🇹🇭'; // Show flag to switch to TH
        }

        // Update Text
        translatableElements.forEach(el => {
            if (lang === 'th') {
                el.textContent = el.getAttribute('data-th');
            } else {
                el.textContent = el.getAttribute('data-en');
            }
        });
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const chatbotContainer = document.getElementById("LUCAS-container");
    const closeBtn = document.getElementById("close-btn");
    const sendBtn = document.getElementById("send-btn");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotMessages = document.getElementById("LUCAS-messages");
    const chatbotBody = document.getElementById("LUCAS-body");
    const chatbotIcon = document.getElementById("LUCAS-by-T-Ying-icon");
    const ctaBtn = document.getElementById("cta-btn");
    // ตัวแปรเก็บชื่อโมเดลที่ใช้งานได้ (จะถูกเติมอัตโนมัติ)
    let currentModel = "gemini-1.5-flash";
    function openChat() {
        chatbotContainer.classList.remove("hidden");
        chatbotIcon.style.display = "none";
        setTimeout(() => chatbotInput.focus(), 100);
    }
    function closeChat() {
        chatbotContainer.classList.add("hidden");
        chatbotIcon.style.display = "flex";
    }
    if (chatbotIcon) chatbotIcon.addEventListener("click", openChat);
    if (closeBtn) closeBtn.addEventListener("click", closeChat);
    if (ctaBtn) ctaBtn.addEventListener("click", openChat);
    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (chatbotInput) {
        chatbotInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") sendMessage();
        });
    }
    async function sendMessage() {
        const userMessage = chatbotInput.value.trim();
        if (!userMessage) return;
        appendMessage("user", userMessage);
        chatbotInput.value = "";
        const loadingId = appendMessage("bot", "loading...");
        await getBotResponse(userMessage, loadingId);
    }
    function appendMessage(sender, message, customId = null) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        messageElement.textContent = message;
        if (customId) messageElement.id = customId;
        else if (sender === 'bot' && (message === 'loading...' || message === 'typing...')) {
            messageElement.id = 'loading-' + Date.now();
            messageElement.style.fontStyle = 'italic';
            messageElement.style.opacity = '0.7';
        }
        chatbotMessages.appendChild(messageElement);
        scrollToBottom();
        return messageElement.id;
    }
    function scrollToBottom() {
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }
    function updateLoadingMessage(elementId, newMessage) {
        const messageElement = document.getElementById(elementId);
        if (messageElement) {
            messageElement.textContent = newMessage;
            messageElement.style.fontStyle = 'normal';
            messageElement.style.opacity = '1';
            scrollToBottom();
        }
    }
    async function getBotResponse(userMessage, loadingId) {
        // Load API key from config.js (this file is gitignored)
        const apiKey = (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY) || '';
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (apiKey.includes("ใส่-API-KEY") || apiKey.length < 10) {
            updateLoadingMessage(loadingId, "ขอกราบขอความกรุณาใส่ API Key ในไฟล์ script.js ก่อนขอรับคุณชาย");
            return;
        }


        const systemInstruction = "คุณเป็นประธานพรรค สภาในโรงเรียน มีหน้าที่ตอบคำถามของ นักเรียนเกี่ยวกับการเมืองในโรงเรียน ตอบแค่คำถามที่ผู้ใช้ถามเท่านั้น หากคำถามไม่เกี่ยวข้องกับการเมืองในโรงเรียน ให้ตอบกลับอย่างสุภาพว่า 'ขออภัยครับ คำถามนี้อยู่นอกเหนือขอบเขตหน้าที่ของผม' หากผู้ใช้ถามชื่อครูในหมวดหลายคนให้ขึ้นบรรทัดใหม่ก่อนที่จะไปบอกชื่อครูคนถัดไป";

        let schoolDataText = "";
        try {
            const response = await fetch('school_data.json');
            if (response.ok) {
                const schoolData = await response.json();
                schoolDataText = "\n\nข้อมูลโรงเรียนประกอบการตอบคำถาม:\n" + JSON.stringify(schoolData, null, 2);
            } else {
                console.warn("Could not load school_data.json");
            }
        } catch (error) {
            console.warn("Error fetching school_data.json:", error);
        }

        const finalPrompt = `${systemInstruction}${schoolDataText}\n\nคำถามจากนักเรียน: ${userMessage}\n(หมายเหตุ: อย่าลืมขึ้นบรรทัดใหม่เมื่อตอบชื่อครูหลายคน)`;

        try {
            await fetchResponse(apiKey, currentModel, finalPrompt, loadingId);
        } catch (error) {
            console.warn("First attempt failed, trying to find available models...", error);

            try {
                const newModel = await findBestAvailableModel(apiKey);
                if (newModel) {
                    console.log("Switching to model:", newModel);
                    currentModel = newModel;
                    await fetchResponse(apiKey, newModel, finalPrompt, loadingId);
                } else {
                    updateLoadingMessage(loadingId, " Error: API Key เข้าถึงโมเดลไม่ได้เลย (กรุณาเช็คว่าเปิด Generative Language API ใน Google Cloud หรือยัง)");
                }
            } catch (retryError) {
                // ดักจับ Error ในรอบที่ 2 เพื่อไม่ให้ค้าง
                console.error("Retry failed:", retryError);
                updateLoadingMessage(loadingId, "บ่แม่นคับ Connection Failed: " + (retryError.message || "Unknown Error"));
            }
        }
    }

    // ฟังก์ชันส่งข้อความ
    async function fetchResponse(apiKey, model, prompt, loadingId) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "API Error");
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            updateLoadingMessage(loadingId, data.candidates[0].content.parts[0].text);
        } else {
            updateLoadingMessage(loadingId, "AI ไม่ตอบกลับ (No content generated)");
        }
    }
    // ฟังก์ชันค้นหาโมเดล
    async function findBestAvailableModel(apiKey) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await response.json();

            if (data.models) {
                const validModels = data.models.filter(m =>
                    m.supportedGenerationMethods &&
                    m.supportedGenerationMethods.includes("generateContent")
                );

                if (validModels.length > 0) {
                    // เลือกตัวแรกสุดที่เจอ (มักจะเป็นรุ่นมาตรฐาน)
                    const bestModel = validModels[0].name.replace("models/", "");
                    return bestModel;
                }
            }
        } catch (e) {
            console.error("Failed to list models:", e);
        }
        return null;
    }
});

// elements สำหรับสลับธีมคับ
const themeBtn = document.getElementById('theme-btn');
const themeLink = document.getElementById('theme-link');

// event listener สำหรับปุ่มสลับธีม
themeBtn.addEventListener('click', function () {
    // ตรวจสอบว่าตอนนี้ใช้ธีมอะไรอยู่
    const currentTheme = themeLink.getAttribute('href');

    if (currentTheme === 'style.css') {
        // เปลี่ยนเป็น cyber.css
        themeLink.setAttribute('href', 'cyber.css');
    } else {
        // สลับกลับมาเป็น style.css
        themeLink.setAttribute('href', 'style.css');
    }
});


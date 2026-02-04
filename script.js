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
    let currentModel = "gemini-2.0-flash";
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
        // API Key is now handled by the backend server
        // const apiKey = (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY) || '';
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        // if (apiKey.includes("ใส่-API-KEY") || apiKey.length < 10) {
        //    updateLoadingMessage(loadingId, "ขอกราบขอความกรุณาใส่ API Key ในไฟล์ script.js ก่อนขอรับคุณชาย");
        //    return;
        // }


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
            // Send request to backend
            await fetchResponse(null, currentModel, finalPrompt, loadingId);
        } catch (error) {
            console.warn("Attempt failed", error);
            updateLoadingMessage(loadingId, "Connection Failed: " + (error.message || "Unknown Error"));
        }
    }
    async function fetchResponse(apiKey, model, prompt, loadingId) {
        // Auto-detect URL: 
        // If on localhost but NOT port 3000 (e.g. Live Server 5500), point to backend at 3000.
        // Otherwise (Vercel or localhost:3000), use relative path.
        let apiUrl = '/api/chat';
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            if (window.location.port !== '3000') {
                apiUrl = 'http://localhost:3000/api/chat';
            }
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, model })
            });

            // Read text first to debug "Unexpected end of JSON"
            const responseText = await response.text();

            if (!response.ok) {
                // Try to parse error as JSON, otherwise use text
                let errorMessage = "API Error";
                try {
                    const errorData = JSON.parse(responseText);
                    // Add more debugging info
                    errorMessage = errorData.error?.message || errorData.message || ("API Error: " + JSON.stringify(errorData));
                } catch (e) {
                    errorMessage = `Server Error (${response.status}): ${responseText}`;
                }
                throw new Error(errorMessage);
            }

            if (!responseText) {
                throw new Error("Server returned empty response");
            }

            const data = JSON.parse(responseText);
            if (data.candidates && data.candidates.length > 0) {
                updateLoadingMessage(loadingId, data.candidates[0].content.parts[0].text);
            } else {
                updateLoadingMessage(loadingId, "AI ไม่ตอบกลับ (No content generated)");
            }
        } catch (error) {
            console.error("Fetch error details:", error);
            updateLoadingMessage(loadingId, "Error: " + error.message);
            // Don't rethrow here to prevent unhandled promise rejection logging in console that confuses user
        }
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



require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Check for required environment variables for Meta WhatsApp API
if (!process.env.META_WA_ACCESS_TOKEN || !process.env.META_WA_PHONE_NUMBER_ID || !process.env.META_WA_TEMPLATE_NAME) {
    console.error("Meta WhatsApp credentials are not set. Please update the .env file in the /backend directory.");
    process.exit(1);
}

// --- Initialize Meta WhatsApp Credentials ---
const accessToken = process.env.META_WA_ACCESS_TOKEN;
const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
const templateName = process.env.META_WA_TEMPLATE_NAME;
const apiVersion = 'v19.0';
const metaApiUrl = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;


// --- Initialize Express App ---
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors());         // Middleware to enable Cross-Origin Resource Sharing

const PORT = process.env.PORT || 3001;

// --- API Endpoints ---

app.get('/', (req, res) => {
    res.status(200).send('<h1>GenAI Health Buddy Backend (Meta API)</h1><p>Server is running correctly.</p>');
});

// Endpoint to Send WhatsApp Message via Meta API Template
app.post('/api/send-whatsapp', async (req, res) => {
    // The body now contains the patient's name and the formatted message body for the template
    const { to, name, body } = req.body;

    console.log('--- New Request to /api/send-whatsapp (Meta) ---');
    console.log(`  > Attempting to send template message to: ${to}`);

    if (!to || !name || !body) {
        console.error('  > ❌ Validation Error: Missing "to", "name", or "body" in request.');
        return res.status(400).json({ success: false, error: 'Missing "to", "name", or "body" in request.' });
    }

    const recipientNumber = to.replace(/\D/g, '');

    const apiPayload = {
        messaging_product: "whatsapp",
        to: recipientNumber,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: "en_US"
            },
            components: [{
                type: "body",
                parameters: [
                    // Corresponds to {{patient_name}} in the template
                    { type: "text", text: name },
                    // Corresponds to {{summary_body}} in the template
                    { type: "text", text: body }
                ]
            }]
        }
    };

    try {
        console.log('  > Contacting Meta Graph API...');
        const response = await axios.post(metaApiUrl, apiPayload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`  > ✅ Message sent successfully! Response:`, response.data);
        res.status(200).json({ success: true, data: response.data });

    } catch (error) {
        const errorDetails = error.response ? error.response.data : { message: error.message };
        console.error('  > ❌ Meta API Error:', JSON.stringify(errorDetails, null, 2));
        res.status(500).json({
            success: false,
            error: 'Failed to send WhatsApp message via Meta API.',
            details: errorDetails
        });
    }
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Backend server (Meta API) listening on http://localhost:${PORT}`);
});

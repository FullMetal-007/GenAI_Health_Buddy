
import type { PrescriptionInfo } from '../types';

interface SendSummaryPayload {
    name: string;
    phone: string;
    prescriptionData: PrescriptionInfo;
}

/**
 * Formats the prescription data into a single string for the template's body variable.
 */
const formatSummaryForTemplate = (data: PrescriptionInfo): string => {
    let body = "";

    body += "*MEDICATIONS*\n";
    if (data.medications && data.medications.length > 0) {
        body += data.medications.map(med => `• *${med.name}* (${med.dosage}): ${med.timing}`).join('\n');
    } else {
        body += "_No medications found._\n";
    }

    if (data.precautions && data.precautions.length > 0) {
        body += "\n\n*PRECAUTIONS & ADVICE*\n";
        body += data.precautions.map(note => `• ${note}`).join('\n');
    }

    if (data.vitals && Object.keys(data.vitals).length > 0) {
        body += "\n\n*VITALS*\n";
        body += Object.entries(data.vitals).map(([key, value]) => `• ${key}: ${value}`).join('\n');
    }

    return body;
};


/**
 * Sends the prescription summary to a backend endpoint which then uses the Meta WhatsApp Cloud API.
 * IMPORTANT: This function assumes a backend server is running and has an endpoint at `/api/send-whatsapp`.
 */
export const sendPrescriptionSummary = async (payload: SendSummaryPayload): Promise<void> => {
    const { name, phone, prescriptionData } = payload;
    
    // The phone number for Meta API is just the number with country code
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
    const messageBody = formatSummaryForTemplate(prescriptionData);
    
    // The backend server is expected to be running on localhost:3001
    const backendUrl = 'http://localhost:3001/api/send-whatsapp'; 

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: formattedPhone,
                name: name, // This will be used for variable {{patient_name}}
                body: messageBody, // This will be used for variable {{summary_body}}
            }),
        });

        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.error || 'Failed to send WhatsApp message.');
        }

    } catch (error) {
        console.error("Error sending WhatsApp message via backend:", error);
        // This custom message is more user-friendly than a generic network error.
        throw new Error("Could not send the summary via WhatsApp. Please check the phone number or try again later.");
    }
};
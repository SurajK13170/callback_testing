
const isoTimestampUTC = new Date().toISOString()
const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
const { v4: uuidv4 } = require('uuid')

const baseUrl = "https://dev.abdm.gov.in";
const clientId = "SBX_002552";
const clientSecret = "077de738-0f3c-4414-9560-c2523d0c46ec";
const xCmId = "sbx";

async function getAccessToken() {
    try {
        const response = await axios.post(`https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions`, {
            clientId: clientId,
            clientSecret: clientSecret,
            grantType: "client_credentials"
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CM-ID': xCmId,
                    "REQUEST-ID": uuidv4(),
                    'TIMESTAMP': isoTimestampUTC
                }
            });
        return response.data.accessToken;
    } catch (error) {
        console.error("Error fetching access token:", error.response ? error.response.data : error.message);
        throw error;
    }
}

app.post('/', async (req, res) => {
   const consentRequestPayload = req.body;
    try {
        // Fetch access token
        const accessToken = await getAccessToken();
        console.log('Access Token:', accessToken);

        // Get the current timestamp in ISO format
        const isoTimestampUTC = new Date().toISOString();

        // Send the consent request to the ABDM API
        const response = await axios.post('https://dev.abdm.gov.in/api/hiecm/consent/v3/request/init', consentRequestPayload, {
            headers: {
                'Content-Type': 'application/json',
                'X-CM-ID': "sbx",
                'REQUEST-ID': uuidv4(),
                'TIMESTAMP': isoTimestampUTC,
                'Connection': "keep-alive",
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // Log the response from the API
        console.log('Response from API:', response.data);

        // Send success response to the client
        return res.status(200).send({ message: 'Consent request initiated successfully', data: response.data });
    } catch (error) {
        // Handle errors during API call
        console.error('Error initiating consent request:', error.message);
        if (error.response) {
            console.error('API response error:', error.response.data);
        }

        // Send error response to the client
        return res.status(500).send('Error initiating consent request');
    }
})


app.post('/api/v3/hiu/hiecm/subscription-requests/on-init', async (req, res) => {
    try {
        console.log('Received callback data:', req.body);

        const callbackData = req.body;
        res.status(200).send({ message: 'Callback received successfully' });
    } catch (error) {
        console.error('Error handling callback:', error.message);
        res.status(500).send('Error handling callback');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})

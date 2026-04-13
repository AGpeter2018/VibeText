import axios from 'axios';

const testAI = async () => {
    console.log('Starting API Test...');

    try {
        const payload = {
            text: "Hello, how are you? I'm headed to the market to get some fish.",
            dialect: "Nigeria english",
            intensity: "high"
        };

        console.log('ending request to http://localhost:5000/api/tune...');
        console.log('Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post('http://localhost:5000/api/tune', payload);

        console.log('\n Success!');
        console.log(' Tuned Text:', response.data.content);

    } catch (error) {
        console.error('\n Test Failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.log('\n Tip: Check if your GEMINI_API_KEY is valid in .env');
        } else {
            console.error('Error Message:', error.message);
            console.log('\n💡 Tip: Make sure your server is running (npm run dev)');
        }
    }
};

testAI();

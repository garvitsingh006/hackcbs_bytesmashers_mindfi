import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const chatWithBot = async (req, res) => {
    console.log('Chat request received:', { body: req.body });
    const { message, userId = 'U001' } = req.body;
    
    if (!message) {
        console.log('Error: No message provided');
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        console.log('Spawning Python process with message:', message);
        const pythonProcess = spawn('python', [
            `${__dirname}/../../chatbot.py`,
            '--message',
            message,
            '--user-id',
            userId
        ]);
        
        console.log('Python process started with PID:', pythonProcess.pid);

        let response = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            response += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            console.log('Python process closed with code:', code);
            console.log('Python process stdout:', response);
            console.log('Python process stderr:', error);
            
            if (code !== 0 || error) {
                console.error('Python script error:', error);
                return res.status(500).json({ 
                    error: 'Error processing your request',
                    details: error || 'No error details available',
                    code,
                    response
                });
            }
            
            try {
                // Extract just the bot's response from the output
                const botResponse = response.split('MindFi: ').pop().trim();
                console.log('Sending response:', botResponse);
                res.json({ response: botResponse });
            } catch (parseError) {
                console.error('Error parsing Python response:', parseError);
                res.status(500).json({ 
                    error: 'Error parsing response',
                    details: parseError.message,
                    rawResponse: response
                });
            }
        });

        // Send the message to the Python script
        pythonProcess.stdin.write(message + '\n');
        pythonProcess.stdin.end();

    } catch (error) {
        console.error('Error in chatbot controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

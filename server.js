const express = require('express')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')
// const cors = require('cors')
const path = require('path');


const app = express();


// app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())



const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})


let deviceTokens = []

app.post('/register-token', (req, res)=>{
    const { token } = req.body;

    if(!deviceTokens.includes(token)){
        deviceTokens.push(token);
        console.log("Registered Token", token);
    }

    res.status(200).json({message: "Token registered Successfully"});
})


app.post('/send-notification', async (req, res) => {
    const { title, body } = req.body;
  
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
  
    if (deviceTokens.length === 0) {
      return res.status(400).json({ error: 'No devices registered' });
    }
  
    try {
      const message = {
        notification: {
          title,
          body
        },
        tokens: deviceTokens // Send to all registered devices
      };
  
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log('Successfully sent message:', response);
      
      // Remove failed tokens
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(deviceTokens[idx]);
        }
      });
      
      deviceTokens = deviceTokens.filter(token => !failedTokens.includes(token));
      
      res.status(200).json({ 
        success: true,
        sentCount: response.successCount,
        failedTokens
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });
  
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
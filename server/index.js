const express = require('express');
const multer = require('multer');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const client = new speech.SpeechClient({
  keyFilename: path.join(__dirname, 'speak-now-0-3a5c2357e88f.json'),
});
const port = 3001;

app.post('/upload', upload.single('audio'), async (req, res) => {
  const filePath = path.join(__dirname, req.file.path);

  const audio = {
    content: fs.readFileSync(filePath).toString('base64'),
  };

  const request = {
    audio: audio,
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    },
  };

  try {
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    res.send({ transcription });
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    fs.unlinkSync(filePath); // Clean up the uploaded file
  }
});

app.listen(port, () => {
  console.log('Server is running on port 3001');
});

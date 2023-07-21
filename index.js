
const express = require('express');
const app = express();
app.use(express.json());


const { MongoClient, ObjectID } = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'urlShortenerDB';
let db;

MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  if (err) throw err;
  db = client.db(dbName);
  console.log('Connected to MongoDB');
});

app.post('/shorten', (req, res) => {
  const destinationUrl = req.body.destinationUrl;
  
  const shortUrl = generateShortUrl(destinationUrl);
  
  
  db.collection('urls').insertOne({ shortUrl, destinationUrl }, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: 'Error saving URL to the database' });
    } else {
      res.status(200).json({ shortUrl });
    }
  });
});


app.post('/update', (req, res) => {
  const shortUrl = req.body.shortUrl;
  const destinationUrl = req.body.destinationUrl;
  
  
  db.collection('urls').updateOne({ shortUrl }, { $set: { destinationUrl } }, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: 'Error updating URL in the database' });
    } else {
      res.status(200).json({ success: true });
    }
  });
});


app.get('/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;
  
  db.collection('urls').findOne({ shortUrl }, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: 'Error finding URL in the database' });
    } else if (!result) {
      res.status(404).json({ error: 'Short URL not found' });
    } else {
      res.redirect(result.destinationUrl); // Redirect to the original URL
    }
  });
});

app.post('/updateExpiry', (req, res) => {
  const shortUrl = req.body.shortUrl;
  const daysToAdd = req.body.daysToAdd;
  res.status(200).json({ success: true });
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


function generateShortUrl(destinationUrl) {
  
  const randomChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let shortUrl = 'www.ppa.in/';
  for (let i = 0; i < 20; i++) {
    const randomIndex = Math.floor(Math.random() * randomChars.length);
    shortUrl += randomChars[randomIndex];
  }
  return shortUrl;
}

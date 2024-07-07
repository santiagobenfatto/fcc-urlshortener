require('dotenv').config();
const mongoose = require('mongoose')
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//DB connection
try {
  mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})
  console.log(`===== DATABASE CONNECTED =====`)
} catch (error) {
  console.error(`Erro in database ${error}`)
}

//Middlewares
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

//Endpoints
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


const urlSchema = new mongoose.Schema({
  fullUrl: String,
  shortUrl: Number,
})

const urlModel = mongoose.model('url', urlSchema)

app.post('/api/shorturl', async (req, res) => {
  //const fullURL = req.body.url;
  const urlPattern = /https:\/\/(www.)?|http:\/\/(www.)?/g;
  const shortURL = Math.floor(1000 + Math.random() * 9000);

  if (!urlPattern.test(req.body.url)) {
    return res.json({error: 'invalid url'});
  }
   
    await urlModel.create({ fullUrl: req.body.url, shortUrl: shortURL });
        
    res.json({original_url: req.body.url, short_url: shortURL});
  });


app.get('/api/shorturl/:url', async(req, res) => {
  const shortURL = parseInt(req.params.url, 10);

  const result = await urlModel.findOne({ "shortUrl": shortURL })
  console.log(`URL FOUND = ${result.fullUrl}`)
  const fullURL = result.fullUrl
  res.redirect(fullURL);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

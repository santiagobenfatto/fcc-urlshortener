require('dotenv').config();
//const { v4: uuid } = require('uuid')
const mongoose = require('mongoose')
const express = require('express');
const cors = require('cors');
const dns = require('dns')
const app = express();


const shortUUID = () => {
  return uuid().slice(0, 5)
}
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})


const urlSchema = new mongoose.Schema({
  fullUrl: String,
  shortUrl: Number,
})

const urlModel = mongoose.model('url', urlSchema)


app.post('/api/shorturl', (req, res) => {
  const fullURL = req.body.url
  const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z\d-]+(\.[a-zA-Z]{2,})(\/[^\s]*)?$/;
  const shortURL = Math.floor(1000 + Math.random() * 9000)
  
  if(!urlPattern.test(fullURL)) return res.status(400).json({ error: 'invalid url' })
    
    dns.lookup(fullURL, (err) => {
    //console.log(fullURL) => ENTRA
    if(err && err.code != 'ENOTFOUND'){
      console.log(err)
    } else {
      const newInput = urlModel.create({ fullUrl: fullURL, shortUrl: shortURL })
      .then((data) => {
        console.log(data)
        return res.json({original_url: fullURL, short_url: shortURL})
      })
      .catch((err) => {
        res.json(err)
      })
    }
  })
})

app.get('/api/shorturl/:url', (req, res) => {
  const shortURL = req.params.url
  urlModel.findOne({shortUrl: shortURL})
  .then((data)=> {
    res.redirect(data.fullUrl)
  })
  .catch(err => {
    if(err) return res.status(404).json({ error: 'invalid url' })
  })
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

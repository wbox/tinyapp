const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(length) {
  let min = 0;
  let max = 0;
  let shortURLKey = "";

  
  length = !length ? 6 : length;
  
  for ( let i = 0; i < length; i++) {
    let range = Math.random();
    if (range <= 0.3 ) {
      min = 48;
      max = 57;
    } else if (range <= 0.6) {
      min = 65;
      max = 90;
    } else {
      min = 97;
      max = 122;
    }
    let num = Math.floor(Math.random() * (max - min + 1) + min); // Example code from Math.random() MDN Documentation.
    shortURLKey += String.fromCharCode(num);
  }

  return shortURLKey;
};



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// POST Routing
app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index.ejs', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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

  if (Math.random() > 0.5 ) {
    min = 65;
    max = 90;
  } else {
    min = 97;
    max = 122;
  }

  let num = Math.floor(Math.random() * (max - min + 1) + min); // Example code from Math.random() MDN Documentation.
  return String.fromCharCode(num);
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

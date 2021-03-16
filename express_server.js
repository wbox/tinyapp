const express = require("express");
const bodyParser = require('body-parser');
const md5 = require('md5');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

// My plan is to store this in a file when I get all functionalities
// for this app implemented.
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(url, length) {
  length = !length ? 6 : length;
  const shortURLKey = md5(url).slice(0,length);
  return shortURLKey;
};

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// POST Routing Entries
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  shortURLKey = generateRandomString(req.body.longURL);
  urlDatabase[shortURLKey] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  //const cookieTemplate = { username: req.cookie["username"] };
  console.log(req.body);
  res.cookie('username', req.body.username);
  // console.log("req body--->", req.body);
  // console.log("req params->", req.params);
  console.log("Cookie----->", req.cookies["username"]);
  res.send("Login page not implemented yet. Click <a href=\"/urls\">here</a> to return to the main page.");
  //templateVars.username = req.cookies["username"];
  //res.render('urls_index.ejs', templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/urls');
  } else {
    res.redirect(urlDatabase[req.params.shortURL]);
  }
});

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  console.log(req.cookies.username);
  // const userId = req.session['username'];
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
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

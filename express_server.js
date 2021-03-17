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

const userDB = [
  { "samrib" : 
    {
      id: "samrib",
      email: "sam@ribas.ca",
      password: "sam"
    }
  }
];

function generateRandomString(text, length) {
  length = !length ? 6 : length;
  const shortURLKey = md5(text).slice(0,length);
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
  // console.log("Edit body:", req.body);
  // console.log("Edit params:", req.params);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username};
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
  res.cookie('username', req.body.username);
  res.redirect("/urls");
  //res.send("Login page not implemented yet. Click <a href=\"/urls\">here</a> to return to the main page.");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  templateVars = req.body;
  // check if email was informed
  if (templateVars.email) {
    // check if the user already exist
    // if true 
      // return message inform user already exist
    // if false
      // add new user to the database
    
  }
})

app.get("/register", (req, res) => {
  console.log("Cookies /register", req.cookies);
  res.render("urls_register", req.cookies);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/urls');
  } else {
    res.redirect(urlDatabase[req.params.shortURL]);
  }
});

app.get("/", (req, res) => {
  console.log("cookies at /", req.cookies);
  username = req.cookies;
  if (username) {
    res.redirect('/urls');
  } else {
    res.render("urls_register");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  //console.log(req.cookies.username);
  //console.log("cookies at /", req.cookies);
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  if (templateVars.username) {
    res.render('urls_index.ejs', templateVars);
  } else {
    res.render("urls_register");
  }

});

app.get("/urls/new", (req, res) => {
  templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
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

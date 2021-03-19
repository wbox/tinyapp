const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const md5 = require('md5');
//const bcrypt = require('bcrypt');
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const { generateRandomString, findUserByEmail, findUserById, addNewUser, validateUser, getUserUrls } = require('./helpers');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
  })
);

// Middleware functions
const setCurrentUser = (req, res, next) => {
  const userID = req.session['user_id'];
  const userObj = users[userID] || null;
  req.currentUser = userObj;
  next();
};

app.use(setCurrentUser);

const PORT = 8080; // default port 8080
//const PASSWORD_LENGTH = 15;
const USERID_LENGTH   = 6;
const SHORTURL_LENGTH = 6;
//const SALT_ROUND      = 10;


// My plan is to store this in a file when I get all functionalities
// for this app implemented.
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "80e100" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  '80e100': {
    id: '80e100',
    email: 'sribas@gmail.com',
    password: '$2b$10$2dA3e5.e3H51UTayA30qruiQrNw73lBfq474YfiTltNLPinfzWWVq'
  }
};

// POST Routing Entries
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const { userDB, error } = findUserById(req.session.user_id, users);
  if (userDB) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userDB };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;

  console.log("params:",req.params.id);
  console.log("body:",req.body);

  const { userDB, error } = findUserById(userID, users);
  console.log("userID inside post /urls/:id:", userID, userDB);
  console.log("--->",urlDatabase[req.params.id]);

  if (userDB && urlDatabase[req.params.id].userID === userID ) {
    urlDatabase[req.params.id] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect("/urls");
    // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userDB };
    // res.render("urls_show", templateVars);
  } else {
    res.status(403).render("urls_error", { userDB, error : "Access Denied!" });
  }


});

app.post("/urls", (req, res) => {
  shortURLKey = generateRandomString(req.body.longURL, SHORTURL_LENGTH);
  urlDatabase[shortURLKey] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURLKey}`);
});

// Refactor to get users with valid account access to the system and then test the exceptions
app.post("/login", (req, res) => {

  const emailForm    = req.body.email;
  const passwordForm = req.body.password;

  if (!emailForm) {
    res.status(400).render("urls_error", { userDB: null, error: `You need to inform email` });
  } else if (!passwordForm) {
    res.status(400).render("urls_error", { userDB: null, error: "You need to inform password!" });
  } else {
    const { userDB, error } = validateUser(emailForm, passwordForm, users);
    if (!userDB) {
      res.status(403).render("urls_error", { userDB: null, error });
    } else {
      req.session['user_id'] = userDB.id;
      const userUrlObj = getUserUrls(userDB.id, urlDatabase);
      templateVars = { urlDB: userUrlObj, userDB };
      res.render("urls_index", templateVars);
    }
  }
});

app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.render("urls_index", { urlDB: null, userDB: null});
});

app.post("/register", (req, res) => {

  const id = generateRandomString(req.body.email,USERID_LENGTH);
  email = req.body.email;
  password = req.body.password;
  
  if (email) {
    const { userDB, error } = findUserByEmail(email, users);
    if (userDB) {
      res.render("urls_error", { userDB: null, error: `User ${email} already registered` });
    } else {
      const { userDB, error } = addNewUser(id, email, password, users);
      req.session['user_id'] = id;
      const userUrlObj = getUserUrls(id,urlDatabase);
      const templateVars = { urlDB: userUrlObj, userDB : users[id] };
      res.render("urls_index", templateVars);
    }
  }
});

// GET Routing Entries
app.get("/login", (req, res) => {
  res.render("urls_login", { userDB: null});
});

app.get("/register", (req, res) => {

  const userSessionID = req.session.user_id;
  // Find if user exists
  const { userDB, error } = findUserById(userSessionID, users);
  if (userDB) {
    const userUrlObj = getUserUrls(userDB.id, urlDatabase);
    const templateVars = { urlDB: userUrlObj, userDB };
    res.render("urls_index", templateVars);
    //redirect("/urls");
  } else {
    res.render("urls_register", { userDB: null });
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.redirect('/urls');
  }
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {

  const userID = req.session.user_id;
  const { userDB, error } = findUserById(userID, users);
 
  if (!userID) {
    res.redirect("/login");
  } else {
    // Verify user exist based on the user_id cookie
    const { userDB, error } = findUserById(userID, users);
    
    if (error) {
      templateVars = { userDB : null, error };
      res.render("urls_error", templateVars);
    } else {

      //const templateVars = { urlDB: urlDatabase, userDB };
      if (userDB) {
        const userUrlObj = getUserUrls(userDB.id, urlDatabase);
        const templateVars = { urlDB: userUrlObj, userDB };
        res.render('urls_index', templateVars);
      } else {
        res.redirect("/register");
      }
    }
  }
});

app.get("/urls/new", (req, res) => {
  userSessionID = req.session.user_id;
  if (!userSessionID) {
    templateVars = { userDB: null, error: "User not logged"};
    res.render("urls_login", templateVars);
  } else {
    const { userDB, error } = findUserById(userSessionID, users);
    templateVars = { userDB, error: null };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {

  const userID = req.session.user_id;
  const { userDB, error } = findUserById(req.session.user_id, users);
  if (userDB && userID && urlDatabase[req.params.shortURL].userID === userID) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userDB };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).render("urls_error", { userDB, error : "Access Denied!" });
  }
  // const userID = req.session.user_id;
  // console.log("userID , urluserID:", userID, urlDatabase[req.params.shortURL].userID);
  // // const urlOBJ = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
  // if (userID && urlDatabase[req.params.shortURL].userID === userID) {
  //   const userDB = findUserById(userID, users);
  //   const url = urlDatabase[req.params.shortURL];

  //   console.log("userDB inside /urls/:shortURL", userDB)

  //   templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };

  //   console.log("templateVars inside /urls/:shortURL:", templateVars);
  //   res.render("urls_show", templateVars);

  // }

  // console.log("req.params:",req.params);
  // console.log("urlDatabase[req.params.shortURL].longURL", urlDatabase[req.params.shortURL].longURL);
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

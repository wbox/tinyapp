const express       = require("express");
const bodyParser    = require('body-parser');
const ejs           = require('ejs');
const md5           = require('md5');
const cookieSession = require('cookie-session');

// Database files
const { urlDatabase } = require('./data/url-database');
const { users }       = require('./data/user-database');

// Helper functions
const { generateRandomString, 
        findUserById, 
        addNewUser, 
        validateUser, 
        getUserUrls } = require('./helpers');

// Express configuration
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 1 * 60 * 60 * 1000 // cookies will expire within 1 hour
  })
);

// Global variables
const PORT            = 8080; // default port 8080
const USERID_LENGTH   = 6;
const SHORTURL_LENGTH = 6;


// POST Routing Entries. See the documentation for more information about the rules for each routing entry.
app.post("/urls/:shortURL/delete", (req, res) => {
  
  const userID   = req.session.user_id;
  const shortURL = req.params.shortURL;

  const { userDB, error } = findUserById(userID, users);
  
  if (userDB && urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).render("urls_error", { userDB, error : "Access Denied!" });
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  
  const userID   = req.session.user_id;
  const shortURL = req.params.shortURL;

  const { userDB, error } = findUserById(userID, users);
  if (userDB) {
    const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, userDB };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {

  const userID   = req.session.user_id;
  const shortURL = req.params.id;
  const longURL  = req.body.longURL;

  const { userDB, error } = findUserById(userID, users);

  if (userDB && urlDatabase[shortURL].userID === userID) {
    urlDatabase[shortURL] = { longURL: longURL, userID: userID };
    res.redirect("/urls");
  } else {
    res.status(403).render("urls_error", { userDB, error : "Access Denied!" });
  }

});

app.post("/urls", (req, res) => {

  const userID  = req.session.user_id;
  const longURL = req.body.longURL;

  if (userID) {
    const shortURLKey = generateRandomString(longURL, SHORTURL_LENGTH);
    urlDatabase[shortURLKey] = { longURL: longURL, userID: userID };
    res.redirect(`/urls/${shortURLKey}`);
  } else {
    res.render("urls_error", { userDB: null, error: "Access Denied! You must be logged in for this operation."});
  }

});

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
      req.session['user_id']  = userDB.id;
      const userUrlObj        = getUserUrls(userDB.id, urlDatabase);
      const templateVars      = { urlDB: userUrlObj, userDB };
      res.render("urls_index", templateVars);
    }
  }
});

app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {

  const { email, password } = req.body;
  const id                  = generateRandomString(email,USERID_LENGTH);

  
  if (email && password) {
    const { userDB, error } = addNewUser(id, email, password, users);
    if (userDB) {
      req.session['user_id'] = id;
      const userUrlObj = getUserUrls(id,urlDatabase);
      const templateVars = { urlDB: userUrlObj, userDB : users[id] };
      res.render("urls_index", templateVars);
    } else {
      res.render("urls_error", { userDB: null, error: `User ${email} already registered` });
    }
  } else {
    res.render("urls_error", { userDB: null, error: "You need to inform your email and password for registration"} );
  }
});

// GET Routing Entries. See the documentation for more information about the rules for each routing entry.
app.get("/login", (req, res) => {
  res.render("urls_login", { userDB: null});
});

app.get("/register", (req, res) => {
  const userSessionID = req.session.user_id;
  const { userDB, error } = findUserById(userSessionID, users);
  if (userDB) {
    const userUrlObj = getUserUrls(userDB.id, urlDatabase);
    const templateVars = { urlDB: userUrlObj, userDB };
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_register", { userDB: null });
  }
});

app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL].longURL);
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

  const userID            = req.session.user_id;
  const { userDB, error } = findUserById(userID, users);
 
  if (!userID) {
    res.redirect("/login");
  } else {
    // Verify user exist based on the user_id cookie
    const { userDB, error } = findUserById(userID, users);
    
    if (error) {
      const templateVars = { userDB : null, error };
      res.render("urls_error", templateVars);
    } else {

      //const templateVars = { urlDB: urlDatabase, userDB };
      if (userDB) {
        const userUrlObj    = getUserUrls(userDB.id, urlDatabase);
        const templateVars  = { urlDB: userUrlObj, userDB };
        res.render('urls_index', templateVars);
      } else {
        res.redirect("/register");
      }
    }
  }
});

app.get("/urls/new", (req, res) => {
  const userSessionID = req.session.user_id;
  if (!userSessionID) {
    const templateVars = { userDB: null, error: "User not logged"};
    res.render("urls_login", templateVars);
  } else {
    const { userDB, error } = findUserById(userSessionID, users);
    const templateVars = { userDB, error: null };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {

  const userID    = req.session.user_id; 
  const shortURL  = req.params.shortURL;
  const longURL   = urlDatabase[shortURL].longURL;
  const { userDB, error } = findUserById(userID, users);

  if (userDB && userID && urlDatabase[shortURL].userID === userID) {
    const templateVars = { shortURL: shortURL, longURL: longURL, userDB };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).render("urls_error", { userDB, error : "Access Denied!" });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

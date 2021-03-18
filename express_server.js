const express = require("express");
const bodyParser = require('body-parser');
const md5 = require('md5');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const app = express();

const PORT = 8080; // default port 8080
const PASSWORD_LENGTH = 15;
const USERID_LENGTH   = 6;
const SHORTURL_LENGTH = 6;


// My plan is to store this in a file when I get all functionalities
// for this app implemented.
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "80e100" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "80e100" }
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
    password: '202cb962ac59075'
  }
};

function generateRandomString(text, length) {
  length = !length ? 6 : length;
  const randomString = md5(text).slice(0,length);
  return randomString;
};

function findUserById(id, users) {
    const userDB = Object.values(users).find(userObject => userObject.id === id);
    if (userDB) {
      return { userDB, error: null };
    } else {
      const user = null;
      return { userDB, error: "User ID doesn't exist"}
    }

};

function findUserByEmail(email, userDB) {
  const user = Object.values(userDB).find(userObject => userObject.email === email);
  if (user) {
    return { user, error: null };
  } else {
    const user = null;
    return { user, error: "User email doesn't exist"}
  }
}

function validateUser(email, password, userDB) {
  userObj = null;
  if (!email) {
    return { userObj , error: "email empty" };
  } else if (!password) {
    return { userObj, error: "password empty" };
  } else if (!userDB) {
    return { userObj, error: "database empty"} ;
  }

  userFromDb = Object.values(userDB).find(objectUser => objectUser.email === email);
  
  if (!userFromDb) {
    return { userObj , error: "User not found" };
  }
  
  if (userFromDb.email !== email) {
    return { userObj, error: "email not found!" };
  } else if (userFromDb.password !== password) {
    return { userObj, error: "wrong password" }; 
  }
  return { userFromDb, error: null };
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
  const { userDB, error } = findUserById(req.cookies.user_id, users);
  if (userDB) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userDB };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  shortURLKey = generateRandomString(req.body.longURL, SHORTURL_LENGTH);
  urlDatabase[shortURLKey] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {

  const emailForm = req.body.email;
  const passwordForm = req.body.password;

  if (!emailForm) {
    res.status(400).render("urls_error", { userDB: null, error: `You need to inform email` });
  } else if (!passwordForm) {
    res.status(400).render("urls_error", { userDB: null, error: "You need to inform password!" });
  } else {

    const password = generateRandomString(passwordForm, PASSWORD_LENGTH);
    const { userFromDb, error } = validateUser(emailForm, password, users);

    //console.log("userFromDb INSIDE login:", userFromDb);

    if(!userFromDb) {
      res.status(403).render("urls_error", { userDB: null, error });
    } else {
      res.cookie('user_id', userFromDb.id);
      templateVars = { urlDB: urlDatabase, userDB: userFromDb };
      res.render("urls_index", templateVars);
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.render("urls_index", { urlDB: null, userDB: null});
});

app.post("/register", (req, res) => {
  const id = generateRandomString(req.body.email,USERID_LENGTH);
  email = req.body.email;
  
  if (email) {
    const { user, error } = findUserByEmail(email, users);
    if (user) {
      res.render("urls_error", { userDB: null, error: `User ${email} already registered` });
    } else {
      password = generateRandomString(req.body.password, PASSWORD_LENGTH);
      users[id] = { id, email, password };
      res.cookie('user_id', id);
      const templateVars = { urlDB: urlDatabase, userDB : users[id] };
      res.render("urls_index", templateVars);
    }
  }
});

app.get("/login", (req, res) => {
  res.render("urls_login", { userDB: null});
});

app.get("/register", (req, res) => {

  const userID = req.cookies.user_id;
  // Find if user exists
  const { userDB, error } = findUserById(userID, users);
  if (userDB) {
    const templateVars = { urlDB: urlDatabase, userDB };
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_register", { userDB: null });
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/urls');
  } else {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {

  const userID = req.cookies.user_id;
  const { userDB, error } = findUserById(userID, users);
 
  if (!userID) {
    // if user doesn't exist send to regiters page
    //const templateVars = { userDB: null, error : null };
    //res.render("urls_login", templateVars);
    res.redirect("/login");
  } else {
    // Verify user exist based on the user_id cookie
    const { userDB, error } = findUserById(userID, users);
    if (error) {
      templateVars = { userDB : null, error }
      res.render("urls_error", templateVars);
    } else {

      const templateVars = { urlDB: urlDatabase, userDB };
      if (userDB) {
        // If user exist define templateVars with urlDB and user object
        /// render urls_index passing templateVars
        const templateVars = { urlDB: urlDatabase, userDB };
        res.render('urls_index', templateVars);
      } else {
        res.redirect("/register");
      }
    }
  }
});

app.get("/urls/new", (req, res) => {
  userID = req.cookies.user_id;
  if (!userID) {
    templateVars = { userDB: null, error: "User not logged"}
    res.render("urls_login", templateVars);
  } else {
    const userDB = findUserById(userID, users);
    templateVars = { userDB, error: null };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

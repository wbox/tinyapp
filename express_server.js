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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur",
    urls: []
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk",
    urls: []
  }
};

function generateRandomString(text, length) {
  length = !length ? 6 : length;
  const randomString = md5(text).slice(0,length);
  return randomString;
};

function findUserById(id, userDB) {
  const user = Object.values(userDB).find(userObject => userObject.id === id);
  if (user) {
    return { user, error: null };
  } else {
    const user = null;
    return { user, error: "User ID doesn't exist"}
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username};
  res.render("urls_show", templateVars);
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

    console.log("userFromDb INSIDE login:", userFromDb);

    if(!userFromDb) {
      res.status(403).render("urls_error", { userDB: null, error });
      //res.redirect("/register");
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
      users[id] = { id, email, password, urls: [] };
      res.cookie('user_id', id);
      res.redirect("/urls");
    }
  }

  // user = findUser(id, users);
  // email = req.body.email;

  // check if email was informed
  // if (!user) {
  //   // Verify if user informed the email on the form
  //   if (email) {
  //     password = generateRandomString(req.body.password, PASSWORD_LENGTH);
  //     users[id] = { id, email, password, urls: [] };
  //     res.cookie('user_id', id);
  //     res.redirect("/urls");
  //   } else {
  //     res.redirect("/register");
  //   }
  // } else {
    
  //   res.redirect("/urls");
    // check if the user already exist
    // if true 
    // return message inform user already exist
    // if false
    // add new user to the databas 
  // }
})

app.get("/login", (req, res) => {
  res.render("urls_login", { userDB: null});
});

app.get("/register", (req, res) => {

  const userID = req.cookies.user_id;
  // Find if user exists
  const { user, error } = findUserById(userID, users);
  //console.log(req.cookies);

  console.log("user from findUser INDISE /login:", user);


  if (user) {
    res.render("urls_index", user);
  } else {
    res.render("urls_register", { userDB: null });
  }
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
  user_id = req.cookies.user_id;
  if (user_id) {
    res.redirect('/urls');
  } else {
    res.render("urls_register");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {

  // Verify user exist based on the user_id cookie
  const user = findUserById(req.cookies.user_id, users);

  console.log("Result of findUser inside app.get(/urls):", user);
  const templateVars = { urlDB: urlDatabase, userDB: user };
  console.log("------>templateVars before urls_index.ejs:", templateVars);

  // Verify if user exist
  if (user) {
    // If user exist define templateVars with urlDB and user object
    /// render urls_index passing templateVars
    res.render('urls_index', templateVars);
  } else {
    // if user doesn't exist send to regiters page
    const templateVars = { urlDB: urlDatabase, userDB: null};
    res.render("urls_index", templateVars);
  }

});

app.get("/urls/new", (req, res) => {
  userID = req.cookies.user_id;
  const userDB = findUserById(userID, users);
  templateVars = { userDB, error: null };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

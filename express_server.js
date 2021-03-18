const express = require("express");
const bodyParser = require('body-parser');
const md5 = require('md5');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
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

const setCurrentUser = (req, res, next) => {

  const userID = req.session['user_id'];
  const userObj = users[userID] || null;
  req.currentUser = userObj;

  console.log("req.currentUser from setCurrentUser middleware function:",req.currentUser);
  next();
}

app.use(setCurrentUser);


const PORT = 8080; // default port 8080
const PASSWORD_LENGTH = 15;
const USERID_LENGTH   = 6;
const SHORTURL_LENGTH = 6;
const SALT_ROUND      = 10;


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

const generateRandomString = (text, length) => {
  length = !length ? 6 : length;
  const randomString = md5(text).slice(0,length);
  return randomString;
};

function findUserById(id, users) {
    const userDB = Object.values(users).find(userObject => userObject.id === id);

    console.log("--->userDB inside findUserById:", userDB);
    console.log("--->id inside findUserById:", id);
    console.log("--->users inside findUserById:", users);

    if (userDB) {
      return { userDB, error: null };
    } else {
      // const user = null;
      const userDB = null;
      return { userDB, error: "User ID doesn't exist"}
    }

};

function findUserByEmail(email, userDB) {
  const user = Object.values(userDB).find((userObject) => userObject.email === email);
  if (user) {
    return { user, error: null };
  } else {
    const user = null;
    return { user, error: "User email doesn't exist"}
  }
};

function addNewUser(email, password, userDB) {
  // const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
};

function validateUser(email, password, users) {
  userDB = null;
  if (!email) {
    return { userDB , error: "email empty" };
  } else if (!password) {
    return { userDB, error: "password empty" };
  } else if (!users) {
    return { userDB, error: "database empty"} ;
  };

  userDB = Object.values(users).find(objectUser => objectUser.email === email);
  
  console.log("---->userDB inside login:", userDB);

  if (!userDB) {
    return { userDB , error: "User not found" };
  } else { 
  
    const hash = userDB.password;
    
    console.log("hash inside validateUser Function:", hash);
    console.log("compareSync:", bcrypt.compareSync(password, hash));

    if (userDB.email !== email) {
      return { userDB, error: "email not found!" };
    } else if (!bcrypt.compareSync(password, hash)) /* userFromDb.password !== password) */{
      return { userDB, error: "wrong password" }; 
    } 
    return { userDB, error: null };
  }
};

function getUserUrls(id, urlDatabase) {
  const userUrlObj = {};

  console.log("---> urlDatabase:",urlDatabase)

  for (let url in urlDatabase) {
    console.log("url in the loop:", url)
    console.log("urlDatabase[url] in the loop:", urlDatabase[url]);
    console.log("urlDatabase[url].userID in the loop:", urlDatabase[url].userID);
    console.log("userDB.id in the loop:", id);

    if ( urlDatabase[url].userID == id) {
      console.log("--->", url);
      
      userUrlObj[url] =  urlDatabase[url];
    }
  }
  console.log(userUrlObj);
  return userUrlObj || null;
}

// POST Routing Entries
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const { userDB, error } = findUserById(req.session.user_id, users);
  if (userDB) {

    console.log("req.params inside edit:",req.params);
    console.log("urlDatabase:",urlDatabase);

    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userDB };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  shortURLKey = generateRandomString(req.body.longURL, SHORTURL_LENGTH);
  urlDatabase[shortURLKey] = { longURL: req.body.longURL, userID: req.session.user_id };
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {

  const emailForm    = req.body.email;
  const passwordForm = req.body.password;

  if (!emailForm) {
    res.status(400).render("urls_error", { userDB: null, error: `You need to inform email` });
  } else if (!passwordForm) {
    res.status(400).render("urls_error", { userDB: null, error: "You need to inform password!" });
  } else {
    //const { userFromDb, error } = validateUser(emailForm, passwordForm, users);
    const { userDB, error } = validateUser(emailForm, passwordForm, users);

    console.log("--->userDB inside /login:", userDB);
    console.log("--->userDB.id inside /login:", userDB.id);

    if(!userDB) {
      res.status(403).render("urls_error", { userDB: null, error });
    } else {
      // Replacing but cookie-session
      // res.cookie('user_id', userFromDb.id);

      req.session['user_id'] = userDB.id;

      console.log("--->req.session.user_id inside login:", req.session.user_id);

      const userUrlObj = getUserUrls(userDB.id, urlDatabase);
      //templateVars = { urlDB: userUrlObj, userDB: userFromDb };
      templateVars = { urlDB: userUrlObj, userDB };
      res.render("urls_index", templateVars);
    }
  }
});

app.post("/logout", (req, res) => {
  //res.clearCookie('user_id');
  req.session['user_id'] = null;
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
      // Make this code a function addNewUser
      password = bcrypt.hashSync(req.body.password, SALT_ROUND);
      users[id] = { id, email, password };
      // ---
      //res.cookie('user_id', id);

      req.session['user_id'] = id;

      const userUrlObj = getUserUrls(id,urlDatabase);
      const templateVars = { urlDB: userUrlObj, userDB : users[id] };
      res.render("urls_index", templateVars);
    }
  }
});

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

  const userID = req.session.user_id;
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
    templateVars = { userDB: null, error: "User not logged"}
    res.render("urls_login", templateVars);
  } else {
    const { userDB, error } = findUserById(userSessionID, users);

    console.log(">>>>>>>userDB inside /urls/new:", userDB);
    console.log(">>>>>>>userDB['email'] inside /urls/new:", userDB['email']);
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

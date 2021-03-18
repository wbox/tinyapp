const md5 = require('md5');
const bcrypt = require('bcrypt');

const SALT_ROUND      = 10;

/// Helper Functions
const generateRandomString = (text, length) => {
  length = !length ? 6 : length;
  const randomString = md5(text).slice(0,length);
  return randomString;
};

const findUserById = (id, users) => {
  const userDB = Object.values(users).find(userObject => userObject.id === id);

  console.log("--->userDB inside findUserById:", userDB);
  console.log("--->id inside findUserById:", id);
  console.log("--->users inside findUserById:", users);

  if (userDB) {
    return { userDB, error: null };
  } else {
    // const user = null;
    const userDB = null;
    return { userDB, error: "User ID doesn't exist"};
  }

};

const findUserByEmail = (email, userDB) => {
  const user = Object.values(userDB).find((userObject) => userObject.email === email);
  if (user) {
    return { user, error: null };
  } else {
    const user = null;
    return { user, error: "User email doesn't exist"};
  }
};

const  addNewUser = (id, email, password, users) => {
  password = bcrypt.hashSync(password, SALT_ROUND);
  users[id] = { id, email, password };
  const userDB = users[id];
  return { userDB , error: null };
};

const validateUser = (email, password, users) => {
  userDB = null;
  if (!email) {
    return { userDB , error: "email empty" };
  } else if (!password) {
    return { userDB, error: "password empty" };
  } else if (!users) {
    return { userDB, error: "database empty"};
  }

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

const getUserUrls = (id, urlDatabase) => {
  const userUrlObj = {};

  console.log("---> urlDatabase:",urlDatabase);

  for (let url in urlDatabase) {
    console.log("url in the loop:", url);
    console.log("urlDatabase[url] in the loop:", urlDatabase[url]);
    console.log("urlDatabase[url].userID in the loop:", urlDatabase[url].userID);
    console.log("userDB.id in the loop:", id);

    if (urlDatabase[url].userID === id) {
      console.log("--->", url);
      
      userUrlObj[url] =  urlDatabase[url];
    }
  }
  console.log(userUrlObj);
  return userUrlObj || null;
};

module.exports = { generateRandomString, findUserByEmail, findUserById, addNewUser, validateUser, getUserUrls };
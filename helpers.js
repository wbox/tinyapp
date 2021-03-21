const md5         = require('md5');
const bcrypt      = require('bcrypt');
const SALT_ROUND  = 10;

/// Helper Functions
const generateRandomString = (text, length) => {
  length = !length ? 6 : length;
  const randomString = md5(text).slice(0,length);
  return randomString;
};

const findUserById = (id, users) => {
  const userDB = Object.values(users).find(userObject => userObject.id === id);
  return userDB ? { userDB, error: null } : { userDB: null, error: "User ID doesn't exist" };
};

const findUserByEmail = (email, users) => {
  const userDB = Object.values(users).find((userObject) => userObject.email === email);
  return userDB ? { userDB, error: null } : { userDB: null, error: "User email doesn't exist" };
};

const getUserByEmail = (email, userDB) => {
  const user = Object.values(userDB).find((userObject) => userObject.email === email);
  return user ? user.id : null;
};

const addNewUser = (id, email, password, users) => {
  password = bcrypt.hashSync(password, SALT_ROUND);
  users[id] = { id, email, password };
  const userDB = users[id];
  return { userDB , error: null };
};

const validateUser = (email, password, users) => {
  
  if (email && password && users) {

    const userDB = Object.values(users).find(objectUser => objectUser.email === email);
    
    if (userDB) {
      const hash = userDB.password;

      if (userDB.email !== email) {
        return { userDB: null, error: "email not found!" };
      } 
      
      if (!bcrypt.compareSync(password, hash)) {
        return { userDB: null, error: "wrong password" };
      }
      return { userDB, error: null };
    } else {
      return { userDB , error: "User not found" };
    }

    if (!email) {
      return { userDB: null , error: "email empty" };
    } else if (!password) {
      return { userDB: null, error: "password empty" };
    } else if (!users) {
      return { userDB: null, error: "database empty"};
    }
  }
};

const getUserUrls = (id, urlDatabase) => {
  const userUrlObj = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrlObj[url] =  urlDatabase[url];
    }
  }
  return userUrlObj || null;
};

module.exports = { generateRandomString, findUserByEmail, findUserById, addNewUser, validateUser, getUserUrls, getUserByEmail };
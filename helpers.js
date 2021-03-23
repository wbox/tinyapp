const md5         = require('md5');
const bcrypt      = require('bcrypt');
const SALT_ROUND  = 10;

/// Helper Functions

// Function to generate random string using md5. 
// If length is not provided the default is 6
const generateRandomString = (text, length) => {
  length = !length ? 6 : length;
  const randomString = md5(text).slice(0,length);
  return randomString;
};
// This function find an user based on id and return the user object
const findUserById = (id, users) => {
  const userDB = Object.values(users).find(userObject => userObject.id === id);
  return userDB ? { userDB, error: null } : { userDB: null, error: "User ID doesn't exist" };
};

// This function find an user based on an email address and return the user_id only.
const getUserByEmail = (email, userDB) => {
  const user = Object.values(userDB).find((userObject) => userObject.email === email);
  return user ? user.id : null;
};

// Add a new user to the database. All parameters are mandatory
const addNewUser = (id, email, password, users) => {

  const userID = getUserByEmail(email, users);

  if (!userID) {
    password = bcrypt.hashSync(password, SALT_ROUND);
    users[id] = { id, email, password };
    const userDB = users[id];
    return { userDB , error: null };
  } else {
    return { userDB: null, error: `User ${email} already registered` };
  }
};


// This function is called during the login process to validate the user email and password.
// It returns the user object in case the email and password are valid
// It returns specific error messages in case the email and/or password are invalid
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

// This function creates and returns an array with all urls that belongs to a specific user
const getUserUrls = (id, urlDatabase) => {
  const userUrlObj = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrlObj[url] =  urlDatabase[url];
    }
  }
  return userUrlObj || null;
};

module.exports = { generateRandomString, findUserById, addNewUser, validateUser, getUserUrls, getUserByEmail };
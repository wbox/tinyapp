const { assert } = require('chai');

const { getUserByEmail, findUserById, findUserByEmail, addNewUser, validateUser, getUserUrls } = require('../helpers.js');

const testUsers = {
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

const testUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "80e100" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};

describe('getUserByEmail', function() {
  
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user,expectedOutput);
  });
  
  it('should return null with an invalid email', () => {
    const user = getUserByEmail("bla@example.com", testUsers)
    const expectedOutput = null;
    assert.equal(user,expectedOutput);
  });
  
});

describe('findUserById', () => {
  
  it('should return an object of the user', () => {
    const user = findUserById("user2RandomID", testUsers);
    const userDB = { id: "user2RandomID", email: "user2@example.com", password: "dishwasher-funk" } 
    const expectedOutput = { userDB, error: null };
    assert.deepEqual(user,expectedOutput);
  });
  
  it('should return null if not existing user', () => {
    const user = findUserById("user2Random", testUsers);
    const userDB = null;
    const expectedOutput = { userDB, error: "User ID doesn't exist" };
    assert.deepEqual(user,expectedOutput);
  });
    
});

describe('addNewUser', () => {
  
  it('should return an object of the new user', () => {
    const user = addNewUser("34erd9", "xxxx@example.com", "password!1234", testUsers);
    const userDB = testUsers["34erd9"];
    const expectedOutput = { userDB, error: null };
    assert.deepEqual(user, expectedOutput);
  });
    
});

describe('validateUser', () => {
  
  it('should return an object of the user if email and password are correct', () => {
    const user = validateUser("sribas@gmail.com", "123", testUsers);
    const userDB = testUsers['80e100'];
    const expectedOutput = { userDB, error: null };
    assert.deepEqual(user, expectedOutput);
  });

});

describe('getUserUrls', () => {
  
  it('should return an object with the URLs associated to the user account', () => {
    const urls = getUserUrls('80e100', testUrlDatabase);
    const expectedOutput = { b6UTxQ: { longURL: 'https://www.tsn.ca', userID: '80e100' } };
    assert.deepEqual(urls, expectedOutput);
  });

});

const { assert } = require('chai');

const { getUserByEmail, findUserById } = require('../helpers.js');

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
  }
};



// const findUserById = (id, users) => {
//   const userDB = Object.values(users).find(userObject => userObject.id === id);
//   return userDB ? { userDB, error: null } : { userDB: null, error: "User ID doesn't exist" };

//   // if (userDB) {
//   //   return { userDB, error: null };
//   // } else {
//   //   const userDB = null;
//   //   return { userDB, error: "User ID doesn't exist"};
//   // }
// };


describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user,expectedOutput);
  });

  it('should return null with an invalid email', () => {
    const user = getUserByEmail("bla@example.com", testUsers)
    const expectedOutput = null;
    // Write your assert statement here
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

})


// console.log(getUserByEmail("bla@example.com", testUsers));
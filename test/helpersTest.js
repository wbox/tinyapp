const { assert } = require('chai');

const { getUserByEmail, findUserById, findUserByEmail, addNewUser, validateUser } = require('../helpers.js');

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
    
});

describe('findUserByEmail', () => {
  
  it('should return an object of the user', () => {
    const user = findUserByEmail("user2@example.com", testUsers);
    const userDB = { id: "user2RandomID", email: "user2@example.com", password: "dishwasher-funk" } 
    const expectedOutput = { userDB, error: null };
    assert.deepEqual(user,expectedOutput);
  });
  
  it('should return null if not existing user', () => {
    const user = findUserById("bla@example.com", testUsers);
    const userDB = null;
    const expectedOutput = { userDB, error: "User ID doesn't exist" };
    assert.deepEqual(user,expectedOutput);
  });
    
});

describe('addNewUser', () => {
  
  it('should return an object of the new user', () => {
    const user = addNewUser("34erd9", "xxxx@example.com", "password!1234", testUsers);
    // const userDB = { id: "34erd9", email: "xxxx@example.com", password: testUsers["34erd9"].password };
    const userDB = testUsers["34erd9"];
    const expectedOutput = { userDB, error: null };
    assert.deepEqual(user, expectedOutput);
  });
    
});

// const validateUser = (email, password, users) => {
  
//   if (email && password && users) {

//     userDB = Object.values(users).find(objectUser => objectUser.email === email);
    
//     if (userDB) {
//       const hash = userDB.password;
      
//       if (userDB.email !== email) {
//         return { userDB, error: "email not found!" };
//       } else if (!bcrypt.compareSync(password, hash)) {
//         return { userDB, error: "wrong password" };
//       }
//       return { userDB, error: null };
//     } else {
//       return { userDB , error: "User not found" };
//     }

//     userDB = null;
//     if (!email) {
//       return { userDB , error: "email empty" };
//     } else if (!password) {
//       return { userDB, error: "password empty" };
//     } else if (!users) {
//       return { userDB, error: "database empty"};
//     }
//   }
// };

describe('validateUser', () => {
  
  it('should return an object of the user if email and password are correct', () => {
    const user = validateUser("sribas@gmail.com", "123", testUsers);
    //const userDB = { id: "34erd9", email: "xxxx@example.com", password: testUsers["34erd9"].password };
    const userDB = testUsers['80e100'];
    const expectedOutput = { userDB, error: null };
    assert.deepEqual(user, expectedOutput);
  });

  // it('should return a null object and an error message if password is incorrect', () => {
  //   const user = validateUser("sribas@gmail.com", "123hjhjh4", testUsers);
  //   //const userDB = { id: "34erd9", email: "xxxx@example.com", password: testUsers["34erd9"].password };
  //   const userDB = null
  //   const expectedOutput = { userDB, error: 'wrong password' };
  //   assert.deepEqual(user, expectedOutput);
  // });
  


});



// console.log(getUserByEmail("bla@example.com", testUsers));
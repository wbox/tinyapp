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

function findUser(id, userDB) {
  const user = Object.values(userDB).find(userObject => userObject.id === id);
  return user;
};


id = "user2RandomID";

const user = findUser(id, users);
console.log(user.id);
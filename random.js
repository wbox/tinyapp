

function generateRandomString(length) {
  let min = 0;
  let max = 0;
  let shortURLKey = "";

  
  length = !length ? 6 : length;
  
  for ( let i = 0; i < length; i++) {
    let range = Math.random();
    if (range <= 0.3 ) {
      min = 48;
      max = 57;
    } else if (range <= 0.6) {
      min = 65;
      max = 90;
    } else {
      min = 97;
      max = 122;
    }
    let num = Math.floor(Math.random() * (max - min + 1) + min); // Example code from Math.random() MDN Documentation.
    shortURLKey += String.fromCharCode(num);
  }

  return shortURLKey;
};

console.log(generateRandomString());
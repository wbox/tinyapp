

function generateRandomString(length) {
  let min = 0;
  let max = 0;

  if (Math.random() > 0.5 ) {
    min = 65;
    max = 90;
  } else {
    min = 97;
    max = 122;
  }

  let num = Math.floor(Math.random() * (max - min + 1) + min);
  return String.fromCharCode(num);
};

generateRandomString();
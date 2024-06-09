const nameValidator = (name) => {
  const nameRegex = /^[A-Z][a-z]+(?: [A-Z][a-z]*)?$/;
  return nameRegex.test(name);
};

const emailValidator = (email) => {
  const emailFormat = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailFormat.test(email);
};

const usernameValidator = (username) => {
  const usernameFormat =  /^[A-Za-z][A-Za-z0-9_]{7,29}$/;
  return usernameFormat.test(username);
};

const passwordValidator = (password) => {
  const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordFormat.test(password);
};

const titleValidator = (title) => {
  const gibberishRegex = /(.)\1{2,}/; 
  if (gibberishRegex.test(title)) {
    return false; 
  }
  const titleRegex = /^(?:[A-Z][a-z]*|[A-Z]+)(?:\s(?:[A-Z][a-z]*|[A-Z]+|[a-z]+))*$/
  return titleRegex.test(title);
};


const locationValidator = (location) => {
  const gibberishRegex = /(.)\1{2,}/; 
  if (gibberishRegex.test(location)) {
    return false; 
  }
  const locationRegex = /^(?:[A-Z][a-z]*|[A-Z]+)(?:\s(?:[A-Z][a-z]*|[A-Z]+|[a-z]+))*$/
  return locationRegex.test(location);
};




module.exports = { nameValidator, emailValidator, usernameValidator,  passwordValidator, titleValidator, locationValidator  }


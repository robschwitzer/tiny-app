const express = require('express');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: []
  //Cookie options
}))
app.set('view engine', 'ejs');

////////////////////////////////////////////////////////

//template database
let urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "aceguy"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "aceguy"
  }
};

//template users
const users = {
  'aceguy': {
    id: 'aceguy',
    email: 'a@a',
    password: 'a'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: '12345'
  }
};

////////////////////////////////////////////////////////

//render silly homepage with path to /login and /register
app.get('/', (req, res) => {
  res.render('main');
});

//render shortened links for logged in user
app.get('/urls', (req, res) => {
  const user = users[req.cookies.user_id];
  // console.log(user);
  if(!user) {
    res.redirect('/');
  } else {
    const templateVars = {
      urls: urlsForUser(user.id),
      user: user,
    };
    console.log("filtered", templateVars)
    res.render('urls_index', templateVars);
  }
});

//render link generator page with path to /urls
app.get('/urls/new', (req, res) => {
  const user = users[req.cookies.user_id];
  if(!user) {
    res.redirect('/');
  } else {
    res.render('urls_new', {
      user: req.cookies['user_id']
    });
  }
});

//adds short url to database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    url: req.body.longURL,
    userID: req.cookies.user_id
  }
  res.redirect('/urls');
});

//
app.get('/urls/:id', (req, res) => {
  let urlId = req.params.id;
  let fullURL = urlDatabase[req.params.id].url;
  let user = users[req.cookies.user_id];
  let templateVars = {
    shortURL: urlId,
    originalURL: fullURL,
    user: user,
  };
  res.render('urls_show', templateVars);
});

//delete url
app.post('/urls/:id/delete', (req, res) => {
  let user = users[req.cookies.user_id];
  if (user) {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
  } else {
    res.redirect('/');
  }
});

//
app.post('/urls/:id', (req, res) => {
  let user = users[req.cookies.user_id];
  if (user) {
    urlDatabase[req.params.id].url = req.body.longURL;
    res.redirect('/urls/' + req.params.id);
  } else {
    res.redirect('/urls');
  }
});

//redirect to original/long url
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});



////////////// LOGIN / LOGOUT / REGISTER ///////////////



//login
app.get('/login', (req, res) => {
  res.render('login');
});

//
app.post('/login', (req, res) => {
  let email = req.body.email;
  const password = req.body.password;
  // FIND USER by email & password
  for(let userId in users) {
    let user = users[userId];
    if(user.email === email && bcrypt.compareSync(password, user.password)) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
      return;
    }
  }
  res.send('User not found', 403);
});

//
app.post('/logout', (req, res) => {
  res.clearCookie('user_id', { path: '/' });
  res.redirect('/login');
});

//register page
app.get('/register', (req, res) => {
  res.render('register');
})

//register user
app.post('/register', (req, res) => {
  //if req'd fields are empty
  if (req.body.email === "" || req.body.password === "") {
    res.end('400 error, enter valid email and/or password'); //change to status code
  //if email already in use
  } else if (isEmailTaken(req.body.email)) {
    res.end('email already in use');
  } else {
    //add user
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    let userID = generateRandomUserID();
    users[userID] = {id: userID, email: req.body.email, password: hashedPassword};
    //set cookie
    res.cookie('user_id', userID);  //'name', value
    //redirect to /urls
    res.redirect('/urls');
  };
});




////////////////////////////////////////////////////////




//check to see if email already in use
function isEmailTaken (email) {
  for (let userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return true;
    }
  }
  return false;
};



function urlsForUser(userId){
  let answer = {};
  for (var urlID in urlDatabase) {
    let urlObject = urlDatabase[urlID];
    // two things must match:  the ID of the user,  and the ID of the user in the urlDatabase
    if (userId === urlObject.userID) {
      answer[urlID] = urlObject;
    }
  }
  return answer;
}

//generate random string for short url
function generateRandomString () {
  let string = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    string += possible.charAt(Math.floor(Math.random() * possible.length));
  return string;
};

//generate random id for user
function generateRandomUserID () {
  let string = "userID-";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 10; i++)
    string += possible.charAt(Math.floor(Math.random() * possible.length));
  return string;
};


app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});


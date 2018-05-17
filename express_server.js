const express = require('express');
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

// app.use((req, res, next) => {
//   const username = req.cookies['username'];
//   res.locals.username = username;
//   next();
// })


//default database
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//render silly homepage with path to link generator
app.get('/', (req, res) => {
  res.render('main');
});

//render shortened links for logged in user
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

//render link generator page with path to /urls
app.get('/urls/new', (req, res) => {
  console.log('LOCALS', res.locals);
  res.render('urls_new', {
    username: req.cookies['username']
  });
});

//
app.get('/urls/:id', (req, res) => {
  let urlId = req.params.id;
  let fullURL = urlDatabase[req.params.id];
  let templateVars = {
    shortURL: urlId,
    originalURL: fullURL,
    username: req.cookies['username']
  };
  res.render('urls_show', templateVars);
});

//redirect to original/long url
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  // console.log(req.params);
  res.redirect(longURL);
});


//adds short url to database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect('/urls');
});

//delete url
app.post('/urls/:id/delete', (req, res) => {
  // console.log('req.params: ', req.params);
  // console.log('req.params.id: ', req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//currently broekn
app.post('/urls/:id', (req, res) => {
  // console.log(urlDatabase[req.params.id]);
  urlDatabase[req.params.id] = req.body.longURL;
  // console.log(req.body);
  res.redirect('/urls');
});

//
app.post('/login', (req, res) => {
  // console.log(req.body.username);
  const username = req.body.username;
  // es6 sugar... if the var name is the same as the key do below!!!
  res.cookie('username', username);
  res.redirect('/urls');
});


//
app.post('/logout', (req, res) => {
  const username = req.body.username;
  res.clearCookie('username');
  res.redirect('/urls');
});

//generate random string for short url
function generateRandomString () {
  var string = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    string += possible.charAt(Math.floor(Math.random() * possible.length));
  return string;
};

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});


const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.render('main');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  let urlId = req.params.id;
  let fullURL = urlDatabase[req.params.id];
  let templateVars = {
    shortURL: urlId,
    originalURL: fullURL,
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  // console.log(req.params);
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect('/urls');
  });

app.post('/urls/:id/delete', (req, res) => {
  // console.log('req.params: ', req.params);
  // console.log('req.params.id: ', req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
})

app.post('/urls/:id', (req, res) => {
  // console.log(urlDatabase[req.params.id]);
  urlDatabase[req.params.id] = req.body.longURL;
  // console.log(req.body);
  res.redirect('/urls');
})

function generateRandomString () {
  var string = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    string += possible.charAt(Math.floor(Math.random() * possible.length));
  return string;
}


app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});


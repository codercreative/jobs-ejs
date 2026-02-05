require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;
// Note: express-async-errors no longer available as an npmjs.com package -> thus not imported as a package.json package.  Per CTD Lead Gina, I can handle async errors using try/catch in my routes

const app = express();

app.set("view engine", "ejs");
// Note: body-parser part of express version 5 thus not needed to import and require body-parser as a package.json
app.use(express.urlencoded({ extended: true }));

// secret word handling
// INSERT SECRET WORD LOGIC HERE app.get() etc...............
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//   })
// );

const store = new MongoDBStore({
  uri: url,
  collection: "MySessions",
});

store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  // trust first proxy
  app.set("trust proxy", 1);
  // serve secure cookies
  sessionParms.cookie.secure = true;
}

app.use(session(sessionParms));

// Flash messages required after app.use for sessions, because flash depends on sessions
app.use(require("connect-flash")());

app.get("/secretWord", (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy";
  }
  res.locals.info = req.flash("info");
  res.locals.errors = req.flash("error");
  res.render("secretWord", { secretWord: req.session.secretWord });
});

app.post("/secretWord", (req, res) => {
  if (req.body.secretWord.toUpperCase()[0] == "P") {
    req.flash("error", "That word won't work!");
    req.flash("error", "You can't use words that start with p.");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("info", "The secret word was changed.");
  }
  res.redirect("/secretWord");
});

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

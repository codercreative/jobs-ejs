require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const auth = require("./middleware/auth");
const secretWordRouter = require("./routes/secretWord");
const jobsRouter = require("./routes/jobs");
const helmet = require("helmet");
//xss-clean deprecated so not using in this app
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const flash = require("connect-flash")

//csrf
const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");

passportInit();
const url = process.env.MONGO_URI;
// Note: express-async-errors no longer available as an npmjs.com package -> thus not imported as a package.json package.  Per CTD Lead Gina, I can handle async errors using try/catch in my routes

const app = express();

app.use(cookieParser(process.env.SESSION_SECRET));


//security middleware
app.use(helmet());
//xss-clean is deprecated and not compatible with Express 5. I commented it out and rely on helmet instead.
// app.use(xssClean())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

app.use(limiter);

//Set EJS as the view engine
app.set("view engine", "ejs");

//Parse form data from POST requests
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
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());

// csrf middleware
const csrfMiddleware = csrf.csrf();
app.use(csrfMiddleware);

app.use((req, res, next) => {

  
  if (!req.session._csrf) {
    req.session._csrf = csrf.refreshToken(req, res);
  }
  res.locals._csrf = req.session._csrf;
  next();
});

app.use(require("./middleware/storeLocals"));

//Renders index.ejs
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));
app.use("/secretWord", auth, secretWordRouter);

app.use("/jobs", auth, jobsRouter);

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
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

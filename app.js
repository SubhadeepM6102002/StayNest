const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const app = express();
const mongoose = require("mongoose");

require("dotenv").config();
console.log("SECRET exists:", !!process.env.SECRET);
console.log("ATLASDB_URL exists:", !!process.env.ATLASDB_URL);
const dbUrl = process.env.ATLASDB_URL;

const Listing = require("./models/listing.js");

const path = require("path");
const methodOverride = require("method-override");

const ejsmate = require("ejs-mate");

const wrapAsync = require("./utils/wrapAsync.js");
const expresserror = require("./utils/exprexxerror.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const userRouter = require("./routes/user.js");

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in Mongo Session Store", err);
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "/public")));

// Session
app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Passport
// Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }

  next();
};

const isOwner = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!listing.owner || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit this listing!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
// User Routes
app.use("/", userRouter);

// ================= DEMO USER =================

// app.get("/listings/demouser", async (req, res) => {
//   try {
//     let fakeuser = new User({
//       email: "student@gmail.com",
//       username: "delta_course",
//     });

//     let registeredUser = await User.register(fakeuser, "helloworld");

//     res.send(registeredUser);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });
// ================= MAIN ROUTE =================

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ================= LISTINGS =================

app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listing/index.ejs", { allListings });
  }),
);

app.get("/listings/new", isLoggedIn, (req, res) => {
  res.render("listing/new.ejs");
});

// IMPORTANT:
// /listings/demouser must be ABOVE /listings/:id

app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new expresserror(404, "Page Not Found");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      throw new expresserror(404, "Page Not Found");
    }

    res.render("listing/show.ejs", { listing });
  }),
);

app.post(
  "/listings",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (!newListing.image.url || newListing.image.url.trim() === "") {
      newListing.image.url =
        "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60";
    }

    await newListing.save();
    res.redirect("/listings");
  }),
);
app.get(
  "/listings/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    res.render("listing/edit.ejs", { listing });
  }),
);

app.put(
  "/listings/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
    });

    res.redirect(`/listings/${id}`);
  }),
);

app.delete(
  "/listings/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    let deletedListing = await Listing.findByIdAndDelete(id);

    console.log(deletedListing);

    res.redirect("/listings");
  }),
);

// ================= 404 =================

app.all("/*splat", (req, res, next) => {
  next(new expresserror(404, "Page Not Found"));
});

// ================= ERROR HANDLING =================

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;

  res.status(statusCode).send(message);
});

// ================= SERVER =================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`server is listening to port ${PORT}`);
});
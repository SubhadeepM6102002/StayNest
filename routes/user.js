const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
router.get("/signup", (req, res) => {
  res.render("user/signup.ejs");
});

router.post("/signup", async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    const newUser = new User({ email, username });

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to StayNest!");
      res.redirect("/listings");
    });
  } catch (e) {
    console.log("SIGNUP ERROR:", e.message);

    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

router.get("/login", (req, res) => {
    res.render("user/login.ejs");
});

router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    async (req, res) => {
        req.flash("success", "Welcome back to StayNest! ");
        res.redirect("/listings");
    }
);
module.exports = router;

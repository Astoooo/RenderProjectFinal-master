const express = require('express');
const router = express.Router();
const session = require('express-session');
const { PrismaClient } = require("@prisma/client"); 
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Initialize the session middleware
router.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));


router.get('/login', function(req, res, next) {
  // If user is already logged in, redirect to appropriate page
  if (req.session.user) { 
    switch (req.session.user.usertype) {
      case 'Admin':
        res.redirect("/admin/admincharts");
        break; 
      case "Manager":
        res.redirect("/manager/manager");
        break;
      case "User":
        res.redirect("/user/user");
        break;
      default:
        res.render('error', { message: 'Invalid userType: ' + user.usertype });
        break;
    }
    return;
  }

  // Otherwise, render the login page
  res.render('login', { title: 'Login', error: undefined, success: undefined });
});
 
// POST login
router.post('/login', async function(req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      res.render('login', { title: 'Login', error: 'Email not registered', success: undefined });
      return;
    }

    // Compare the entered password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Save user data in session
      req.session.user = user;

      // Redirect user based on their userType
      switch (user.usertype) {
        case "Admin":
          res.redirect("/admin/admincharts");
          break;
        case "Manager":
          res.redirect("/manager/manager");
          break;
        case "User":
          res.redirect("/user/user");
          break;
        default:
          res.render('error', { message: 'Invalid userType: ' + user.usertype });
          break;
      }
    } else {
      res.render('login', { title: 'Login', error: 'Password incorrect!', success: undefined });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});


module.exports = router;

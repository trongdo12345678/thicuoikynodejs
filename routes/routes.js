const express = require('express')
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const collection = require('../models/account')

const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
      // Nếu người dùng đã đăng nhập, cho phép tiếp tục
      next();
    } else {
      // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect("/login");
    }
  };

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads') //path to save
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname +  "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage
}).single("image");

//Insert an user into database
router.post("/add", upload, async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    try {
        await user.save();
        req.session.message = {
          type: 'success',
          message: 'User added Successfully!'
        };
        res.redirect("/");
      } catch (err) {
        console.error('Save Error:', err);
        res.json({ message: err.message, type: 'danger' });
      }
});

//Get all users route

router.get("/signup", (req, res) => {
    res.render("signup", {title: "Signup"});
});
  
router.post("/signup", async (req, res) => {
    const data = { 
        name: req.body.username, 
        password: req.body.password
    }

    const existingUser = await collection.findOne({name: data.name});

    if (existingUser) {
        res.send("User already exists. Please choose a different username.");
    } else {
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        const userdata = await collection.insertMany(data);
        // console.log(userdata);  
        res.redirect("/login");
    }
});

router.get('/login', (req, res) => {
    res.render("login", {title: "Login"});
});

router.post("/login", async (req, res) => {
    try {
      const check = await collection.findOne({name: req.body.username});
      if (!check) {
        res.send("Username not found.")
      }
  
      const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
  
      if (isPasswordMatch) {
        req.session.user = {
          username: req.body.username,
        };
        res.redirect("/");
      } else {
        res.send("Wrong password.");
      }
    } catch {
      res.send("Wrong login details.");
    }
  });


router.get("/", requireLogin, async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render("index", {
            title: 'Home Page',
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.get("/logout", requireLogin, (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });

router.get('/add', (req, res) => {
    res.render("add_users", {title: "Add Users"});
});

router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let user = await User.findById(id);
        res.render("edit_users", {
            title: "Edit User",
            user: user,
        });
    } catch (err) {
        res.redirect('/');
    }
});

router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync("./uploads/" + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        req.session.message = {
            type: "Success",
            message: "User updated successfully!"
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let result = await User.findByIdAndDelete(id);

        if (result.image != "") {
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: "info",
            message: "User deleted successfully!"
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});





module.exports = router;
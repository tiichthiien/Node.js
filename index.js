const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const {uploadImg} = require("./middlewares/utils/uploadImage");

const User = require("./models/User");

require("dotenv").config();

const app = express();
app.use(
    session({
        secret: "nodejs",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 10 * 60 * 60 * 1000 }, // 10 giờ
    })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 8080;
const staticPathAssets = path.join(__dirname, "views", "assets");
app.use("/assets", express.static(staticPathAssets));

// Serve uploads directory statically
const staticPathUpload = path.join(__dirname, "uploads");
app.use("/uploads", express.static(staticPathUpload));

// Set the views directory
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use("/", require("./routers"));
const { MONGO_URL } = process.env;
const {createProduct} = require("./controllers/Product");
app.listen(port, () => {
    mongoose
        .connect(MONGO_URL)
        .then(() => console.log("Connect to mongoDB successfully"))
        .catch((err) => console.error("Could not connect to MongoDB", err));
    console.log(`Example app listening at http://localhost:${port}`);
});

app.get("/", (req, res) => {
    res.sendFile("pages/index.html", { root: app.get("views") });
});

app.get("/profile", (req, res) => {
    if (req.session.user) {
        res.status(200).json(req.session.user);
    } else {
        res.redirect("/");
    }
});

app.get("/pages/profile", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    if(req.session.user.role === 'admin'){
        return res.sendFile("pages/profile.html", { root: app.get("views") });
    }
    return res.sendFile("salesperson/profile.html", { root: app.get("views") });
});

app.get("/pages/tables", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    if(req.session.user.role === 'admin'){
        return res.sendFile("pages/tables.html", { root: app.get("views") });
    }
    return res.sendFile("salesperson/tables.html", { root: app.get("views") });
});

app.get("/pages/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    if(req.session.user.role === 'admin'){
        return res.sendFile("pages/dashboard.html", { root: app.get("views") });
    }
    return res.sendFile("salesperson/dashboard.html", { root: app.get("views") });
});

app.get("/pages/billing", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    if(req.session.user.role === 'admin'){
        return res.sendFile("pages/billing.html", { root: app.get("views") });
    }
    return res.sendFile("salesperson/billing.html", { root: app.get("views") });
});

app.get("/pages/products", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    if(req.session.user.role === 'admin'){
        return res.sendFile("pages/product.html", { root: app.get("views") });
    }
    return res.sendFile("salesperson/product.html", { root: app.get("views") });
});

app.get("/login", (req, res) => {
    const { token } = req.query;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                return res.sendFile("pages/error.html", { root: app.get("views") });
            }
            const user = decoded.user;
            req.session.user = user;
            res.sendFile("salesperson/changePassword.html", { root: app.get("views") });
        } catch (error) {
            res.sendFile("pages/error.html", { root: app.get("views") });
        }
    }
});

app.get("/logout", async (req, res) => {
    const user = await User.findById(req.session.user._id);
    user.status = "offline";
    await user.save();
    res.redirect("/");
});

app.post("/products", uploadImg('uploads').single('image'), createProduct);
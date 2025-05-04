const express = require("express");
const router = express.Router();
const { rateLimit } = require("express-rate-limit");
const sendLoginEmail = require("../middlewares/utils/emailService");
const jwt = require("jsonwebtoken");
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  limit: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message: { error: "Please retry after 1 minute" },
});
const { uploadImg } = require("../middlewares/utils/uploadImage");
// const { authenticateUser, authorizeAdmin } = require('../middlewares/authMiddleware');
const {
  createUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/User");
const {createProduct, listProducts, deleteProduct, updateProduct, getProductById } = require("../controllers/Product");
const {createTransaction, deleteTransaction, getTransaction, 
  listTransactions, updateTransaction, getTransactionFive, listTransactionsFive,
  calculateThisMonthsProfit, calculateLast7DaysProfit, calculateTodaysProfit, calculateYesterdaysProfit,
  getMonthlyImportedProducts, getMonthlySoldProducts, getTransactionById} = require("../controllers/Transaction");
const User = require("../models/User");
const Product = require("../models/Product");

router.post("/login", loginUser);
router.post("/accounts", createUser);
// router.post("/recover-password", limiter, sendLoginEmail, (req, res) => {res.status(200).json({message: "successfully"})} );

router.patch(
  "/upload-avatar",
  limiter,
  uploadImg("uploads").single("image"),
  async (req, res) => {
    try {
      if (req.file) {
        const user = await User.findById(req.session.user._id).select(
          "-password"
        );
        const urlImg = `http://localhost:8080/${req.file.path}`;
        user.profilePicture = urlImg;
        await user.save();
        req.session.user = user;
        return res.status(200).json({ message: "successfully", url: urlImg });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.patch("/update-profile", async (req, res) => {
  const { fullname, password, email } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { fullname, password },
      { new: true }
    );
    req.session.user = user;
    res.status(200).json({ message: "update successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const id = req.session.user._id;
    const users = await User.find({ role: "salesperson", _id: { $ne: id } }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/new-salesperson", async (req, res) => {
  try {
    const id = req.session.user._id;
    const users = await User.find({ role: "salesperson", _id: { $ne: id }})
      .select("-password")
      .limit(5);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.patch("/toggle-lock/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let user = await User.findById(id);
    if (user.isLocked) {
      user.isLocked = false;
    } else {
      user.isLocked = true;
    }
    await user.save();
    res.status(200).json({ message: "successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/resend-email/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let user = await User.findById(id);
    console.log(user);
    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "1m",
    });
    const loginLink = `http://localhost:8080/login?token=${token}`;
    const content = `Please click this link to login: ${loginLink}`;
    const result = await sendLoginEmail(user.email, content);
    if (!result) {
      return res.status(409).json({ message: "Cannot resend email" });
    }
    res.status(200).json({ message: "successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/change-first-password", async (req, res) => {
    const {newPassword} = req.body;
    try{
        const user = await User.findByIdAndUpdate(req.session.user._id, {password: newPassword, isActive : true}, {new: true});
        req.session.user = user;
        res.status(200).json({message: "successfully"});
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

router.get("/user/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post("/add-user", async (req, res) => {
    const {fullname, email} = req.body;
    try {
        let user = await User.findOne({email});
        if(user){
            return res.status(409).json({error: "User already exists"});
        }
        const username = email.split('@')[0];
        const password = username;
        user = await User.create({ username, password, email, fullname});
        const token = jwt.sign({ user }, process.env.JWT_SECRET, {
            expiresIn: "1m",
        });
        const loginLink = `http://localhost:8080/login?token=${token}`;
        const content = `Please click this link to login: ${loginLink}`;
        const result = await sendLoginEmail(user.email, content);
        if (!result) {
            return res.status(409).json({ message: "Cannot resend email" });
        }
        res.status(201).json({message: "Create salesperson and send email successfully"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post("/recover-password", limiter, async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        const content = `Your password is: "${user.password}"`
        const result = await sendLoginEmail(user.email, content);
        console.log(result);
        if (!result) {
            return res.status(409).json({ message: "Cannot resend email" });
        }
        res.status(200).json({message: "Please check your email"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/products", listProducts);

router.get("/products/:id", getProductById);

router.patch("/products/:productId", uploadImg('uploads').single('image'), updateProduct);

router.delete("/products/:productId", deleteProduct);

router.post("/transactions", createTransaction);

router.get("/transactions", listTransactions)

router.get("/transactions/getById/:id", getTransactionById)

router.get("/transactions/getFive", listTransactionsFive)

router.get("/transactions/salesperson", getTransaction)

router.get("/transactions/salesperson/getFive", getTransactionFive)

router.get("/transactions/calculateThisMonthsProfit", calculateThisMonthsProfit)

router.get("/transactions/calculateLast7DaysProfit", calculateLast7DaysProfit)

router.get("/transactions/calculateTodaysProfit", calculateTodaysProfit)

router.get("/transactions/calculateYesterdaysProfit", calculateYesterdaysProfit)

router.get("/transactions/getMonthlyImportedProducts", getMonthlyImportedProducts)

router.get("/transactions/getMonthlySoldProducts", getMonthlySoldProducts)

module.exports = router;

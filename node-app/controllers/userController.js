// const mongoose = require('mongoose');
// var jwt = require('jsonwebtoken');

// const Users = mongoose.model('Users', {
//     username: String,
//     mobile: String,
//     email: String,
//     password: String,
//     likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }]
// });

// module.exports.likeProducts = (req, res) => {
//     let productId = req.body.productId;
//     let userId = req.body.userId;

//     Users.updateOne({ _id: userId }, { $addToSet: { likedProducts: productId } })
//         .then(() => {
//             res.send({ message: 'liked success.' })
//         })
//         .catch(() => {
//             res.send({ message: 'server err' })
//         })

// }

// module.exports.dislikeProducts = (req, res) => {
//     let productId = req.body.productId;
//     let userId = req.body.userId;

//     Users.updateOne({ _id: userId }, { $pull: { likedProducts: productId } })
//         .then(() => {
//             res.send({ message: 'Disliked success.' })
//         })
//         .catch(() => {
//             res.send({ message: 'server err' })
//         })

// }

// module.exports.signup = (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;
//     const email = req.body.email;
//     const mobile = req.body.mobile;
//     const user = new Users({ username: username, password: password, email, mobile });
//     user.save()
//         .then(() => {
//             res.send({ message: 'saved success.' })
//         })
//         .catch(() => {
//             res.send({ message: 'server err' })
//         })

// }

// module.exports.myProfileById = (req, res) => {
//     let uid = req.params.userId

//     Users.findOne({ _id: uid })
//         .then((result) => {
//             res.send({
//                 message: 'success.', user: {
//                     email: result.email,
//                     mobile: result.mobile,
//                     username: result.username
//                 }
//             })
//         })
//         .catch(() => {
//             res.send({ message: 'server err' })
//         })

//     return;

// }

// module.exports.getUserById = (req, res) => {
//     const _userId = req.params.uId;
//     Users.findOne({ _id: _userId })
//         .then((result) => {
//             res.send({
//                 message: 'success.', user: {
//                     email: result.email,
//                     mobile: result.mobile,
//                     username: result.username
//                 }
//             })
//         })
//         .catch(() => {
//             res.send({ message: 'server err' })
//         })
// }


// module.exports.login = (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;

//     Users.findOne({ username: username })
//         .then((result) => {
//             if (!result) {
//                 res.send({ message: 'user not found.' })
//             } else {
//                 if (result.password == password) {
//                     const token = jwt.sign({
//                         data: result
//                     }, 'MYKEY', { expiresIn: '1h' });
//                     res.send({ message: 'find success.', token: token, userId: result._id, username: result.username })
//                 }
//                 if (result.password != password) {
//                     res.send({ message: 'password wrong.' })
//                 }

//             }

//         })
//         .catch(() => {
//             res.send({ message: 'server err' })
//         })

// }

// module.exports.likedProducts = (req, res) => {

//     Users.findOne({ _id: req.body.userId }).populate('likedProducts')
//         .then((result) => {
//             res.send({ message: 'success', products: result.likedProducts })
//         })
//         .catch((err) => {
//             res.send({ message: 'server err' })
//         })

// }







const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load .env file

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    mobile: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true, minlength: 6 },
    likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Products" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

// 🔹 Hash Password Before Saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔹 Like Product
module.exports.likeProducts = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    await User.updateOne({ _id: userId }, { $addToSet: { likedProducts: productId } });
    res.json({ message: "Product liked successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Dislike Product
module.exports.dislikeProducts = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    await User.updateOne({ _id: userId }, { $pull: { likedProducts: productId } });
    res.json({ message: "Product disliked successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 User Signup with Hashed Password
module.exports.signup = async (req, res) => {
  try {
    const { username, password, email, mobile } = req.body;
    if (!username || !password || !email || !mobile) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const user = new User({ username, password, email, mobile });
    await user.save();
    res.json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get User Profile
module.exports.myProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "Success", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get User By ID
module.exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.uId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "Success", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 User Login with Password Verification
module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful.", token, userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get Liked Products
module.exports.likedProducts = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId).populate("likedProducts");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "Success", products: user.likedProducts });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

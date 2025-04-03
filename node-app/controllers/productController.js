
const mongoose = require('mongoose');


let schema = new mongoose.Schema({
    pname: String,
    pdesc: String,
    price: String,
    category: String,
    pimage: String,
    pimage2: String,
    addedBy: mongoose.Schema.Types.ObjectId,
    pLoc: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    }
})

schema.index({ pLoc: '2dsphere' });

const Products = mongoose.model('Products', schema);


module.exports.search = (req, res) => {

    console.log(req.query)

    let latitude = req.query.loc.split(',')[0]
    let longitude = req.query.loc.split(',')[1]

    let search = req.query.search;
    Products.find({
        $or: [
            { pname: { $regex: search } },
            { pdesc: { $regex: search } },
            { price: { $regex: search } },
        ],
        pLoc: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(latitude), parseFloat(longitude)]
                },
                $maxDistance: 500 * 1000,
            }

        }
    })
        .then((results) => {
            res.send({ message: 'success', products: results })
        })
        .catch((err) => {
            res.send({ message: 'server err' })
        })
}

module.exports.addProduct = (req, res) => {

    console.log(req.files);
    console.log(req.body);


    const plat = req.body.plat;
    const plong = req.body.plong;
    const pname = req.body.pname;
    const pdesc = req.body.pdesc;
    const price = req.body.price;
    const category = req.body.category;
    const pimage = req.files.pimage[0].path;
    const pimage2 = req.files.pimage2[0].path;
    const addedBy = req.body.userId;

    const product = new Products({
        pname, pdesc, price, category, pimage, pimage2, addedBy, pLoc: {
            type: 'Point', coordinates: [plat, plong]
        }
    });
    product.save()
        .then(() => {
            res.send({ message: 'saved success.' })
        })
        .catch(() => {
            res.send({ message: 'server err' })
        })
}

module.exports.editProduct = (req, res) => {

    console.log(req.files);
    console.log(req.body);


    const pid = req.body.pid;
    const pname = req.body.pname;
    const pdesc = req.body.pdesc;
    const price = req.body.price;
    const category = req.body.category;
    let pimage = '';
    let pimage2 = '';
    if (req.files && req.files.pimage && req.files.pimage.length > 0) {
        pimage = req.files.pimage[0].path;
    }
    if (req.files && req.files.pimage2 && req.files.pimage2.length > 0) {
        pimage2 = req.files.pimage2[0].path;
    }
    // const addedBy = req.body.userId;

    // const product = new Products({
    //     pname, pdesc, price, category, pimage, pimage2, addedBy, pLoc: {
    //         type: 'Point', coordinates: [plat, plong]
    //     }
    // });

    let editObj = {};

    if (pname) {
        editObj.pname = pname;
    }
    if (pdesc) {
        editObj.pdesc = pdesc;
    }
    if (price) {
        editObj.price = price;
    }
    if (category) {
        editObj.category = category;
    }
    if (pimage) {
        editObj.pimage = pimage;
    }
    if (pimage2) {
        editObj.pimage2 = pimage2;
    }

    Products.updateOne({ _id: pid }, editObj, { new: true })
        .then((result) => {
            res.send({ message: 'saved success.', product: result })
        })
        .catch(() => {
            res.send({ message: 'server err' })
        })
}


module.exports.getProducts = (req, res) => {

    const catName = req.query.catName;
    let _f = {}

    if (catName) {
        _f = { category: catName }
    }

    Products.find(_f)
        .then((result) => {
            res.send({ message: 'success', products: result })

        })
        .catch((err) => {
            res.send({ message: 'server err' })
        })

}

module.exports.getProductsById = (req, res) => {
    console.log(req.params);

    Products.findOne({ _id: req.params.pId })
        .then((result) => {
            res.send({ message: 'success', product: result })
        })
        .catch((err) => {
            res.send({ message: 'server err' })
        })

}

module.exports.myProducts = (req, res) => {

    const userId = req.body.userId;

    Products.find({ addedBy: userId })
        .then((result) => {
            res.send({ message: 'success', products: result })
        })
        .catch((err) => {
            res.send({ message: 'server err' })
        })

}

module.exports.deleteProduct = (req, res) => {

    Products.findOne({ _id: req.body.pid })
        .then((result) => {
            if (result.addedBy == req.body.userId) {
                Products.deleteOne({ _id: req.body.pid })
                    .then((deleteResult) => {
                        if (deleteResult.acknowledged) {
                            res.send({ message: 'success.' })
                        }
                    })
                    .catch(() => {
                        res.send({ message: 'server err' })
                    })
            }

        })
        .catch(() => {
            res.send({ message: 'server err' })
        })
}





// const mongoose = require('mongoose');

// // Schema with validation and additional fields
// let schema = new mongoose.Schema({
//     pname: { type: String, required: true, trim: true },
//     pdesc: { type: String, required: true, trim: true },
//     price: { type: Number, required: true },
//     category: { type: String, required: true },
//     condition: { type: String, enum: ['new', 'used'], default: 'used' },
//     pimage: String,
//     pimage2: String,
//     addedBy: mongoose.Schema.Types.ObjectId,
//     pLoc: {
//         type: {
//             type: String,
//             enum: ['Point'],
//             default: 'Point'
//         },
//         coordinates: {
//             type: [Number],
//             required: true
//         }
//     }
// });

// // Index for geospatial query
// schema.index({ pLoc: '2dsphere' });

// const Products = mongoose.model('Products', schema);

// // Search with additional filters and pagination
// module.exports.search = (req, res) => {
//     console.log(req.query);

//     let latitude = req.query.loc.split(',')[0];
//     let longitude = req.query.loc.split(',')[1];

//     let search = req.query.search;
//     let category = req.query.category;
//     let priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : 0;
//     let priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : Infinity;
//     let page = req.query.page || 1;
//     let limit = 10; // Number of items per page

//     let query = {
//         $or: [
//             { pname: { $regex: search, $options: 'i' } },
//             { pdesc: { $regex: search, $options: 'i' } },
//             { price: { $regex: search, $options: 'i' } },
//         ],
//         pLoc: {
//             $near: {
//                 $geometry: {
//                     type: 'Point',
//                     coordinates: [parseFloat(latitude), parseFloat(longitude)],
//                 },
//                 $maxDistance: 500 * 1000,
//             }
//         },
//         price: { $gte: priceMin, $lte: priceMax }
//     };

//     if (category) {
//         query.category = category;
//     }

//     Products.find(query)
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .then((results) => {
//             res.send({ message: 'Products fetched successfully', products: results });
//         })
//         .catch((err) => {
//             res.send({ message: 'Server error', error: err });
//         });
// };

// // Add product with unique message
// module.exports.addProduct = (req, res) => {
//     console.log(req.files);
//     console.log(req.body);

//     const { pname, pdesc, price, category, plat, plong, userId } = req.body;
//     const pimage = req.files.pimage ? req.files.pimage[0].path : '';
//     const pimage2 = req.files.pimage2 ? req.files.pimage2[0].path : '';

//     const product = new Products({
//         pname, pdesc, price, category, pimage, pimage2, addedBy: userId, pLoc: {
//             type: 'Point', coordinates: [plat, plong]
//         }
//     });

//     product.save()
//         .then(() => {
//             res.send({ message: 'Your product has been listed successfully.' });
//         })
//         .catch((err) => {
//             res.send({ message: 'Server error while adding product', error: err });
//         });
// };

// // Update product with unique message
// module.exports.editProduct = (req, res) => {
//     console.log(req.files);
//     console.log(req.body);

//     const { pid, pname, pdesc, price, category } = req.body;
//     let pimage = '';
//     let pimage2 = '';

//     if (req.files && req.files.pimage && req.files.pimage.length > 0) {
//         pimage = req.files.pimage[0].path;
//     }
//     if (req.files && req.files.pimage2 && req.files.pimage2.length > 0) {
//         pimage2 = req.files.pimage2[0].path;
//     }

//     let editObj = {};
//     if (pname) editObj.pname = pname;
//     if (pdesc) editObj.pdesc = pdesc;
//     if (price) editObj.price = price;
//     if (category) editObj.category = category;
//     if (pimage) editObj.pimage = pimage;
//     if (pimage2) editObj.pimage2 = pimage2;

//     Products.updateOne({ _id: pid }, editObj, { new: true })
//         .then((result) => {
//             res.send({ message: 'Product updated successfully.', product: result });
//         })
//         .catch((err) => {
//             res.send({ message: 'Server error while updating product', error: err });
//         });
// };

// // Get products by category
// module.exports.getProducts = (req, res) => {
//     const catName = req.query.catName;
//     let filter = {};

//     if (catName) {
//         filter = { category: catName };
//     }

//     Products.find(filter)
//         .then((result) => {
//             res.send({ message: 'Products fetched successfully', products: result });
//         })
//         .catch((err) => {
//             res.send({ message: 'Server error', error: err });
//         });
// };

// // Get product by ID
// module.exports.getProductsById = (req, res) => {
//     console.log(req.params);

//     Products.findOne({ _id: req.params.pId })
//         .then((result) => {
//             res.send({ message: 'Product fetched successfully', product: result });
//         })
//         .catch((err) => {
//             res.send({ message: 'Server error', error: err });
//         });
// };

// // Get products by user
// module.exports.myProducts = (req, res) => {
//     const userId = req.body.userId;

//     Products.find({ addedBy: userId })
//         .then((result) => {
//             res.send({ message: 'Your products fetched successfully', products: result });
//         })
//         .catch((err) => {
//             res.send({ message: 'Server error', error: err });
//         });
// };

// // Delete product with user validation
// module.exports.deleteProduct = (req, res) => {
//     Products.findOne({ _id: req.body.pid })
//         .then((result) => {
//             if (result.addedBy.toString() === req.body.userId) {
//                 Products.deleteOne({ _id: req.body.pid })
//                     .then((deleteResult) => {
//                         if (deleteResult.acknowledged) {
//                             res.send({ message: 'Product deleted successfully.' });
//                         }
//                     })
//                     .catch((err) => {
//                         res.send({ message: 'Server error while deleting product', error: err });
//                     });
//             } else {
//                 res.send({ message: 'You are not authorized to delete this product.' });
//             }
//         })
//         .catch((err) => {
//             res.send({ message: 'Server error while finding product', error: err });
//         });
// };

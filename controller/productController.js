import Product from "../model//Product.js";
import Category from "../model/Category.js";
import catchAsync from "../util/catchAsync.js";
import path from "path";
import AppError from "../util/appError.js";
import authController from './authController.js'
const __dirname = path.resolve();

const getProduct = catchAsync(async(req, resp, next) => {
    let query = Product.find({}).populate("Category");
    //paginate
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
        const numOfTours = await Product.countDocuments();
        if (skip >= numOfTours) throw new AppError("This page doesn't exist", 404);
    }
    const products = await query;
    if (!products) {
        return next(new AppError("No Product exist", 404));
    }
    return resp.status(201).json({
        status: "success",
        data: {
            products,
        },
    });
});

const addProduct = catchAsync(async(req, resp, next) => {


    // console.log(req.user)
    // console.log(req.body);

    //1)
    if (!req.files) {
        return resp.status(201).json({
            status: "fail",
            message: "Add product image",
        });
    }

    //2)
    const category = await Category.findOne({ Category_name: req.body.Category });
    if (!category) {
        return next(new AppError("Enter a valid Category", 401));
    }
    const category_id = category._id;

    const file = req.files.myFile;
    // console.log(file);
    const pathOfFile = __dirname + "/files/" + file.name;
    //console.log(pathOfFile);

    file.mv(pathOfFile, (err) => {
        if (err) {
            return resp.status(500).send(err.message);
        }
        //return resp.send({ status: "success", path: pathOfFile });
    });

    const newProduct = await Product.create({
        ...req.body,
        owner: req.user._id,
        Category: category_id,
        Product_Image: pathOfFile,
    });
    console.log(newProduct);

    return resp.status(201).json({
        status: "success",
        data: {
            newProduct,
        },
    });
});

const findByCategory = catchAsync(async(req, resp, next) => {
    const category = req.query.category;
    console.log(category);
    const categoryObj = await Category.findOne({ Category_name: category });
    if (!categoryObj) {
        return next(new AppError("No valid Category is there", 401));
    }
    const id = categoryObj._id;
    const products = await Product.find({ Category: id });
    if (!products) {
        return next(new AppError("No product is there", 401));
    }
    return resp.status(201).json({
        status: "success",
        data: {
            products,
        },
    });
});

const findById = catchAsync(async(req, resp, next) => {
    const product = await Product.findOne({ owner: req.user._id, _id: req.params.id }).populate('Category')

    if (!product) {
        return next(new AppError("No Product found with certain id", 404))
    }
    return resp.status(201).json({
        status: "success",
        data: {
            product,
        },
    });
})

const productpage = catchAsync(async(req, resp, next) => {
    resp.sendFile(path.join(__dirname, "/public/addProduct.html"));
})

export default {
    addProduct,
    getProduct,
    findByCategory,
    findById,
    productpage
};
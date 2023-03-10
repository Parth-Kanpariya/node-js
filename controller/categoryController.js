import Category from "../model/Category.js";
import catchAsync from "../util/catchAsync.js";
import path from "path";
import AppError from "../util/appError.js";
import Product from "../model/Category.js";

const getCategories = catchAsync(async (req, resp, next) => {
  let query = Category.aggregate([
    {
      $lookup: {
        from: "Product",
        localField: "_id",
        foreignField: "Category",
        as: "Products",
      },
    },
    {
      $addFields: {
        ProductCount: {
          $size: "$Products",
        },
      },
    },
  ]);

  //paginate
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numOfTours = await Category.countDocuments();
    if (skip >= numOfTours) throw new AppError("This page doesn't exist", 404);
  }
  const categories = await query;
  if (!categories) {
    return next(new AppError("No data found", 404));
  }

  return resp.status(201).json({
    status: "success",
    data: {
      categories,
    },
  });
});

const addCategories = catchAsync(async (req, resp, next) => {
  const newCategory = await Category.create(req.body);
  return resp.status(201).json({
    status: "success",
    data: {
      newCategory,
    },
  });
});

const updateCategory = catchAsync(async(req, resp, next)=>{
     const category = await Category.findOne({_id:req.params.id})
     if(!category)
     {
        return next(new AppError("No category available", 404));
     }
     const updatedCategory = await Category.findByIdAndUpdate({_id:req.params.id}, req.body, {
         runValidators:true, new:true
     })

     return resp.status(201).json({
        status: "success",
        data: {
            updatedCategory,
        },
      });


})

const deleteCategory = catchAsync(async(req, resp, next)=>{
    const category = await Category.findOne({Category_name:req.params.category})
    if(!category)
    {
        return next(new AppError("No category available", 404));
    }
    const products = await Product.find({Category:category._id})
    
    if(products.length !== 0)
    {
        return next(new AppError("Category can't delete, it has products", 404));
    }

    const deletedCategory = await Category.deleteOne({Category_name : req.params.category})
    return resp.status(200).json({
        status: "success",
        data: {
            deletedCategory,
        },
      });
    
    
})

export default {
  getCategories,
  addCategories,
  updateCategory,
  deleteCategory
};

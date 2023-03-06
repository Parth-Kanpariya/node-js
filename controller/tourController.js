const mongoose = require("mongoose");
const { findByIdAndDelete } = require("../model/toueModel");
const TourModel = require("../model/toueModel");
const APIFeature = require("../util/apiFeatures");
//alias top tour
exports.aliasTopTour = (req, resp, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,ratingAverage,summary,difficulty";
    next();
};
//create tour
exports.createTour = async(req, resp, next) => {
    //we need to create 2 variables
    // const newTour = new TourModel({})
    // const tour = await newTour.save()

    //we also have another method
    try {
        const newTour = await TourModel.create(req.body);
        resp.status(201).json({
            success: true,
            data: newTour,
        });
    } catch (error) {
        resp.status(400).json({
            success: false,
            message: "Invalid data sent!",
        });
    }
};

//get all tour
exports.getAllTour = async(req, resp, next) => {
    try {
        //to avoid parameters which are not in db
        //Build query
        //1A).filtering
        // const queryObj = {...req.query }
        // const excludedField = ['page', 'sort', 'limit', 'fields']
        // excludedField.forEach(el => delete queryObj[el])

        // //1B). advanced filtering
        // //before
        // //{difficulty: 'easy', duration: { gte:5 }}
        // let queryStr = JSON.stringify(queryObj)
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        //     //after
        //{difficulty: 'easy', duration: { $gte:5 }}

        // let query = TourModel.find(JSON.parse(queryStr))

        //2 sorting
        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(",").join(" ");
        //     query = query.sort(sortBy);
        // } else {
        //     // here - means decending order
        //     query = query.sort("-createdAt");
        // }

        //3) field limiting
        // if (req.query.fields) {
        //     const fields = req.query.fields.split(",").join(" ");
        //     query = query.select(fields);
        // } else {
        //     //here - meand excluding that field
        //     query = query.select("-__v");
        // }

        //4). pagination
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;

        // // page 1=>1-10, page 2=> 11-20, page 3=>21-30
        // //here we are skipping the skip no.of pages and showing only limit no. of docs
        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const numOfTours = await TourModel.countDocuments();
        //     if (skip >= numOfTours) throw new Error("This page doesn't exist");
        // }

        const feature = new APIFeature(TourModel.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        //execute query
        const tours = await feature.query;

        // const query = TourModel.find()
        // .where('duration')
        // .equals(5)
        // .where('difficulty')
        // .equals('easy')

        resp.status(200).json({
            success: true,
            results: tours.length,
            data: tours,
        });
    } catch (error) {
        resp.status(404).json({
            success: false,
            message: "No data available",
        });
    }
};

//get single tour by id
exports.getTour = async(req, resp, next) => {
    try {
        //below findById returns query object so we can do sorting and similar stuffs over it
        const tour = await TourModel.findById(req.params.id);
        //TourModel.findOne({_id: req.params.id})
        if (!tour) {
            return resp.status(200).json({
                success: false,
                data: "Tour is not there with given id",
            });
        }

        resp.status(200).json({
            success: true,
            data: tour,
        });
    } catch (error) {
        resp.status(404).json({
            success: false,
            message: "No tour available",
        });
    }
};

//update the tour
exports.updateTour = async(req, resp, next) => {
    try {
        const updatedTour = await TourModel.findByIdAndUpdate(
            req.params.id,
            req.body, {
                new: true,
                runValidators: true,
            }
        );

        resp.status(200).json({
            success: true,
            data: updatedTour,
        });
    } catch (error) {
        resp.status(400).json({
            success: false,
            message: "No updation occure",
        });
    }
};

//delete tour
exports.deleteTour = async(req, resp, next) => {
    try {
        const deletedTour = await TourModel.findByIdAndDelete(req.params.id);
        if (!deletedTour) {
            return resp.status(400).json({
                success: false,
                message: "No data is available",
            });
        }
        resp.status(200).json({
            success: true,
            data: deletedTour,
        });
    } catch (error) {
        resp.status(400).json({
            success: false,
            message: "No deletion occure",
        });
    }
};

exports.getTourStats = async(req, resp, next) => {
    try {
        const stats = await TourModel.aggregate([{
                $match: {
                    ratingsAverage: { $gt: 4.5 },
                },
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: "$ratingsAverage" },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                },
            },
            {
                $sort: {
                    avgPrice: 1
                }
            }
            // {
            //     $match: {
            //         _id: { $ne: "EASY" }
            //     }
            // }
        ]);

        resp.status(200).json({
            success: false,
            data: {
                stats
            },
        });

    } catch (error) {
        resp.status(400).json({
            success: false,
            message: "No deletion occure",
        });
    }
};

exports.getMonthlyPlan = async(req, resp, next) => {
    try {
        const year = req.params.year * 1
        const plan = await TourModel.aggregate([{
                $unwind: "$startDates"
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numToursStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numToursStarts: -1 }
            },
            {
                $limit: 5
            }
        ])

        resp.status(200).json({
            success: false,
            data: {
                plan
            },
        });
    } catch (error) {
        resp.status(400).json({
            success: false,
            message: "No deletion occure",
        });
    }
}
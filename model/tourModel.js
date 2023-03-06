const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal than 40 character'],
        minlength: [10, 'A tour name must have more or equal than 10 character'],
        // validate:[validator.isAlpha, 'A tour name must be alpha numeric']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Ratings must be above 1.0'],
        max: [5, 'Ratings must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true,

    },
    imageCover: {
        type: String,
        requied: [true, 'A tour must have a imageCover ']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    /*timestamps: true,*/
    collection: 'Tour',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//virtual property
tourSchema.virtual('durationWeek').get(function() {
    return this.duration / 7
})

//Document Middleware...runs before .save() & .create() method
//we also can add multiple same middleware
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

//here middleware runs after .save() & .create() method
//here doc is the document that saved to the database
// tourSchema.post('save', function(doc, next) {
//     console.log(doc)
//     next()
// })

//Query middleware
//runs whenever query fired that starting with find 
// and here this doesn't point to object that will get but it refered to the query on which hook initiated
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } })
        //just embed with the this object
    this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now()-this.start} milliseconds`)
    console.log(docs)
    next()
})

//Aggregatin Middleware
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    console.log(this.pipeline())
    next()
})

module.exports = mongoose.model('Tour', tourSchema)
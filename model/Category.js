import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
    Category_name:{
        type:String,
        unique:true,
        trim:true,
        required:[true, "Category name should be require"]
    },
}, {collection:'Category'})

const Product = mongoose.model('Category', categorySchema)
export default Product
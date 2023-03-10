import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    Product_name:{
        type:String,
        unique:true,
        trim:true,
        required:[true, "Product name should be require"]
    },
    Description:{
        type:String,
        required:[true, "Product Description should be require"]
    },
    Category:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Category'
    },
    Product_Image:{
        type:String,
        required:[true, "Product Image should be require"]
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
       
    }
}, {collection:'Product'})

const Product = mongoose.model('Product', productSchema)
export default Product
class APIFeature {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = {...this.queryString };
        const excludedField = ["page", "sort", "limit", "fields"];
        excludedField.forEach((el) => delete queryObj[el]);

        //1B). advanced filtering
        //before
        //{difficulty: 'easy', duration: { gte:5 }}
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        //after
        //{difficulty: 'easy', duration: { $gte:5 }}
        this.query.find(JSON.parse(queryStr))
        return this
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            // here - means decending order
            this.query = this.query.sort("-createdAt");
        }
        return this
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            //here - meand excluding that field
            this.query = this.query.select("-__v");
        }
        return this
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        // page 1=>1-10, page 2=> 11-20, page 3=>21-30
        //here we are skipping the skip no.of pages and showing only limit no. of docs
        this.query = this.query.skip(skip).limit(limit);

        return this

    }

}



module.exports = APIFeature
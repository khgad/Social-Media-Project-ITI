const mongoose = require('mongoose');
const { Schema } = mongoose;
const _ = require('lodash');


const postSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
    // virtuals are not included in toJSON() and toObject() output by default so we should set virtuals: true
    toJSON: {
        virtuals: true,      // So `res.json()` and other `JSON.stringify()` functions include virtuals
        transform: (dir, ret) => {
            const dataToReturn = _.pick(ret, ['_id', 'user', 'content', 'createdAt', 'updatedAt', 'comments', 'reviews']);
            return dataToReturn;
        }
    },
    toObject: {
        virtuals: true      // So `console.log()` and other functions that use `toObject()` include virtuals
    }
});

// Specifying a virtual with a `ref` property to enable virtual population
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
});

postSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'post'
});

// Query Hook to autopopulate
const autoPopulate = function (next) {
    this.populate('comments').populate('reviews');
    next();
};

postSchema.
    pre('findOne', autoPopulate).
    pre('find', autoPopulate).
    pre('findOneAndUpdate', autoPopulate).
    pre('findOneAndDelete', autoPopulate);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
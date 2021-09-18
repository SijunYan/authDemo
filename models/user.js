const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.statics.findAndValidate = async function (username, password) {
    const user = await this.findOne({ username: username });
    if (!user) {
        return false;
    };
    const result = await bcrypt.compare(password, user.password);
    return result ? user : false;
}




module.exports = mongoose.model('User', userSchema);
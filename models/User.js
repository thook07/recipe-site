const Sequelize = require('sequelize')
const crypto = require('crypto')
const db = require('../config/database')
const Favorite = require('../models/Favorite');

const User = db.define('user', {
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        get() {
            return () => this.getDataValue('password')
        }
    },
    salt: {
        type: Sequelize.STRING,
        get() {
            return() => this.getDataValue('salt')
        }
    },
    role: {
        type: Sequelize.STRING,
        defaultValue: "User"
    }
});

User.generateSalt = function() {
    return crypto.randomBytes(16).toString('base64')
}
User.encryptPassword = function(plainText, salt) {
    return crypto
        .createHash('RSA-SHA256')
        .update(plainText)
        .update(salt)
        .digest('hex')
}

User.byEmail = async function(email) {
    return await User.findOne({
        where: {
          email: email
        }
    });
}

User.prototype.getFavorites = async function(){
    const favorites = await Favorite.findAll({
        where: {
            userId: this.id
        }
    });
    var ids = [];
    favorites.forEach(favorite => ids.push(favorite.recipeId))
    return ids;
}

User.prototype.correctPassword = function(enteredPassword) {
    return User.encryptPassword(enteredPassword, this.salt()) === this.password()
}

const setSaltAndPassword = user => {
    if (user.changed('password')) {
        user.salt = User.generateSalt()
        user.password = User.encryptPassword(user.password(), user.salt())
    }
}


User.beforeCreate(setSaltAndPassword)
User.beforeUpdate(setSaltAndPassword)

module.exports = User;
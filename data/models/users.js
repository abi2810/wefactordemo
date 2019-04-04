const DataTypes = require('sequelize');
const sequelize = require('../sequelize');

const User = sequelize.define('users',{
	id:{
		type: DataTypes.INTEGER(11),
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	name:{
		type: DataTypes.STRING(100),
		allowNull: false,
		primaryKey: false,
		// autoIncrement: true
	},

});

module.exports = User;

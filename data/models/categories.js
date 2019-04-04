const DataTypes = require('sequelize');
const sequelize = require('../sequelize');

const Category = sequelize.define('categories',{
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
	desc:{
		type: DataTypes.STRING(100),
		allowNull: false,
		primaryKey: false,
		// autoIncrement: true
	},
	image_url:{
		type: DataTypes.STRING(100),
		allowNull: false,
		primaryKey: false,
		// autoIncrement: true
	},

});

module.exports = Category;

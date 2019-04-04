const DataTypes = require('sequelize');
const sequelize = require('../sequelize');

const Image = sequelize.define('images',{
	id:{
		type: DataTypes.INTEGER(11),
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	name:{
		type: DataTypes.STRING(100),
		allowNull: true,
		primaryKey: false,
		// autoIncrement: true
	},
	

});

module.exports = Image;

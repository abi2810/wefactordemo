const DataTypes = require('sequelize');
const sequelize = require('../sequelize');

const Admin = sequelize.define('admin',{
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
	email:{
		type: DataTypes.STRING(100),
		allowNull: false,
		primaryKey: false,
		// autoIncrement: true
	},
	password:{
		type: DataTypes.STRING(100),
		allowNull: false,
		primaryKey: false,
		// autoIncrement: true
	},

});

module.exports = Admin;

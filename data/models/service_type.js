const DataTypes = require('sequelize');
const sequelize = require('../sequelize');

const ServiceType = sequelize.define('service_type',{
	id:{
		type: DataTypes.INTEGER(11),
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	service_id:{
		type: DataTypes.INTEGER(11),
		allowNull: false,
		primaryKey: false,
		autoIncrement: false
	},
	name:{
		type: DataTypes.STRING(100),
		allowNull: false,
		primaryKey: false,
		// autoIncrement: true
	},
	price:{
		type: DataTypes.STRING(100),
		allowNull: false,
		primaryKey: false,
		// autoIncrement: true
	}
});

module.exports = ServiceType;

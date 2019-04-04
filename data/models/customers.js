const DataTypes = require('sequelize');
const sequelize = require('../sequelize');

const Customer = sequelize.define('coustomers',{
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
	phoneno:{
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
	is_active: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    },
    is_email_verify: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    },

});

module.exports = Customer;

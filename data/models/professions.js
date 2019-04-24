const DataTypes = require('sequelize');
const sequelize = require('../sequelize');

const Profession = sequelize.define('professions',{
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
		allowNull: true,
		primaryKey: false,
		// autoIncrement: true
	},
	phoneno:{
		type: DataTypes.STRING(11),
		allowNull: false,
		primaryKey: false,
		// autoIncrement: true
	},
	password:{
		type: DataTypes.STRING(100),
		allowNull: true,
		primaryKey: false,
		// autoIncrement: true
	},
	services_known:{
		type: DataTypes.STRING(500),
		allowNull: true,
		primaryKey: false,
		// autoIncrement: true
	},
	city:{
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
  is_verify: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
  }
});

module.exports = Profession;

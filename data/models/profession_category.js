const DataTypes = require('sequelize');
const sequelize = require('../sequelize');

const ProfessionCategory = sequelize.define('profession_categories',{
	id:{
		type: DataTypes.INTEGER(11),
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	category_id:{
		type: DataTypes.INTEGER(11),
		allowNull: false,
		primaryKey: false,
		autoIncrement: false
	},
	profession_id:{
		type: DataTypes.INTEGER(11),
		allowNull: false,
		primaryKey: false,
		autoIncrement: false
	},
	is_active: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
  }
});

module.exports = ProfessionCategory;

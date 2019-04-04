const Sequelize = require('sequelize')
const NODE_ENV = process.env.NODE_ENV || 'development'

const dbUrl = {
	development: process.env.DATABASE_URL_DEV
}

const sequelize = new Sequelize(dbUrl[NODE_ENV],{
	define: {
		freezeTableName: true,
	},
});

sequelize
	.authenticate()
	.then(() => {
		console.log('Connection has been extablished successfully');
	})
	.catch(err => {
		console.error('Unabvle to connect',err)
	})

module.exports = sequelize;

module.exports = (sequelize, Sequelize) => {
    const Course = sequelize.define('courses', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        }, 
        amount:{
            type: Sequelize.FLOAT,
        }
    });

    return Course;
}

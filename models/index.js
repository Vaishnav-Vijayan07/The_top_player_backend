const { Sequelize, DataTypes, Op } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_dbname,
  process.env.DB_user,
  process.env.DB_pss,
  {
    dialect: "mysql",
    host: process.env.DB_host,
  }
);

db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Op;

db.user = require("./user")(sequelize, Sequelize);
db.category = require("./category")(sequelize, Sequelize);
db.course = require("./course")(sequelize, Sequelize);
db.video = require("./videos")(sequelize, Sequelize);
db.subcourse = require("./subcourse")(sequelize, Sequelize);
db.subscriber = require("./subscriber")(sequelize, Sequelize);
db.payment = require("./payment")(sequelize, Sequelize);
db.device = require("./device")(sequelize, Sequelize);
db.forgetPAss = require("./forgot_pass_rq")(sequelize, Sequelize);
db.adminUser = require("./adminUser")(sequelize, Sequelize);
db.news = require("./news")(sequelize, Sequelize);
db.whoAreWe = require("./whoAreWe")(sequelize, Sequelize);
db.faq = require("./faq")(sequelize, Sequelize);
db.testimonial = require("./testimonials")(sequelize, Sequelize);
db.banner = require("./banner")(sequelize, Sequelize);
db.newsImage = require("./newsImage")(sequelize, Sequelize);
db.mainBanner = require("./mainBanner")(sequelize, Sequelize);

db.user.hasMany(db.forgetPAss);
db.category.hasMany(db.course, { onDelete: "cascade" });
db.course.belongsTo(db.category);

db.testimonial.belongsTo(db.course, { foreignKey: "courseId" });

db.news.hasMany(db.newsImage, { as: "images" });
db.newsImage.belongsTo(db.news);

db.course.hasMany(db.subcourse);
db.subcourse.belongsTo(db.course);

db.subcourse.hasMany(db.video, { onDelete: "cascade" });
db.video.belongsTo(db.subcourse);

const RegisteredCourse = sequelize.define("registered_course", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

db.registeredCourse = RegisteredCourse;

db.user.belongsToMany(db.course, { through: RegisteredCourse });
db.course.belongsToMany(db.user, { through: RegisteredCourse });

db.registeredCourse.belongsTo(db.course, {
  foreignKey: "courseId",
  as: "course", // Alias for the association
});

db.registeredCourse.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user", // Alias for the association
});
db.user.hasMany(db.registeredCourse, { foreignKey: "userId" });

const WatchedVideo = sequelize.define("watched_videos", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

db.watchedVideo = WatchedVideo;
db.user.belongsToMany(db.video, { through: WatchedVideo });
db.video.belongsToMany(db.user, { through: WatchedVideo });

db.user.hasMany(db.payment);
db.user.hasMany(db.device);

db.course.hasMany(db.payment, { foreignKey: "courseId", as: "payments" });
db.payment.belongsTo(db.course, { foreignKey: "courseId" });

module.exports = db;

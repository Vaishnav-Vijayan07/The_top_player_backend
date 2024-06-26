const { Sequelize, where } = require("sequelize");
const db = require("../../models");

exports.getDashboardDetails = async (req, res) => {
  try {
    // Query to get count of expired , active and total orders
    const [commonCombos] = await db.sequelize.query(`
      SELECT rc.userId, rc.courseId, rc.createdAt, c.duration,c.isDeleted
      FROM registered_courses rc
      INNER JOIN payments p
      ON rc.userId = p.userId AND rc.courseId = p.courseId
      INNER JOIN courses c
      ON rc.courseId = c.id
      WHERE c.isDeleted = false
    `);

    const currentDate = new Date();
    const expiredCourses = [];
    const notExpiredCourses = [];

    commonCombos.forEach((registeredCourse) => {
      const startDate = new Date(registeredCourse.createdAt);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + registeredCourse.duration);

      if (currentDate > endDate) {
        expiredCourses.push(registeredCourse);
      } else {
        notExpiredCourses.push(registeredCourse);
      }
    });

    // Query to get count of paid users
    const [paidUsers] = await db.sequelize.query(`
      SELECT COUNT(DISTINCT rc.userId) AS paidUsers,c.isDeleted
      FROM registered_courses rc
      INNER JOIN courses c ON rc.courseId = c.id
      INNER JOIN payments p
      ON rc.userId = p.userId AND rc.courseId = p.courseId
      WHERE c.isDeleted = false
    `);

    // Query to get count of free users
    const [freeUsers] = await db.sequelize.query(`
     SELECT COUNT(DISTINCT rc.userId) AS freeUsers
    FROM registered_courses rc
    INNER JOIN courses c ON rc.courseId = c.id
    LEFT JOIN payments p ON rc.userId = p.userId AND rc.courseId = p.courseId
    WHERE p.userId IS NULL AND c.isDeleted = false
      `);

    // Count the number of free and paid users
    const freeUsersCount = freeUsers[0].freeUsers;
    const paidUsersCount = paidUsers[0].paidUsers;

    // Query to get count of total users
    const totalUsers = await db.user.count();
    // Query to get count of registered users
    const registeredUsersCount = await db.user.count({
      where: {
        id: {
          [Sequelize.Op.notIn]: Sequelize.literal(
            `(SELECT userId FROM registered_courses)`
          ),
        },
      },
    });

    const allCourses = await db.course.findAll({
      where: {
        isDeleted: false,
      },
    });

    // Query to get count of paid users in each course
    const enrolledUsersPerCourse = await db.payment.findAll({
      attributes: [
        "courseId",
        [Sequelize.fn("COUNT", Sequelize.literal("userId")), "enrolled_users"],
      ],
      include: [
        {
          model: db.course,
          attributes: ["name", "isDeleted"],
          as: "course",
          where: { isDeleted: false },
        },
      ],
      where: {
        userId: { [Sequelize.Op.not]: null },
      },
      group: ["courseId"],
    });

    const enrolledUsersMap = new Map();

    // Populate enrolledUsersMap with Sequelize results
    enrolledUsersPerCourse.forEach((course) => {
      const dataValues = course.dataValues;
      const courseId = dataValues.courseId;
      const enrolled_users =
        dataValues.enrolled_users == 0 ? 0 : dataValues.enrolled_users; // Access enrolled_users using get() method
      enrolledUsersMap.set(courseId, enrolled_users);
    });

    // Iterate over allCourses and add enrolled_users from enrolledUsersMap
    const coursesWithEnrollment = allCourses.map((course) => {
      const courseId = course.id;
      const enrolled_users = enrolledUsersMap.get(courseId) || 0; // Default to 0 if no enrolled_users found
      return {
        courseId: course.id,
        name: course.name,
        isDeleted: course.isDeleted,
        enrolled_users: enrolled_users,
      };
    });

    // Query to get count of monthly revenue
    const monthlyPaymentCounts = await db.payment.findAll({
      include: [
        {
          model: db.course,
          attributes: [],
          as: "course",
          where: { isDeleted: false },
        },
      ],
      attributes: [
        [Sequelize.fn("YEAR", Sequelize.col("payment.createdAt")), "year"],
        [Sequelize.fn("MONTH", Sequelize.col("payment.createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("*")), "payment_count"],
        [
          Sequelize.fn(
            "ROUND",
            Sequelize.fn("SUM", Sequelize.col("payment.amount")),
            2
          ),
          "total_amount",
        ],
      ],
      where: {
        userId: { [Sequelize.Op.not]: null },
      },
      group: [
        [Sequelize.fn("YEAR", Sequelize.col("payment.createdAt"))],
        [Sequelize.fn("MONTH", Sequelize.col("payment.createdAt"))],
      ],
      order: [
        [Sequelize.fn("YEAR", Sequelize.col("payment.createdAt")), "ASC"],
        [Sequelize.fn("MONTH", Sequelize.col("payment.createdAt")), "ASC"],
      ],
    });

    // Query to get count of recent users
    const recentUsers = await db.user.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10,
      attributes: ["username", "email", "mobile", "createdAt"],
      include: [
        {
          model: db.payment,
          attributes: ["id"],
        },
        {
          model: db.registeredCourse,
          attributes: ["id"],
          include: [
            {
              model: db.course,
              as: "course",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    // Query to get count visitors
    const visitors = await db.visitors.findAll({
      attributes: [
        [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", "*"), "visitors"],
        [Sequelize.literal("(SELECT COUNT(*) FROM visitors)"), "totalVisitors"],
      ],
      group: [
        Sequelize.fn("YEAR", Sequelize.col("createdAt")),
        Sequelize.fn("MONTH", Sequelize.col("createdAt")),
      ],
    });

    const totatlVisitors = visitors.length > 0 ? visitors[0].totalVisitors : 0;

    // Send the counts in the response
    res.status(200).json({
      activeUsersCount: paidUsersCount,
      totalUsers,
      freeUsersCount,
      registeredUsersCount,
      monthlyPaymentCounts,
      enrolledUsersPerCourse: coursesWithEnrollment,
      recentUsers,
      visitors,
      totatlVisitors,
      activeOrders: notExpiredCourses.length,
      expiredOrders: expiredCourses.length,
    });
  } catch (error) {
    console.error(`Error in getting dashboard details: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

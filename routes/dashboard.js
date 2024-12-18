const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// test
const authMiddleware = require("../middleware/auth");
const dashController = require("../controller/dashboard");
const categoryController = require("../controller/dashboard/category_controller");
const courseController = require("../controller/dashboard/course_controller");
const subCourseController = require("../controller/dashboard/subcourse_controller");
const videoUploadController = require("../controller/dashboard/video_upload_controller");
const newsController = require("../controller/dashboard/news_controller");
const whoAreWeDataController = require("../controller/dashboard/who_are_we_controller");
const faqController = require("../controller/dashboard/faq_controller");
const testimonialController = require("../controller/dashboard/testimonial_controller");
const bannerController = require("../controller/dashboard/banner_controller");
const termsController = require("../controller/dashboard/terms_controller");
const {
  getAllusers,
  updateUserStatus,
  manageUser,
  updateDeviceCount,
  updateDeviceCountGlobally,
} = require("../controller/dashboard/user_controller");
const {
  getAllorders,
  updateOrderSubscription,
  getAllOrders,
  getAllRevenues,
  getAllRevenuesOld,
} = require("../controller/dashboard/order_controller");
const {
  addMainBanner,
  getAllMainBanner,
  deleteMainBanner,
  getMainBannerById,
  updateMainBanner,
} = require("../controller/dashboard/main_banner_controller");
const { getDashboardDetails, getOrders, getOrdersUsd } = require("../controller/dashboard/details_controller");
const { getAllEnquiries, deleteEnquiry } = require("../controller/dashboard/enquiry_contoller");
const { getAllSubscriptions, deleteSubscription } = require("../controller/dashboard/subscription_controller");
const { addCurrency, getAllCurrencies, updateCurrency, deleteCurrency } = require("../controller/dashboard/currency_controller");

const { addFooter, getAllFooters, updateFooter, deleteFooter } = require("../controller/dashboard/footer_controller");
const {
  addInfluencer,
  getInfluencers,
  updateInfluencer,
  deleteInfluencer,
  getOrdersInflucencers,
  updateInfluencerStatus,
} = require("../controller/dashboard/influencer_controller");
const { getCongrats, deleteCongrats, updateCongrats, addCongrats } = require("../controller/congrats_controller");

const router = express.Router();

const multerStorageStt = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/trojanTTt/videos/new");
  },
  filename: (req, file, cb) => {
    // const ext = file.mimetype.split("/")[1];
    cb(null, `${file.originalname}`);
  },
});
const uploadStt = multer({
  storage: multerStorageStt,
});

const multerStorageImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/bannerImages");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});
const uploadImage = multer({
  storage: multerStorageImage,
});

const multerStrNewsBannerImg = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/news-banner-images");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});
const uploadNwsBnrImage = multer({
  storage: multerStrNewsBannerImg,
});

// const multerStorageNewsImage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/newsImages");
//   },
//   filename: (req, file, cb) => {
//     // const ext = file.mimetype.split("/")[1];
//     cb(null, `${file.originalname}`);
//   },
// });
// const uploadNewsImage = multer({
//   storage: multerStorageNewsImage,
// });

const multerStorageNews = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Inside multer =========>", file);

    const folder = {
      images: "public/newsImages",
      coverimage: "public/newsCoverImages",
    };
    const uploadFolder = folder[file.fieldname]; // Get folder based on field name
    cb(null, uploadFolder);
    // cb(null, 'public/uploads')
  },
  filename: (req, file, cb) => {
    console.log("Inside =========>", file);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${basename}-${uniqueSuffix}${ext}`); // Unique filename with timestamp
  },
});

const uploadNewsFiles = multer({
  storage: multerStorageNews, // Limit file size to 5MB (optional)
});

const newsFileUpload = uploadNewsFiles.fields([
  { name: "images", maxCount: 15 },
  { name: "coverimage", maxCount: 1 },
]);

const multerStorageWhoVideo = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/who_we_videos");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});
const uploadWhoVideo = multer({
  storage: multerStorageWhoVideo,
});

const multerStorageCourse = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = {
      image: "public/courseImages",
      banner: "public/courseImages",
      video: "public/courseImages",
    };
    const uploadFolder = folder[file.fieldname]; // Get folder based on field name
    cb(null, uploadFolder);
    // cb(null, 'public/uploads')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${basename}-${uniqueSuffix}${ext}`); // Unique filename with timestamp
  },
});

const uploadCourseFiles = multer({
  storage: multerStorageCourse,
  limits: { fileSize: 1024 * 1024 * 60 }, // Limit file size to 5MB (optional)
});

const courseFileUpload = uploadCourseFiles.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 8 }, { name: "video" }]);

const multerStorageBannerVideo = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/banner_videos");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});
const uploadBannerVideo = multer({
  storage: multerStorageBannerVideo,
});

const multerStorageCongratsBox = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/congrats_images");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});
const uploadCongratsBox = multer({
  storage: multerStorageCongratsBox,
});

router.get("/users/:filter?", authMiddleware.checkUserAuth, getAllusers);
router.post("/users", authMiddleware.checkUserAuth, manageUser);
router.patch("/users", authMiddleware.checkUserAuth, updateUserStatus);
router.patch("/users/devices", authMiddleware.checkUserAuth, updateDeviceCount);
router.put("/devices", authMiddleware.checkUserAuth, updateDeviceCountGlobally);

// router
//   .route("/users")
//   .get(authMiddleware.checkUserAuth, getAllusers)
//   .patch(authMiddleware.checkUserAuth, updateUserStatus)
//   .post(authMiddleware.checkUserAuth, manageUser);

router.get("/congrats-box", [authMiddleware.checkUserAuth], getCongrats);
router.post("/congrats-box", [authMiddleware.checkUserAuth], uploadCongratsBox.single("file"), addCongrats);
router.put("/congrats-box/:id", [authMiddleware.checkUserAuth], uploadCongratsBox.single("file"), updateCongrats);
router.delete("/congrats-box/:id", [authMiddleware.checkUserAuth], deleteCongrats);

router.post("/main_banner", [authMiddleware.checkUserAuth], uploadBannerVideo.single("file"), addMainBanner);
router.get("/main_banner", [authMiddleware.checkUserAuth], getAllMainBanner);
router.put("/main_banner/:id", [authMiddleware.checkUserAuth], uploadBannerVideo.single("file"), updateMainBanner);
router.delete("/main_banner/:id", [authMiddleware.checkUserAuth], deleteMainBanner);
router.get("/main_banner/:id", [authMiddleware.checkUserAuth], getMainBannerById);

router.get("/orders/:filter?/:status?", [authMiddleware.checkUserAuth], getAllOrders);
router.patch("/orders/:courseId", [authMiddleware.checkUserAuth], updateOrderSubscription);

router.post("/category", [authMiddleware.checkUserAuth], categoryController.addCategory);
router.get("/category", [authMiddleware.checkUserAuth], categoryController.getAllCategories);
router.put("/category/:id", [authMiddleware.checkUserAuth], categoryController.updateCategory);
router.delete("/category/:id", [authMiddleware.checkUserAuth], categoryController.deleteCategory);

router.route("/footer").post(authMiddleware.checkUserAuth, addFooter).get(authMiddleware.checkUserAuth, getAllFooters);

router
  .route("/footer/:id")
  .put(authMiddleware.checkUserAuth, updateFooter)
  .patch(authMiddleware.checkUserAuth, updateFooter)
  .delete(authMiddleware.checkUserAuth, deleteFooter);

router.post("/currency", [authMiddleware.checkUserAuth], addCurrency);
router.get("/currency", [authMiddleware.checkUserAuth], getAllCurrencies);
router.put("/currency/:id", [authMiddleware.checkUserAuth], updateCurrency);
router.patch("/currency/:id", [authMiddleware.checkUserAuth], updateCurrency);
router.delete("/currency/:id", [authMiddleware.checkUserAuth], deleteCurrency);

router.post("/course", authMiddleware.checkUserAuth, courseFileUpload, courseController.addCourse);
router.get("/course/:filter?/:status?", authMiddleware.checkUserAuth, courseController.getAllCourses);
router.put("/course/:id", [authMiddleware.checkUserAuth], courseFileUpload, courseController.updateCourse);
router.patch("/course/:id", [authMiddleware.checkUserAuth], courseController.updateCampEnrollments);
router.delete("/course/:id/:checked", [authMiddleware.checkUserAuth], courseController.deleteCourse);

router.delete("/courseMedia/:filename/:type/:id", [authMiddleware.checkUserAuth], courseController.deleteMedia);

router.post("/subcourse", [authMiddleware.checkUserAuth], subCourseController.addSubCourse);
router.get("/subcourse", [authMiddleware.checkUserAuth], subCourseController.getAllSubCourses);
router.put("/subcourse/:id", [authMiddleware.checkUserAuth], subCourseController.updateSubCourse);
router.delete("/subcourse/:id", [authMiddleware.checkUserAuth], subCourseController.deleteSubCourse);

router.get("/news-image", newsController.getNewsCvrImage);
router.post("/news-image", uploadNwsBnrImage.single("file"), newsController.addNewsCvrImage);
router.put("/news-image/:id", uploadNwsBnrImage.single("file"), newsController.updateNewsCvrImage);
router.delete("/news-image/:id", newsController.deleteNewsCvrImage);

router.post("/news", [authMiddleware.checkUserAuth], newsFileUpload, newsController.addNews);
router.get("/news", [authMiddleware.checkUserAuth], newsController.getAllNews);
router.put("/news/:id", [authMiddleware.checkUserAuth], newsFileUpload, newsController.updateNews);

router.delete("/newsImage", [authMiddleware.checkUserAuth], newsController.deleteNewsImage);

router.delete("/news/:id", [authMiddleware.checkUserAuth], newsController.deleteNews);
router.get("/news/:id", [authMiddleware.checkUserAuth], newsController.getNewsById);

router.post("/who_are_we_data", [authMiddleware.checkUserAuth], uploadWhoVideo.single("file"), whoAreWeDataController.addWhoAreWeData);
router.get("/who_are_we_data", [authMiddleware.checkUserAuth], whoAreWeDataController.getAllWhoAreWeData);
router.put("/who_are_we_data/:id", [authMiddleware.checkUserAuth], uploadWhoVideo.single("file"), whoAreWeDataController.updateWhoAreWeData);
router.delete("/who_are_we_data/:id", [authMiddleware.checkUserAuth], whoAreWeDataController.deleteWhoAreWeData);
router.get("/who_are_we_data/:id", [authMiddleware.checkUserAuth], whoAreWeDataController.getAllWhoAreWeData);

router.post("/faq", [authMiddleware.checkUserAuth], faqController.addFAQ);
router.get("/faq", [authMiddleware.checkUserAuth], faqController.getAllFAQs);
router.put("/faq/:id", [authMiddleware.checkUserAuth], faqController.updateFAQ);
router.delete("/faq/:id", [authMiddleware.checkUserAuth], faqController.deleteFAQ);
router.post("/testimonial", [authMiddleware.checkUserAuth], testimonialController.addTestimonial);
router.get("/testimonial", [authMiddleware.checkUserAuth], testimonialController.getAllTestimonials);
router.put("/testimonial/:id", [authMiddleware.checkUserAuth], testimonialController.updateTestimonial);
router.delete("/testimonial/:id", [authMiddleware.checkUserAuth], testimonialController.deleteTestimonial);

router.post("/banner", [authMiddleware.checkUserAuth], uploadImage.any(), bannerController.uploadBanner);
router.put("/banner/:id", [authMiddleware.checkUserAuth], uploadImage.any(), bannerController.updateBanner);
router.get("/banner", [authMiddleware.checkUserAuth], bannerController.getAllBanners);
router.delete("/banner/:id", [authMiddleware.checkUserAuth], bannerController.deleteBanner);

router.delete("/bannerImage", [authMiddleware.checkUserAuth], bannerController.deleteBannerImage);

router.get("/terms", [authMiddleware.checkUserAuth], termsController.getTermsAndConditions);
router.post("/terms", [authMiddleware.checkUserAuth], termsController.addTermsAndConditions);
router.put("/terms/:id", [authMiddleware.checkUserAuth], termsController.updateTermsAndConditions);
router.delete("/terms/:id", [authMiddleware.checkUserAuth], termsController.deleteTermsAndConditions);

router.post("/influencer", addInfluencer);
router.get("/influencer", getInfluencers);
router.put("/influencer/:id", updateInfluencer);
router.patch("/influencer/:id", updateInfluencerStatus);
router.delete("/influencer/:id", deleteInfluencer);
router.get("/influencer_orders/:influencer?/:from?/:to?", getOrdersInflucencers);

router.post("/video", [authMiddleware.checkUserAuth], uploadStt.single("video"), videoUploadController.addVideo);
router.get("/video", [authMiddleware.checkUserAuth], uploadStt.single("video"), videoUploadController.getAllVideos);
router.put("/video/:id", [authMiddleware.checkUserAuth], uploadStt.single("video"), videoUploadController.updateVideo);
router.delete("/video/:id", [authMiddleware.checkUserAuth], uploadStt.single("video"), videoUploadController.deleteVideo);

router.get("/dashboard_details", [authMiddleware.checkUserAuth], getDashboardDetails);
router.get("/revenue/:filter?/:from?/:to?", [authMiddleware.checkUserAuth], getOrders);

router.get("/revenue_usd/:filter?/:from?/:to?", [authMiddleware.checkUserAuth], getOrdersUsd);

router.post("/uploadVideo", [authMiddleware.checkUserAuth], uploadStt.single("video"), (req, res) => {
  res.status(200).send({ message: "saved successfully" });
});

router.get("/enquiries", [authMiddleware.checkUserAuth], getAllEnquiries);
router.delete("/enquiries/:id", [authMiddleware.checkUserAuth], deleteEnquiry);

router.get("/subscriptions", [authMiddleware.checkUserAuth], getAllSubscriptions);
router.delete("/subscriptions/:id", [authMiddleware.checkUserAuth], deleteSubscription);

router.post("/login", dashController.login);
router.post("/signup", [authMiddleware.checkAuthDasboard], dashController.signup);

router.post("/send_mail", dashController.sendMail);

module.exports = router;

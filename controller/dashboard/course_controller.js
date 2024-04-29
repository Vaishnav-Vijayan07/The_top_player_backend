const db = require("../../models");

// Create a new course

exports.addCourse = async (req, res, next) => {
  try {
    let imageUrl;
    let bannerUrl;
    let videoUrl;

    // Check and handle uploaded files (image, banner, video)
    if (req.files) {
      imageUrl = req.files.image ? req.files.image[0].path : null; // Get image URL if uploaded
      bannerUrl = req.files.banner ? req.files.banner[0].path : null; // Get banner URL if uploaded
      videoUrl = req.files.video ? req.files.video[0].path : null; // Get video URL if uploaded
    }

    // Create course with uploaded file URLs (or null if not uploaded)
    const course = await db.course.create({
      name: req.body.name,
      name_arabic: req.body.name_arabic,
      categoryId: req.body.categoryId,
      amount: req.body.amount,
      offerAmount: req.body.offerAmount,
      description: req.body.description,
      description_ar: req.body.description_ar,
      enroll_text: req.body.enroll_text,
      enroll_text_ar: req.body.enroll_text_ar,
      imageUrl,
      bannerUrl,
      videoUrl,
    });
    console.log(`A course added successfully`);
    res.status(200).send({ message: "Course added successfully", course });
  } catch (error) {
    console.error(`Error in adding course: ${error.toString()}`);
    res.status(500).send({ message: error.toString() });
  }
};

exports.getAllCourses = async (req, res, next) => {
  db.course
    .findAll({
      include: {
        model: db.category, // Include the Category model
        attributes: ["name"], // Only retrieve the 'name' attribute from the Category model
      },
      attributes: [
        "id",
        "name",
        "amount",
        "description",
        "categoryId",
        "description_ar",
        "name_arabic",
        "imageUrl",
        "offerAmount",
      ], // Include the necessary attributes from the Course model
    })
    .then((courses) => {
      console.log(`Retrieved all courses successfully`);

      // Manipulating the response to have category_name instead of category object
      const modifiedCourses = courses?.map((course) => {
        // Splitting the description into checklist items
        const checklistItems = course?.description?.split("\n");
        // Generating HTML markup for the checklist
        const checklistHTML = checklistItems?.map((item) => `<li><p>${item}</p></li>`).join("");

        const offerPercentage = Math.round(((course.amount - course.offerAmount) / course.amount) * 100);

        const checklistItems2 = course?.description_ar?.split("\n");
        // Generating HTML markup for the checklist
        const checklistHTML2 = checklistItems2?.map((item) => `<li><p>${item}</p></li>`).join("");

        return {
          ...course.toJSON(),
          category_name: course.category ? course.category?.name : null,
          descriptionHTML: checklistHTML ? `${checklistHTML}` : null, // Wrap checklist items in <ul> element
          descriptionHTMLAr: checklistHTML2 ? `${checklistHTML2}` : null, // Wrap checklist items in <ul> element
          description: course?.description || null,
          description_ar: course?.description_ar || null,
          offerPercentage,
        };
      });

      // Remove the nested category object and original description field
      modifiedCourses.forEach((course) => {
        delete course.category;
      });

      res.status(200).json({ courses: modifiedCourses });
    })
    .catch((err) => {
      console.error(`Error in retrieving courses: ${err.toString()}`);
      res.status(500).send({ message: err.toString() });
    });
};

// Retrieve a single course by ID
exports.getCourseById = (req, res, next) => {
  const courseId = req.params.id;
  db.course
    .findByPk(courseId)
    .then((course) => {
      if (!course) {
        return res.status(404).send({ message: "Course not found" });
      }
      console.log(`Retrieved course with ID ${courseId} successfully`);
      res.status(200).send({ course });
    })
    .catch((err) => {
      console.error(`Error in retrieving course: ${err.toString()}`);
      res.status(500).send({ message: err.toString() });
    });
};

exports.updateCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id; // Get course ID from request params
    console.log("courseId=====>", courseId);
    console.log("body", req.body);
    console.log("files", req.files);

    let imageUrl;
    let bannerUrl;
    let videoUrl;

    // Check and handle uploaded files (image, banner, video)
    try {
      if (req.files) {
        imageUrl = req.files.image ? req.files.image[0].path : null; // Get image URL if uploaded
        bannerUrl = req.files.banner ? req.files.banner[0].path : null; // Get banner URL if uploaded
        videoUrl = req.files.video ? req.files.video[0].path : null; // Get video URL if uploaded
      }
    } catch (error) {
      console.error(`Error handling uploaded files: ${error.toString()}`);
      // Handle specific file upload errors here (e.g., wrong format, size limit exceeded)
      return res.status(400).send({ message: "Error handling uploaded files" });
    }

    // Find course by ID
    const course = await db.course.findByPk(courseId);

    // Update course object with uploaded file URLs (or null if not uploaded)
    const updatedCourse = {
      name: req.body.name || course.name,
      name_arabic: req.body.name_arabic || course.name_arabic,
      categoryId: req.body.categoryId || course.categoryId,
      amount: req.body.amount || course.amount,
      offerAmount: req.body.offerAmount || course.offerAmount,
      description: req.body.description || course.description,
      description_ar: req.body.description_ar || course.description_ar,
      enroll_text: req.body.enroll_text || course.enroll_text,
      enroll_text_ar: req.body.enroll_text_ar | course.enroll_text_ar,
      imageUrl: imageUrl || course.imageUrl,
      bannerUrl: bannerUrl || course.bannerUrl,
      videoUrl: videoUrl || course.videoUrl,
    };

    if (!course) {
      // Handle case where course not found
      return res.status(404).send({ message: "Course not found" });
    }

    // Update course data
    await course.update(updatedCourse);

    console.log(`Course with ID ${courseId} updated successfully`);
    res.status(200).send({ message: "Course updated successfully", course });
  } catch (error) {
    console.error(`Error in updating course: ${error.toString()}`);
    res.status(500).send({ message: "Internal server error" }); // Avoid exposing specific error details
  }
};

// Delete a course
exports.deleteCourse = (req, res, next) => {
  const courseId = req.params.id;
  db.course
    .findByPk(courseId)
    .then((course) => {
      if (!course) {
        return res.status(404).send({ message: "Course not found" });
      }
      return course.destroy();
    })
    .then(() => {
      console.log(`Course with ID ${courseId} deleted successfully`);
      res.status(200).send({ message: "Course deleted successfully" });
    })
    .catch((err) => {
      console.error(`Error in deleting course: ${err.toString()}`);
      res.status(500).send({ message: err.toString() });
    });
};

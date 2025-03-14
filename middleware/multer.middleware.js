const multer = require("multer");

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5_000_000 },
  fileFilter: (req, file, cb) => {
    const fileWhitelist = ["image/png", "image/jpeg", "image/jpg"];

    if (!fileWhitelist.includes(file.mimetype)) {
      return cb(
        new Error("Not an image, only image files are allowed!", false)
      );
    }
    cb(null, true);
  },
});

module.exports = {
  uploadImage,
};

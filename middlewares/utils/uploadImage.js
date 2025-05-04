const multer = require("multer");
const { mkdirp } = require("mkdirp");
let errorMessage = '';
const uploadImg = (type) => {
  const path = `./${type}`;
  mkdirp.sync(path);
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (!allowedTypes.includes(file.mimetype)) {
          errorMessage = 'File type is not supported';
          return cb(null, false);
        }
        cb(null, true);
    },
  });
  return upload;
};

module.exports = {
  uploadImg,
};
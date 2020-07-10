const multerS3 = require("multer-s3-v2");
const multer = require("multer");
const aws = require("aws-sdk");
const sharp = require("sharp");

//API keys are volatile.
//S3 Innit
const keyID = "ASIA3V5NZNWSJF3C65ZG";
const SECRET = "8x/GCn03APINuz2J+i3kfW/AONbX5nGmbmEZG7UQ";
const s3 = new aws.S3({
  accessKeyId: keyID,
  secretAccessKey: SECRET,
  region: "us-east-1",
});

//S3 upload method
var uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: "fsdf-images",
    acl: "public-read",
    transforms: {
      productImage: () =>
        sharp().resize(250, 250).max().withoutEnlargement().webp({
          progressive: true,
          quality: 80,
        }),
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
  limits: {
    fileSize: 2000000,
  },
}).single("productImage"); //Same fieldname as input html

//Obselete code, keeping for future reference
module.exports = uploadS3;

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const crypto = require("crypto");
const sharp = require("sharp");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// AWS S3 configuration
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});

/*
 * Sends a file to an S3 bucket.
 * @param {Object} file - The file to send to the S3 bucket.
 */

async function sendFileToS3(file) {
  //resize image
  const buffer = file.buffer;

  //send media to s3

  const uploadParams = {
    Bucket: bucketName,
    Key: randomImageName() + "." + file.mimetype.split("/")[1],
    Body: buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(uploadParams);
  try {
    await s3.send(command);
    return uploadParams.Key;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/*
 * Retrieves a file from an S3 bucket.
 * @param {String} imageKey - The key of the image to retrieve from the S3 bucket.
 */

async function getFilesFromS3(imageKey) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: imageKey,
    });
    const url = await getSignedUrl(s3, command, {
      //1 day
      expiresIn: 60 * 60 * 24,
    });
    return url;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

module.exports = { s3, sendFileToS3, getFilesFromS3, multer, upload, storage };

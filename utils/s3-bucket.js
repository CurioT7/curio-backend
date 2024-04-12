const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const crypto = require("crypto");
const sharp = require("sharp");

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

async function sendFileToS3(req, res) {
  //resize image
  const buffer = await sharp(req.file.buffer)
    .resize({ height: 400, width: 400, fit: "contain" })
    .toBuffer();

  //send media to s3
  const file = req.file;
  const uploadParams = {
    Bucket: bucketName,
    Key: randomImageName(),
    Body: buffer,
    CibtebtType: file.mimetype,
  };
  const command = new PutObjectCommand(uploadParams);
  try {
    const data = await s3.send(command);
    console.log("Successfully uploaded file to S3", data);
    return uploadParams.Key;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

module.exports = { s3, sendFileToS3 };

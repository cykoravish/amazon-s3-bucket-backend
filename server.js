import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import { ProductModel } from "./product-model.js";
import { connectToDB } from "./db.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 2000;

/**
 * Initalise the database
 */
await connectToDB();

/**
 * initialize s3 client
 */
const client = new S3Client({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const createPresignedUrlWithClient = ({ bucket, key }) => {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

app.post("/api/get-presigned-url", async (req, res) => {
  const { mime } = req.body;
  const filename = uuidv4();
  const finalName = `${filename}.${mime}`;
  //get the pre signed url from s3
  const url = await createPresignedUrlWithClient({
    bucket: process.env.S3_BUCKET_NAME,
    key: finalName,
  });

  res.json({ url, finalName });
});

app.post("/api/products", async (req, res) => {
  const { name, description, price, filename } = req.body;
  if (!name || !description || !price || !filename) {
    return res
      .status(404)
      .json({ success: false, message: "provide all fields" });
  }
  const product = await ProductModel.create({
    name,
    description,
    price,
    filename,
  });

  return res
    .status(200)
    .json({ success: true, message: "product added successfully" });
});

app.get("/api/products", async (req, res) => {
  const products = await ProductModel.find();
  res.json(products);
});

app.get("/", (req, res) => {
  return res.status(200).send("hello world");
});

app.listen(PORT, () => {
  console.log(`app is running on http://localhost:${PORT}`);
});

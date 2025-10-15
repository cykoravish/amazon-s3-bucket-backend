# s3-backend (Product Showcase - Backend API)

Backend API for the Product Showcase application, handling product management and S3 image uploads with presigned URLs.

## Features

- **Product CRUD**: Create, read, update, and delete products
- **S3 Integration**: Generate presigned URLs for secure image uploads
- **MongoDB**: Store product metadata
- **CORS Enabled**: Allow frontend requests
- **RESTful API**: Clean and organized endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Cloud Storage**: Amazon S3
- **CDN**: Amazon CloudFront

## API Endpoints

### Products

#### Get All Products
\`\`\`http
GET /api/products
\`\`\`

**Response:**
\`\`\`json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "filename": "unique-filename.jpg"
  }
]
\`\`\`

#### Create Product
\`\`\`http
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "filename": "unique-filename.jpg"
}
\`\`\`

### Image Upload

#### Get Presigned URL
\`\`\`http
POST /api/get-presigned-url
Content-Type: application/json

{
  "mime": "jpeg"
}
\`\`\`

**Response:**
\`\`\`json
{
  "url": "https://bucket.s3.amazonaws.com/...",
  "finalName": "unique-filename.jpg"
}
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud)
- AWS Account with S3 bucket and CloudFront distribution
- AWS IAM credentials with S3 permissions

### Installation

1. Create a new directory for the backend:
\`\`\`bash
mkdir product-showcase-backend
cd product-showcase-backend
\`\`\`

2. Initialize npm and install dependencies:
\`\`\`bash
npm init -y
npm install express mongoose cors dotenv aws-sdk uuid
\`\`\`

3. Create a `.env` file:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/products
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
CLOUDFRONT_URL=https://your-distribution.cloudfront.net
\`\`\`

4. Create the server (example structure):

\`\`\`javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI);

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  filename: String
});

const Product = mongoose.model('Product', productSchema);

// S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Routes
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

app.post('/api/get-presigned-url', async (req, res) => {
  const { mime } = req.body;
  const filename = `${Date.now()}-${Math.random()}.${mime}`;
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
    Expires: 60,
    ContentType: `image/${mime}`
  };
  
  const url = s3.getSignedUrl('putObject', params);
  res.json({ url, finalName: filename });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
\`\`\`

5. Run the server:
\`\`\`bash
node server.js
\`\`\`

## AWS Setup

### S3 Bucket Configuration

1. Create an S3 bucket in AWS Console
2. Enable public read access for objects
3. Configure CORS:

\`\`\`json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
\`\`\`

### CloudFront Distribution

1. Create a CloudFront distribution
2. Set S3 bucket as origin
3. Configure caching behavior
4. Copy the distribution domain name

### IAM Permissions

Ensure your IAM user has these permissions:
- `s3:PutObject`
- `s3:GetObject`
- `s3:PutObjectAcl`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/products` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `S3_BUCKET_NAME` | S3 bucket name | `my-product-images` |
| `CLOUDFRONT_URL` | CloudFront URL | `https://d1234.cloudfront.net` |

## Deployment

### Deploy to Railway/Render/Heroku

1. Push code to GitHub
2. Connect repository to hosting platform
3. Add environment variables
4. Deploy

## Security Considerations

- Use presigned URLs with short expiration times
- Validate file types and sizes
- Implement rate limiting
- Use environment variables for sensitive data
- Enable HTTPS only
- Implement authentication for product creation

## License

MIT License


To install dependencies:

```bash
bun install
```

To run:

```bash
bun run server.js
```

This project was created using `bun init` in bun v1.1.10. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

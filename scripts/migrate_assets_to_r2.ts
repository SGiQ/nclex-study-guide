
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';

dotenv.config({ path: '.env.local' });

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';

async function uploadDir(localDir: string, r2Prefix: string) {
  if (!fs.existsSync(localDir)) {
    console.log(`Directory ${localDir} not found, skipping.`);
    return;
  }

  const files = fs.readdirSync(localDir);
  for (const file of files) {
    const filePath = path.join(localDir, file);
    if (fs.statSync(filePath).isDirectory()) {
      await uploadDir(filePath, `${r2Prefix}${file}/`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath);
    const contentType = mime.lookup(file) || 'application/octet-stream';
    const key = `${r2Prefix}${file}`;

    console.log(`Uploading ${file} to ${key}...`);

    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: fileContent,
          ContentType: contentType,
        })
      );
      console.log(`Successfully uploaded ${file}`);
    } catch (err) {
      console.error(`Failed to upload ${file}:`, err);
    }
  }
}

async function run() {
  console.log('Starting migration to R2...');
  
  // 1. Upload Mind Maps
  await uploadDir('public/uploads/mindmaps', 'uploads/mindmaps/');
  
  // 2. Upload Infographics
  await uploadDir('public/uploads/infographics', 'uploads/infographics/');
  
  // 3. Upload Slides
  await uploadDir('public/uploads/slides', 'uploads/slides/');

  console.log('\nMigration to R2 Complete!');
}

run();

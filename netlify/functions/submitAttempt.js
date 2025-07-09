
const Airtable = require('airtable');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const form = new formidable.IncomingForm({ multiples: false, keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(event, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return resolve({ statusCode: 400, body: JSON.stringify({ message: 'Invalid form data' }) });
      }

      try {
        let fileUrl = '';
        if (files.file && files.file.filepath) {
          const result = await cloudinary.uploader.upload(files.file.filepath, {
            folder: 'mathacks_uploads'
          });
          fileUrl = result.secure_url;
        }

        await base('Submissions').create({
          Title: fields.title,
          Description: fields.description,
          Field: fields.field,
          File: fileUrl,
          Status: 'pending'
        });

        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: 'Submission received' })
        });
      } catch (error) {
        console.error('Submission error:', error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ message: 'Internal server error' })
        });
      }
    });
  });
};

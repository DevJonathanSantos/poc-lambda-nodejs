"use strict";

const AWS = require("aws-sdk");
const { basename, extname } = require("path");

const S3 = new AWS.S3();

module.exports.handle = async ({ Records: records }, context) => {
  try {
    await Promise.all(
      records.map(async (record) => {
        const { key } = record.s3.object;

        const image = await S3.getObject({
          Bucket: process.env.bucket,
          Key: key,
        }).promise();

        await S3.putObject({
          Body: image.Body,
          Bucket: process.env.bucket,
          ContentType: "image/jpeg",
          Key: `compressed/${basename(key, extname(key))}.jpg`,
        }).promise();
      })
    );

    return {
      statusCode: 301,
      body: { ok: true },
    };
  } catch (err) {
    console.log(err);

    return err;
  }
};

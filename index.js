const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.s3();

exports.handler = async (event, context, done) => {
    const Bucket = event.Records[0].s3.bucket.name;
    const Key = event.Records[0].s3.object.key;

    const filename = Key.split("/")[Key.split("/").length - 1]; // comment/filename
    const ext = Key.split(".")[Key.split(".").length - 1];
    const format = ext === "jpg" ? "jpeg" : ext;

    console.log("람다에서 실행됩니다.");
    console.log(filename);
    console.log(ext);

    try {
        // 이미지 버퍼 형식
        const s3Object = await s3.getObject({ Bucket, Key }).promise();

        console.log(s3Object.Body);

        // 리사이징 옵션
        const resized = await sharp(s3Object.Body)
            .resize(600, 600, { fit: "inside" })
            .toFormat(format)
            .toBuffer();

        // 완료 이미지 저장
        await s3.putObject(
            {
                Bucket,
                Key: `comment-resizing/${filename}`,
                Body: resized,
            }
        ).promise();

        console.log("success");

        return done(null, `comment-resizing/${filename}`);
    } catch (err) {
        console.log("람다 에러");
        console.log(err);
        done(err);
    }
};
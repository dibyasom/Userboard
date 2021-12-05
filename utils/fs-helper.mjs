import path from "path";
import fs from "fs";

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg"];
export const fsHelper = (emailHash, _dirname, req, success_res, failed_res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(
    _dirname,
    `./public/assets/img/${emailHash}.png`
  );
  if (
    ALLOWED_EXTENSIONS.includes(
      path.extname(req.file.originalname).toLowerCase()
    )
  ) {
    fs.rename(tempPath, targetPath, (err) => {
      if (err) failed_res(`Oops! Something went wrong! ${err}`, 500);
      //   Pass msg.
      success_res();
    });
  } else {
    fs.unlink(tempPath, (err) => {
      if (err) failed_res(`Oops! Something went wrong! ${err}`, 500);

      failed_res(`Only .png files allowed! ${err}`, 403);
    });
  }
};

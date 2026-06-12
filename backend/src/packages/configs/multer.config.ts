import multer from "multer";
import { diskStorage } from "multer";
import { extname,join } from "path";
import * as fs from "fs";

import { GeneralUtilities } from "../utilities/general.utility";

export const multerConfig = {

  storage: diskStorage({
    
    destination: "./temp-Upload",
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      // console.log("file in multer ",file)

      cb(null, `file-${uniqueName}${ext}`);
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  }
};





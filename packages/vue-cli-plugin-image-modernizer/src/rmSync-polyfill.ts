import fs from "fs";

if (!fs.rmSync) {
  const rimraf = require("rimraf");
  fs.rmSync = (path: fs.PathLike) => {
    return rimraf.sync(path);
  };
}

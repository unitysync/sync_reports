import { readFileSync, writeFileSync } from "fs";
const version = process.env.TGT_RELEASE_VERSION;
const newVersion = version.replace("v", "");
const manifestFile = readFileSync("src/fxmanifest.lua", { encoding: "utf8" });
const newFileContent = manifestFile.replace(
  /\bversion\s+(.*)$/gm,
  `version '${newVersion}'`
);

writeFileSync("src/fxmanifest.lua", newFileContent);

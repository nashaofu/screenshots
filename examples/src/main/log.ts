import fs from "fs";
import path from "path";

const expireDay = 10;

export async function clearLog(dir: string) {
  let files = fs.readdirSync(dir);
  
  for (const file of files) {
    let fullPath = path.join(dir, file);
    let stat = fs.statSync(fullPath);

    const { mtimeMs } = stat;

    if (!isExpires(mtimeMs, expireDay)) {
      continue;
    }

    await rmFileAsync(fullPath)

  }
}

/**
 *
 * @param mTime 文件最近修改时间戳
 * @param expires 文件过期时间
 * @returns
 */
function isExpires(mTime: number, expires: number) {
  const cur = Date.now();
  return cur - mTime > expires * 60 * 60 * 24 * 1000;
}

async function rmFileAsync(path: string) {
  return new Promise((resolve, reject) => {
    fs.rm(path, { recursive: true }, (err) => {
      if (err) {
        console.error("rmDirAsync", err);
        reject(err)
      } else {
        resolve(void(0));
      }
    });
  });
}



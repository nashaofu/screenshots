import checkDiskSpace from "check-disk-space";
/**
 * 
  1 bytes = 1.0 × 10-9 gb
  1 bytes = 1.0 × 10-6 兆字节
 */

function bytes2mb(bytes: number) {
  return Math.floor(bytes * Math.pow(10, -6));
}

function bytes2gb(bytes: number) {
  return Math.floor(bytes * Math.pow(10, -9));
}

export function getDiskDetail(path: string) {
  return checkDiskSpace(path).then((diskSpace) => {
    console.log(diskSpace);

    const { diskPath, free, size } = diskSpace;

    const data = {
      diskPath,
      free: {
        bytes: free,
        mb: bytes2mb(free),
        gb: bytes2gb(free),
      },

      size: {
        bytes: size,
        mb: bytes2mb(size),
        gb: bytes2gb(size),
      },
    };

    // {
    //     diskPath: 'C:',
    //     free: 12345678, bytes
    //     size: 98756432
    // }
    // Note: `free` and `size` are in bytes
    return data;
  });
}

import { useState, useEffect } from "react";
import yayJpg from "../assets/yay.jpg";
import { ipcRenderer } from "electron";

export default function HomePage() {
  const [logPath, setLogPath] = useState("");
  const [diskDetail, setDiskDetail] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  function handleScreenShot(e: any, data: any) {
    console.log("handleScreenShot", data.url);
    setImgUrl(data.url);
  }

  useEffect(() => {
    window.$api.handleScreenShot(handleScreenShot);
    return () => {
      window.$api.rmHandleScreenShot(handleScreenShot);
    };
  }, []);

  return (
    <div>
      <div style={{
        width: '200px',
        height: '200px',
        border: "2px solid pink",
        padding: '10px',
        background: '#9b93931f'
      }}>
      {imgUrl ? <img src={imgUrl} alt="截图图片" style={{width: '100%'}} /> : null}
      </div>

      <button
        onClick={async () => {
          await window.$api.screenshot();
        }}
      >
        screenshot
      </button>

      <button
        onClick={async () => {
          await window.$api.logInfo();
        }}
      >
        log Info
      </button>

      <button
        onClick={async () => {
          await window.$api.logError();
        }}
      >
        log Error
      </button>

      <button
        onClick={async () => {
          const path = await window.$api.showLog();
          setLogPath(path);
        }}
      >
        Path
      </button>

      <button
        onClick={async () => {
          await window.$api.clearLog();
        }}
      >
        Clear
      </button>

      <button
        onClick={async () => {
          const data = await window.$api.diskDetail();
          setDiskDetail(data);
        }}
      >
        Disk Detail
      </button>
      <p>logPath: {logPath}</p>
      <p>disk: {JSON.stringify(diskDetail)}</p>
    </div>
  );
}

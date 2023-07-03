import { useState } from "react";
import yayJpg from "../assets/yay.jpg";

export default function HomePage() {
  const [logPath, setLogPath] = useState("");
  const [diskDetail, setDiskDetail] = useState('');

  return (
    <div>
      <h2>Yay! Welcome to umi with electron!</h2>
      <p>
        <img src={yayJpg} width="388" />
      </p>
      <p>
        To get started, edit <code>pages/index.tsx</code> and save to reload.
      </p>
      <button
        onClick={async () => {
          window.alert(await window.$api.getPlatform());
          window.alert("edit src/main/ipc/platform.ts and try me again!");
        }}
      >
        what is my platform?
      </button>

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
          setDiskDetail(data)
        }}
      >
        Disk Detail
      </button>
      <p>logPath: {logPath}</p>
      <p>disk: {JSON.stringify(diskDetail)}</p>
    </div>
  );
}

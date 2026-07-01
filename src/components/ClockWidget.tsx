"use client";

import { useState, useEffect } from "react";

export default function ClockWidget() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Chennai is IST (UTC+5:30)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setTime(now.toLocaleTimeString("en-US", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="text-sm font-mono uppercase tracking-widest text-darkbrown/60">Loading time...</div>;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-mono uppercase tracking-widest text-darkbrown/60">
        Local Time
      </span>
      <span className="text-sm font-sans font-medium text-darkbrown">
        Chennai, India — {time}
      </span>
    </div>
  );
}

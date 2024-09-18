import { createImage } from "@/lib/helper";
import { MousePointer2 } from "lucide-react";

export default function Cursor({ color, x, y, message, profile }) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-[100000]"
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    >
      <MousePointer2 className={" stroke-none fill-primary-01"} />
      <div className="absolute top-full left-1/2 flex items-center gap-2">
        <div className="w-12 h-12 bg-white shadow-md rounded-full relative">
          <img
            src={createImage(profile.avatar, 100)}
            alt="avatar"
            className="w-full h-full object-cover rounded-full animate-rotate"
          />
          <div className="absolute top-full left-0 whitespace-nowrap mt-2 bg-white shadow-xl rounded-md px-2 py-0.5">
            {profile.name}
          </div>
        </div>

        {message && (
          <div className="rounded-3xl px-4 py-2" style={{ backgroundColor: color, borderRadius: 20 }}>
            <p className="whitespace-nowrap text-sm leading-relaxed text-white">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

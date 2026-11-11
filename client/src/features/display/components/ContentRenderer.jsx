import { useState } from "react";
import { ImageOff, Globe } from "lucide-react";

export default function ContentRenderer({ content }) {
  const [failed, setFailed] = useState(false);

  if (!content) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-white/60">
        <Globe size={56} />
        <p>Waiting for content from admin...</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <ImageOff size={48} />
        <p>Unable to display this content.</p>
      </div>
    );
  }

  switch (content.type) {
    case "image":
      return (
        <img
          src={content.payload}
          alt={content.title}
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      );

    case "video":
      return (
        <video
          src={content.payload}
          className="h-full w-full object-contain"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setFailed(true)}
        />
      );

    case "url":
      return (
        <iframe
          src={content.payload}
          title={content.title}
          className="h-full w-full border-0 bg-white"
          sandbox="allow-scripts allow-forms"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      );

    default:
      return <p>Unsupported content type.</p>;
  }
}

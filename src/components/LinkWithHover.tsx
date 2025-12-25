import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface LinkWithHoverProps {
  url: string;
  title: string;
  description?: string;
  height?: string;
}

/**
 * Gets the favicon URL for a given URL
 */
function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Try the origin's favicon first
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    // Fallback to Google's favicon service
    try {
      const domain = url.replace(/^https?:\/\//, "").split("/")[0];
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      // Ultimate fallback
      return "https://www.google.com/s2/favicons?domain=example.com&sz=64";
    }
  }
}

export const LinkWithHover: React.FC<LinkWithHoverProps> = ({
  url,
  title,
  description = "Click to open link",
  height,
}) => {
  const faviconUrl = getFaviconUrl(url);
  // Default to compact height (fit-content with tight line height)
  const heightStyle = height ? { height } : { height: "fit-content" };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline cursor-pointer w-fit leading-tight m-0 p-0"
          style={heightStyle}
        >
          <img
            src={faviconUrl}
            alt={`${title} favicon`}
            className="w-6 h-6 object-contain"
            onError={(e) => {
              // Fallback to Google's favicon service if the image fails to load
              const target = e.target as HTMLImageElement;
              if (!target.src.includes("google.com/s2/favicons")) {
                try {
                  const urlObj = new URL(url);
                  const domain = urlObj.hostname;
                  target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                } catch {
                  target.src = "https://www.google.com/s2/favicons?domain=example.com&sz=64";
                }
              }
            }}
          />
          <span className="font-bold leading-tight">{title}</span>
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto px-2 py-1">
        <div className="flex items-center gap-1.5">
          <img
            src={faviconUrl}
            alt={`${title} favicon`}
            className="w-5 h-5 object-contain shrink-0"
            onError={(e) => {
              // Fallback to Google's favicon service if the image fails to load
              const target = e.target as HTMLImageElement;
              if (!target.src.includes("google.com/s2/favicons")) {
                try {
                  const urlObj = new URL(url);
                  const domain = urlObj.hostname;
                  target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                } catch {
                  target.src = "https://www.google.com/s2/favicons?domain=example.com&sz=64";
                }
              }
            }}
          />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-bold leading-tight text-sm">{title}</span>
            <span className="text-xs text-muted-foreground leading-tight">{description}</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};


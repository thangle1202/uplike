import fbIcon from "@/components/res/fb_icon.png";
import tiktokIcon from "@/components/res/tiktok_icon.png";
import instagramIcon from "@/components/res/Instagram_icon.png";
import threadsIcon from "@/components/res/threads-app-icon.png";
import youtubeIcon from "@/components/res/youtube.png";

const platformIcons: Record<string, string> = {
  facebook: fbIcon,
  tiktok: tiktokIcon,
  instagram: instagramIcon,
  threads: threadsIcon,
  youtube: youtubeIcon,
};

export function getPlatformIcon(platformId: string): string | undefined {
  return platformIcons[platformId];
}

export function PlatformIcon({
  platformId,
  className = "h-5 w-5 object-contain",
  alt,
}: {
  platformId: string;
  className?: string;
  alt?: string;
}) {
  const src = getPlatformIcon(platformId);
  if (!src) {
    return (
      <span className={className} aria-hidden>
        🌐
      </span>
    );
  }
  return <img src={src} alt={alt ?? platformId} className={className} />;
}

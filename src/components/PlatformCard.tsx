import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Platform } from "@/types/service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const platformIcons: Record<string, string> = {
  facebook: "📘",
  tiktok: "🎵",
  instagram: "📸",
  threads: "🧵",
  youtube: "▶️",
};

interface PlatformCardProps {
  platform: Platform;
}

export function PlatformCard({ platform }: PlatformCardProps) {
  return (
    <Link to={`/platform/${platform.id}`}>
      <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{ backgroundColor: `${platform.color}20` }}
            >
              {platformIcons[platform.id] || "🌐"}
            </div>
            <Badge variant="secondary">{platform.services.length} dịch vụ</Badge>
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {platform.name}
          </CardTitle>
          <CardDescription>{platform.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-primary font-medium">
            Xem dịch vụ
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

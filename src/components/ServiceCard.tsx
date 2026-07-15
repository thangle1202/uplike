import { Service, Platform } from "@/types/service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  platform: Platform;
  onOrder: (service: Service) => void;
}

export function ServiceCard({ service, platform, onOrder }: ServiceCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <Badge style={{ backgroundColor: `${platform.color}30`, color: platform.color }}>
            {platform.name}
          </Badge>
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Giá</span>
            <span className="font-semibold text-primary">
              {formatPrice(service.pricePerUnit)}/{service.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Số lượng</span>
            <span>
              {service.minQuantity.toLocaleString()} – {service.maxQuantity.toLocaleString()}
            </span>
          </div>
          {service.requiresComments && (
            <Badge variant="outline" className="text-xs">
              Yêu cầu danh sách comment
            </Badge>
          )}
        </div>
        <Button onClick={() => onOrder(service)} className="w-full">
          Đặt dịch vụ
        </Button>
      </CardContent>
    </Card>
  );
}

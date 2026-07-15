import { useEffect, useMemo, useState } from "react";
import { Plus, Server, Trash2 } from "lucide-react";
import { Platform, ServiceServer } from "@/types/service";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SelectedService = { platformId: string; serviceId: string };

interface AdminServiceServersPanelProps {
  platforms: Platform[];
  selectedService: SelectedService | null;
  onSelectService: (service: SelectedService) => void;
  onSave: (platformId: string, serviceId: string, servers: ServiceServer[]) => Promise<boolean>;
  saving?: boolean;
}

function emptyServer(index: number): ServiceServer {
  return {
    id: `sv${index + 1}`,
    name: "",
    pricePerUnit: 0,
    status: "active",
    description: "",
  };
}

function cloneServers(servers: ServiceServer[] = []) {
  return servers.map((s) => ({ ...s }));
}

function validateServers(servers: ServiceServer[]): string | null {
  if (servers.length === 0) return "Cần ít nhất một server";

  const ids = new Set<string>();
  for (const server of servers) {
    if (!server.id.trim()) return "Mỗi server cần có ID";
    if (ids.has(server.id.trim())) return `ID trùng lặp: ${server.id}`;
    ids.add(server.id.trim());
    if (!server.name.trim()) return `Server "${server.id}" cần có tên`;
    if (Number.isNaN(server.pricePerUnit) || server.pricePerUnit < 0) {
      return `Server "${server.id}" có giá không hợp lệ`;
    }
    if (!["active", "maintenance"].includes(server.status)) {
      return `Server "${server.id}" có trạng thái không hợp lệ`;
    }
  }
  return null;
}

function toPayload(servers: ServiceServer[]): ServiceServer[] {
  return servers.map((s) => ({
    id: s.id.trim(),
    name: s.name.trim(),
    pricePerUnit: Number(s.pricePerUnit),
    status: s.status,
    description: s.description.trim(),
  }));
}

export function AdminServiceServersPanel({
  platforms,
  selectedService,
  onSelectService,
  onSave,
  saving = false,
}: AdminServiceServersPanelProps) {
  const [draftServers, setDraftServers] = useState<ServiceServer[]>([]);
  const [dirty, setDirty] = useState(false);

  const selectedMeta = useMemo(() => {
    if (!selectedService) return null;
    const platform = platforms.find((p) => p.id === selectedService.platformId);
    const service = platform?.services.find((s) => s.id === selectedService.serviceId);
    if (!platform || !service) return null;
    return { platform, service };
  }, [platforms, selectedService]);

  useEffect(() => {
    if (!selectedMeta) {
      setDraftServers([]);
      setDirty(false);
      return;
    }
    setDraftServers(cloneServers(selectedMeta.service.servers));
    setDirty(false);
  }, [selectedMeta?.platform.id, selectedMeta?.service.id]);

  const updateServer = (index: number, patch: Partial<ServiceServer>) => {
    setDraftServers((prev) =>
      prev.map((server, i) => (i === index ? { ...server, ...patch } : server))
    );
    setDirty(true);
  };

  const addServer = () => {
    setDraftServers((prev) => [...prev, emptyServer(prev.length)]);
    setDirty(true);
  };

  const deleteServer = (index: number) => {
    setDraftServers((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!selectedService) return;
    const error = validateServers(draftServers);
    if (error) {
      window.alert(error);
      return;
    }
    const ok = await onSave(
      selectedService.platformId,
      selectedService.serviceId,
      toPayload(draftServers)
    );
    if (ok) setDirty(false);
  };

  return (
    <div className="grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-base">Dịch vụ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
          {platforms.map((platform) => (
            <div key={platform.id} className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 pt-3 pb-1">
                {platform.name}
              </p>
              {platform.services.map((service) => {
                const active =
                  selectedService?.platformId === platform.id &&
                  selectedService?.serviceId === service.id;
                return (
                  <button
                    key={`${platform.id}-${service.id}`}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all border",
                      active
                        ? "bg-violet-50 border-violet-200 shadow-sm"
                        : "hover:bg-muted/50 border-transparent"
                    )}
                    onClick={() => onSelectService({ platformId: platform.id, serviceId: service.id })}
                  >
                    <p className="font-medium leading-snug">{service.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(service.servers || []).length} server
                    </p>
                  </button>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-violet-600" />
              Quản lý servers
            </CardTitle>
            {selectedMeta ? (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedMeta.platform.name} · {selectedMeta.service.name}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Chọn dịch vụ bên trái</p>
            )}
          </div>
          {selectedMeta && (
            <Button size="sm" variant="outline" onClick={addServer} disabled={saving}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm server
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {!selectedMeta ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              Chọn một dịch vụ để thêm, sửa hoặc xóa server
            </p>
          ) : draftServers.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-muted-foreground">Chưa có server nào</p>
              <Button size="sm" onClick={addServer}>
                <Plus className="h-4 w-4 mr-1" />
                Thêm server đầu tiên
              </Button>
            </div>
          ) : (
            draftServers.map((server, index) => (
              <div
                key={`${server.id}-${index}`}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Server #{index + 1}
                    </span>
                    <Badge
                      className={
                        server.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {server.status === "active" ? "Hoạt động" : "Bảo trì"}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                    onClick={() => deleteServer(index)}
                    disabled={saving}
                    title="Xóa server"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">ID</Label>
                    <Input
                      value={server.id}
                      onChange={(e) => updateServer(index, { id: e.target.value })}
                      placeholder="sv1"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tên server</Label>
                    <Input
                      value={server.name}
                      onChange={(e) => updateServer(index, { name: e.target.value })}
                      placeholder="Server 1: Like VN"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Giá mỗi đơn vị (VND)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={server.pricePerUnit}
                      onChange={(e) =>
                        updateServer(index, { pricePerUnit: parseInt(e.target.value, 10) || 0 })
                      }
                      disabled={saving}
                    />
                    <p className="text-xs text-violet-600 font-medium">
                      {formatPrice(server.pricePerUnit)}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                    <select
                      value={server.status}
                      onChange={(e) =>
                        updateServer(index, {
                          status: e.target.value as ServiceServer["status"],
                        })
                      }
                      disabled={saving}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Mô tả</Label>
                    <Textarea
                      rows={3}
                      value={server.description}
                      onChange={(e) => updateServer(index, { description: e.target.value })}
                      placeholder="Mô tả server, tốc độ, chất lượng..."
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          {selectedMeta && draftServers.length > 0 && (
            <div className="sticky bottom-0 pt-2 pb-1 bg-gradient-to-t from-background via-background to-transparent">
              <Button className="w-full sm:w-auto" onClick={handleSave} disabled={saving || !dirty}>
                {saving ? "Đang lưu..." : dirty ? "Lưu thay đổi" : "Đã lưu"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

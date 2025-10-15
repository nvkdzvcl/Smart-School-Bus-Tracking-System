import React, { useState } from "react";
import { AppLayout } from "../../components/layout/app-layout";
import { PERMISSIONS } from "../../lib/auth/permissions";
import { MapFilters } from "../../components/tracking/map-filters";
import { VehicleList } from "../../components/tracking/vehicle-list";
import { TrackingMap } from "../../components/tracking/tracking-map";
import { VehicleDetailPanel } from "../../components/tracking/vehicle-detail-panel-";
import type { FilterState } from "../../components/tracking/map-filters";

const Tracking: React.FC = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
  const [, setFilters] = useState<FilterState>({});

  return (
    <AppLayout
      title="Bản đồ trực tiếp"
      description="Theo dõi real-time toàn bộ xe (độ trễ ≤ 3 giây)"
      requiredPermission={PERMISSIONS.VIEW_LIVE_TRACKING}
    >
      <div className="space-y-4 h-[calc(100vh-8rem)]">
        <MapFilters onFilterChange={setFilters} />

        <div className="grid gap-4 lg:grid-cols-12 h-[calc(100%-5rem)]">
          <div className="lg:col-span-3">
            <VehicleList
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
            />
          </div>

          <div className="lg:col-span-6">
            <TrackingMap
              selectedVehicleId={selectedVehicleId}
              onVehicleClick={setSelectedVehicleId}
            />
          </div>

          {selectedVehicleId && (
            <div className="lg:col-span-3">
              <VehicleDetailPanel
                vehicleId={selectedVehicleId}
                onClose={() => setSelectedVehicleId(undefined)}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tracking;

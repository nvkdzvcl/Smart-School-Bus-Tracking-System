import React, { useState } from "react";
import { AppLayout } from "../../components/layout/app-layout";
import { PERMISSIONS } from "../../lib/auth/permissions";
import { VehicleStats } from "../../components/vehicles/vehicles-stats";
import { VehicleTable } from "../../components/vehicles/vehicles-table";

const Vehicles: React.FC = () => {
  const [editingVehicleId, setEditingVehicleId] = useState<string | undefined>(undefined);

  return (
    <AppLayout
      title="Xe buýt"
      description="Quản lý đội xe"
      requiredPermission={PERMISSIONS.VIEW_VEHICLES}
    >
      <div className="space-y-6">
        <VehicleStats />
        <VehicleTable
          onEdit={setEditingVehicleId}
          onCreate={() => console.log("Create vehicle")}
        />
        {editingVehicleId && (
          <div>
            <p>Currently editing vehicle ID: {editingVehicleId}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Vehicles;

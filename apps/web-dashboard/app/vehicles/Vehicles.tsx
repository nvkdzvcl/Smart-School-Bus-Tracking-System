import React, { useState } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { PERMISSIONS } from "../../lib/auth/Permissions";
import { VehicleStats } from "../../components/vehicles/VehiclesStats";
import { VehicleTable } from "../../components/vehicles/VehiclesTable";

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

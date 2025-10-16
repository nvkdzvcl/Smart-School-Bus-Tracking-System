import React, { useState } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { PERMISSIONS } from "../../lib/auth/Permissions";
import { DriverStats } from "../../components/drivers/DriverStats";
import { DriverTable } from "../../components/drivers/DriverTable";

const Drivers: React.FC = () => {
  const [, setEditingDriverId] = useState<string | undefined>(undefined);

  return (
    <AppLayout
      title="Tài xế"
      description="Quản lý tài xế"
      requiredPermission={PERMISSIONS.VIEW_DRIVERS}
    >
      <div className="space-y-6">
        <DriverStats />
        <DriverTable
          onEdit={setEditingDriverId}
          onCreate={() => console.log("Create driver")}
        />
      </div>
    </AppLayout>
  );
};

export default Drivers;

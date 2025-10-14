import React from "react";
import { AppLayout } from "../../components/layout/app-layout";
import { PERMISSIONS } from "../../lib/auth/permissions";

const Stops: React.FC = () => {
  return (
    <AppLayout
      title="Điểm dừng & Vùng địa lý"
      description="Quản lý điểm dừng và geofences"
      requiredPermission={PERMISSIONS.VIEW_ROUTES}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">
            Stops & geofences coming next...
          </h3>
        </div>
      </div>
    </AppLayout>
  );
};

export default Stops;

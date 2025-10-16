import React from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { PERMISSIONS } from "../../lib/auth/Permissions";

const Incidents: React.FC = () => {
  return (
    <AppLayout
      title="Sự cố & Cảnh báo"
      description="Quản lý sự cố và cảnh báo"
      requiredPermission={PERMISSIONS.VIEW_INCIDENTS}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">
            Incidents & alerts coming next...
          </h3>
        </div>
      </div>
    </AppLayout>
  );
};

export default Incidents;

import React from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { PERMISSIONS } from "../../lib/auth/Permissions";

const Students: React.FC = () => {
  return (
    <AppLayout
      title="Học sinh & Phụ huynh"
      description="Quản lý học sinh và phụ huynh"
      requiredPermission={PERMISSIONS.VIEW_STUDENTS}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">
            Students & guardians coming next...
          </h3>
        </div>
      </div>
    </AppLayout>
  );
};

export default Students;

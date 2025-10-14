import React from "react";
import { AppLayout } from "../../components/layout/app-layout";
import { PERMISSIONS } from "../../lib/auth/permissions";

const AuditLogs: React.FC = () => {
  return (
    <AppLayout
      title="Nhật ký hệ thống"
      description="Audit logs và system events"
      requiredPermission={PERMISSIONS.VIEW_AUDIT_LOGS}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">
            Audit logs coming next...
          </h3>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuditLogs;

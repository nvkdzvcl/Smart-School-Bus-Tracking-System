import React from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { PERMISSIONS } from "../../lib/auth/Permissions";

const Messages: React.FC = () => {
  return (
    <AppLayout
      title="Trung tâm tin nhắn"
      description="Gửi và quản lý tin nhắn"
      requiredPermission={PERMISSIONS.VIEW_MESSAGES}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">
            Messaging center coming next...
          </h3>
        </div>
      </div>
    </AppLayout>
  );
};

export default Messages;

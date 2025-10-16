import { AppLayout } from "../../components/layout/AppLayout";
import { PERMISSIONS } from "../../lib/auth/Permissions";

const Assignments = () => {
  return (
    <AppLayout
      title="Phân công"
      description="Gán tuyến, xe và tài xế"
      requiredPermission={PERMISSIONS.VIEW_ASSIGNMENTS}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">
            Assignments coming next...
          </h3>
        </div>
      </div>
    </AppLayout>
  );
};

export default Assignments;

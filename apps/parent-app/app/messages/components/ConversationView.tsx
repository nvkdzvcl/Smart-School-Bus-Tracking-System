import ChatBox from "./ChatBox";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
  recipientName: string;
  recipientId: string;
}

export default function ConversationView({
  conversationId,
  onBack,
  recipientName,
  recipientId,
}: ConversationViewProps) {
  return (
    <div className="space-y-4">
      {/* Nút "Back" tùy chỉnh */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground p-0 h-auto hover:bg-transparent"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại danh sách
      </Button>

      {/* ChatBox giữ nguyên, tự động nhận 'recipientName' từ prop */}
      <ChatBox
        conversationId={conversationId}
        recipientName={recipientName}
        recipientId={recipientId}
      />
    </div>
  );
}

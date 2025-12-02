import React, { useContext, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { Conversation } from "@/types/data-types";
import { UserContext } from "@/context/UserContext";
import { searchUser } from "@/lib/userApi"; // Đảm bảo import đúng hàm search của bạn

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  onSelectConversation: (conversationId: string) => void;
  
  // [SỬA LỖI Ở ĐÂY] Cập nhật Type để nhận Object thay vì String
  onStartNewChat: (user: { id: string; fullName: string }) => void;
}

export default function ConversationList({
  conversations,
  isLoading,
  error,
  onSelectConversation,
  onStartNewChat,
}: ConversationListProps) {
  const { user } = useContext(UserContext)!;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Logic tìm kiếm
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const res = await searchUser(searchTerm);
        // Xử lý kết quả trả về (tùy API trả về mảng hay object {data: []})
        const data = Array.isArray(res) ? res : (res.data || []);
        const results = data.filter((u: any) => u.id !== user?.id);
        setSearchResults(results);
      } catch (err) {
        console.error("Lỗi tìm kiếm", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, user]);

  if (isLoading) return <div className="p-4 text-center"><Loader2 className="animate-spin inline"/></div>;
  if (!user) return null;

  return (
    <Card>
      <CardContent className="p-0">
        {/* Input Tìm kiếm */}
        <div className="p-3 border-b flex items-center gap-2">
           <Search className="w-4 h-4 text-muted-foreground" />
           <Input 
             placeholder="Tìm tài xế, quản lý..." 
             className="border-none shadow-none focus-visible:ring-0 px-0 h-auto"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="space-y-0 max-h-[500px] overflow-y-auto">
          {/* KẾT QUẢ TÌM KIẾM */}
          {searchTerm && (
            <div className="bg-slate-50">
              {isSearching ? (
                 <p className="p-4 text-xs text-center text-muted-foreground">Đang tìm...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <button
                    key={u.id}
                    // [QUAN TRỌNG] Truyền đúng Object { id, fullName } khớp với Interface
                    onClick={() => {
                        onStartNewChat({ id: u.id, fullName: u.fullName });
                        setSearchTerm(""); 
                    }}
                    className="flex items-center gap-3 p-3 border-b w-full text-left hover:bg-blue-50"
                  >
                    <Avatar className="w-8 h-8 border bg-white">
                      <AvatarFallback><UserPlus className="w-4 h-4 text-blue-500"/></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground">Bấm để nhắn tin</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="p-4 text-xs text-center text-muted-foreground">Không tìm thấy ai.</p>
              )}
              <div className="h-2 bg-slate-100 border-y"></div>
            </div>
          )}

          {/* DANH SÁCH HỘI THOẠI CŨ */}
          {conversations.length > 0 ? conversations.map((convo) => {
            // Logic hiển thị tên người nhận cũ
            // (Lưu ý: Nếu bạn đang dùng JSON mới (phẳng), hãy sửa đoạn này theo JSON mới như các câu trả lời trước)
            // Dưới đây là logic theo JSON cũ (nested object), nếu bạn dùng JSON mới hãy thay bằng convo.recipientName
            const recipient = convo.participant1?.id === user.id ? convo.participant2 : convo.participant1;
            
            // Fallback nếu dữ liệu lỗi
            if (!recipient) return null;

            let timeAgo = "";
            try {
               timeAgo = formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: true, locale: vi });
            } catch(e) {}

            return (
              <button
                key={convo.id}
                onClick={() => onSelectConversation(convo.id)}
                className="flex items-center gap-3 p-4 border-b last:border-b-0 w-full text-left hover:bg-muted/50"
              >
                <Avatar className="w-10 h-10 border">
                  <AvatarFallback>{recipient.fullName?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                   <div className="flex justify-between items-center">
                     <p className="text-sm font-semibold truncate">{recipient.fullName}</p>
                     <p className="text-xs text-muted-foreground">{timeAgo}</p>
                   </div>
                   <p className="text-sm text-muted-foreground truncate mt-1">
                     {convo.lastMessagePreview || "Chưa có tin nhắn"}
                   </p>
                </div>
              </button>
            );
          }) : (
             !searchTerm && <div className="p-8 text-center text-muted-foreground text-sm">Chưa có tin nhắn nào.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
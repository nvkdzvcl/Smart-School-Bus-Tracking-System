import { LoginForm } from "../components/LoginForm"; // Giả sử LoginForm nằm trong file LoginForm.js/jsx cùng thư mục

function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="w-full max-w-md space-y-8">
        
        {/* Phần tiêu đề và biểu tượng */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              {/* Hiệu ứng blur cho biểu tượng */}
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative bg-secondary rounded-2xl p-4 border border-primary/20">
                {/* SVG Icon */}
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Văn bản */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Driver App</h1>
          <p className="text-muted-foreground text-balance">Đăng nhập để bắt đầu ca làm việc</p>
        </div>

        {/* Component Form đăng nhập */}
        <LoginForm />
      </div>
    </div>
  );
}

// Xuất component dưới dạng export thông thường
export default LoginPage;
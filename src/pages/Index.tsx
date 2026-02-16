import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import ChatRoom from "@/components/chat/ChatRoom";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse-glow h-10 w-10 rounded-full bg-primary/20" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <ChatRoom />;
};

export default Index;

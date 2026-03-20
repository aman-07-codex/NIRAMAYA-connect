import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  PlusCircle,
  MessageSquare,
  Trash2,
  ChevronLeft,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/AuthProvider";
import {
  sendMessage as sendAIMessage,
  fetchConversations,
  fetchMessages,
  deleteConversation,
  type AIConversation,
  type AIMessage,
} from "@/lib/ai-chat";

// ============================================================
// Types
// ============================================================
interface DisplayMessage {
  id: string;
  sender: "patient" | "ai";
  text: string;
  timestamp: string;
}

// ============================================================
// Constants
// ============================================================
const WELCOME_MESSAGE: DisplayMessage = {
  id: "welcome",
  sender: "ai",
  text: "Hello! I'm your **Niramaya AI Health Assistant**. 👋\n\nI can help you with:\n- 🩺 General health guidance\n- 🩸 Blood donation & request information\n- 🏥 Finding nearby hospitals\n- ❓ Health-related questions\n\nHow can I help you today?",
  timestamp: new Date().toISOString(),
};

const MAX_MESSAGE_LENGTH = 1000;

// ============================================================
// Component
// ============================================================
const AIAssistant = () => {
  const { user } = useAuth();

  // Conversation state
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Load conversations on mount ──
  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingConversations(true);
      const convos = await fetchConversations();
      setConversations(convos);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  // ── Auto-scroll to bottom ──
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // ── Auto-resize textarea ──
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        128
      )}px`;
    }
  }, [input]);

  // ── Load messages for a conversation ──
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const msgs = await fetchMessages(conversationId);
      const displayMsgs: DisplayMessage[] = msgs.map((m: AIMessage) => ({
        id: m.id,
        sender: m.sender,
        text: m.message,
        timestamp: m.created_at,
      }));

      if (displayMsgs.length === 0) {
        setMessages([WELCOME_MESSAGE]);
      } else {
        setMessages(displayMsgs);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Failed to load conversation messages.");
    }
  }, []);

  // ── Switch conversation ──
  const switchConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId);
      setError(null);
      await loadMessages(conversationId);
      setShowSidebar(false);
    },
    [loadMessages]
  );

  // ── New chat ──
  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setIsTyping(false);
    setError(null);
    setShowSidebar(false);
  }, []);

  // ── Delete conversation ──
  const handleDeleteConversation = useCallback(
    async (convId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await deleteConversation(convId);
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConversationId === convId) {
          handleNewChat();
        }
      } catch (err) {
        console.error("Failed to delete conversation:", err);
      }
    },
    [activeConversationId, handleNewChat]
  );

  // ── Send message ──
  const handleSend = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isTyping) return;

      if (trimmed.length > MAX_MESSAGE_LENGTH) {
        setError(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`);
        return;
      }

      setError(null);

      // Optimistically add user message
      const userMsg: DisplayMessage = {
        id: `user-${Date.now()}`,
        sender: "patient",
        text: trimmed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "welcome" || prev.length > 1),
        userMsg,
      ]);
      setInput("");
      setIsTyping(true);

      try {
        const result = await sendAIMessage(activeConversationId, trimmed);

        // Update active conversation
        if (!activeConversationId) {
          setActiveConversationId(result.conversationId);
        }

        // Add AI response
        const aiMsg: DisplayMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: result.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Refresh conversation list
        loadConversations();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get AI response";
        setError(errorMessage);

        // Add fallback message
        const fallbackMsg: DisplayMessage = {
          id: `error-${Date.now()}`,
          sender: "ai",
          text: "I'm sorry, I'm having trouble responding right now. If you're experiencing a medical emergency, please call your local emergency number or visit the nearest hospital immediately.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, activeConversationId, loadConversations]
  );

  // ── Format timestamp ──
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const charCount = input.length;
  const isOverLimit = charCount > MAX_MESSAGE_LENGTH;

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* ── Sidebar (Conversation History) ── */}
      <div
        className={`absolute md:relative z-20 h-full w-72 bg-card border-r shadow-lg md:shadow-none transition-transform duration-300 flex flex-col ${
          showSidebar
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex-none p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Chat History
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden p-1 rounded-lg hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 hover:border-primary/50 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            New Conversation
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Bot className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                No conversations yet. Start a new chat!
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => switchConversation(conv.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all group flex items-center gap-2 ${
                  activeConversationId === conv.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-xs">
                    Conversation
                  </p>
                  <p className="text-[10px] opacity-60 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {formatTime(conv.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Sidebar overlay (mobile) ── */}
      {showSidebar && (
        <div
          className="absolute inset-0 bg-black/30 z-10 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/10">
        {/* Chat Header */}
        <div className="flex-none p-4 md:p-5 border-b bg-card shadow-sm z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <div className="bg-gradient-to-br from-primary to-primary/70 p-2.5 rounded-xl shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                AI Health Assistant
              </h1>
              <p className="text-[11px] md:text-xs text-muted-foreground hidden sm:block">
                Powered by Niramaya AI — Personalized health guidance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors bg-muted/50 hover:bg-primary/10 px-3 py-2 rounded-xl"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex w-full ${
                  isAi ? "justify-start" : "justify-end"
                } animate-fade-in-up`}
              >
                <div
                  className={`flex gap-3 max-w-[88%] md:max-w-[75%] ${
                    isAi ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-1 ${
                      isAi
                        ? "bg-gradient-to-br from-primary to-primary/70 text-white shadow-md shadow-primary/20"
                        : "bg-gradient-to-br from-slate-600 to-slate-700 text-white"
                    }`}
                  >
                    {isAi ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`rounded-2xl px-5 py-3.5 shadow-sm text-sm ${
                        isAi
                          ? "bg-card border text-card-foreground rounded-tl-sm"
                          : "bg-primary text-primary-foreground rounded-tr-sm"
                      }`}
                    >
                      {isAi ? (
                        <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted/50 prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none break-words">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed break-words">
                          {msg.text}
                        </p>
                      )}
                    </div>
                    <p
                      className={`text-[10px] text-muted-foreground/60 px-2 ${
                        isAi ? "text-left" : "text-right"
                      }`}
                    >
                      {msg.id !== "welcome" && formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex w-full justify-start animate-fade-in">
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-md shadow-primary/20 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-4 bg-card border shadow-sm flex items-center gap-2 h-[48px]">
                  <div
                    className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                  <span className="text-xs text-muted-foreground ml-2">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex-none px-4 md:px-6">
            <div className="max-w-4xl mx-auto bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-2.5 mb-2 flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs font-medium hover:underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex-none p-4 md:p-5 bg-card border-t shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
          <form
            onSubmit={handleSend}
            className="max-w-4xl mx-auto relative flex items-end gap-2"
          >
            <div
              className={`relative flex-1 bg-muted/30 border rounded-2xl focus-within:ring-2 transition-all overflow-hidden shadow-sm ${
                isOverLimit
                  ? "border-destructive focus-within:ring-destructive/20"
                  : "focus-within:ring-primary/20 focus-within:border-primary"
              }`}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about your health, symptoms, or blood services..."
                className="w-full max-h-32 min-h-[56px] resize-none bg-transparent px-4 py-4 text-sm outline-none placeholder:text-muted-foreground leading-relaxed"
                rows={1}
                disabled={isTyping}
              />
              {/* Character counter */}
              {charCount > 0 && (
                <div
                  className={`absolute bottom-2 right-3 text-[10px] font-medium ${
                    isOverLimit ? "text-destructive" : "text-muted-foreground/50"
                  }`}
                >
                  {charCount}/{MAX_MESSAGE_LENGTH}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isTyping || isOverLimit}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </button>
          </form>

          <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-3 font-medium">
            ⚕️ This AI provides general health guidance only. Always consult a
            certified medical professional for diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

import { Link, useNavigate } from "@tanstack/react-router";
import { Bot, MessageSquareText, Minus, Send, Trash2, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useCart } from "@/lib/store";
import {
  buildChatbotReply,
  chatbotConfig,
  getMainMenuReplies,
  normalizeInput,
  resolveOrderReply,
} from "@/lib/chatbot";

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  quickReplies?: string[];
  productCards?: Array<{
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    rating: number;
    stock: number;
  }>;
};

const STORAGE_KEY = "zyence-chatbot-history";

function createBotMessage(
  text: string,
  quickReplies: string[] = [],
  productCards?: ChatMessage["productCards"],
) {
  return {
    id: crypto.randomUUID(),
    role: "bot" as const,
    text,
    quickReplies,
    productCards,
  };
}

function createUserMessage(text: string) {
  return {
    id: crypto.randomUUID(),
    role: "user" as const,
    text,
  };
}

export function ChatbotWidget() {
  const navigate = useNavigate();
  const addToCart = useCart((state) => state.add);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [awaitingOrderNumber, setAwaitingOrderNumber] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore malformed saved state
    }

    return [
      createBotMessage(
        `Hi! 👋 Welcome to ${chatbotConfig.storeName}. How can I help you today?`,
        getMainMenuReplies(),
      ),
    ];
  });

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previousMessageCount = useRef(messages.length);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, isOpen, isMinimized]);

  // Show an unread nudge if a bot message arrives while the widget is closed/minimized.
  useEffect(() => {
    const grew = messages.length > previousMessageCount.current;
    const lastMessage = messages[messages.length - 1];
    if (grew && lastMessage?.role === "bot" && (!isOpen || isMinimized)) {
      setHasUnread(true);
    }
    previousMessageCount.current = messages.length;
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setHasUnread(false);
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const quickReplies = useMemo(() => {
    const last = [...messages]
      .reverse()
      .find((message) => message.quickReplies && message.quickReplies.length > 0);
    return last?.quickReplies ?? getMainMenuReplies();
  }, [messages]);

  const sendText = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) {
      const msg = createBotMessage(
        "Please type a question or choose one of the quick replies.",
        quickReplies,
      );
      setMessages((prev) => [...prev, msg]);
      return;
    }

    setMessages((prev) => [...prev, createUserMessage(text)]);

    const reply = awaitingOrderNumber
      ? await resolveOrderReply(undefined, text)
      : buildChatbotReply(text, false);
    setAwaitingOrderNumber(Boolean(reply.awaitOrderNumber));

    setMessages((prev) => [
      ...prev,
      createBotMessage(reply.text, reply.quickReplies, reply.productCards),
    ]);

    setInput("");
  };

  const handleQuickReply = (label: string) => {
    const normalized = normalizeInput(label);
    if (!normalized) return;

    if (normalized.includes("browse products") || normalized.includes("shop")) {
      navigate({ to: "/shop" });
      return;
    }

    if (normalized.includes("track order") || normalized.includes("track my order")) {
      setAwaitingOrderNumber(true);
      setMessages((prev) => [
        ...prev,
        createUserMessage(label),
        createBotMessage("Sure! Please enter your order number.", ["Back to Main Menu"]),
      ]);
      return;
    }

    if (normalized.includes("shipping")) {
      const reply = buildChatbotReply("shipping");
      setMessages((prev) => [
        ...prev,
        createUserMessage(label),
        createBotMessage(reply.text, reply.quickReplies),
      ]);
      return;
    }

    if (normalized.includes("return")) {
      const reply = buildChatbotReply("return product");
      setMessages((prev) => [
        ...prev,
        createUserMessage(label),
        createBotMessage(reply.text, reply.quickReplies),
      ]);
      return;
    }

    if (normalized.includes("payment")) {
      const reply = buildChatbotReply("payment methods");
      setMessages((prev) => [
        ...prev,
        createUserMessage(label),
        createBotMessage(reply.text, reply.quickReplies),
      ]);
      return;
    }

    if (normalized.includes("faq") || normalized.includes("frequently asked questions")) {
      const reply = buildChatbotReply("what is your return policy");
      setMessages((prev) => [
        ...prev,
        createUserMessage(label),
        createBotMessage(reply.text, reply.quickReplies),
      ]);
      return;
    }

    if (normalized.includes("account") || normalized.includes("login")) {
      const reply = buildChatbotReply("login");
      setMessages((prev) => [
        ...prev,
        createUserMessage(label),
        createBotMessage(reply.text, reply.quickReplies),
      ]);
      return;
    }

    if (normalized.includes("contact")) {
      const reply = buildChatbotReply("contact support");
      setMessages((prev) => [
        ...prev,
        createUserMessage(label),
        createBotMessage(reply.text, reply.quickReplies),
      ]);
      return;
    }

    if (normalized.includes("back to main menu") || normalized.includes("back")) {
      const start = createBotMessage(
        `Hi! 👋 Welcome to ${chatbotConfig.storeName}. How can I help you today?`,
        getMainMenuReplies(),
      );
      setMessages((prev) => [...prev, createUserMessage(label), start]);
      setAwaitingOrderNumber(false);
      return;
    }

    sendText(label);
  };

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    sendText(input);
  };

  const clearChat = () => {
    setAwaitingOrderNumber(false);
    setMessages([
      createBotMessage(
        `Hi! 👋 Welcome to ${chatbotConfig.storeName}. How can I help you today?`,
        getMainMenuReplies(),
      ),
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-5 sm:right-5">
      {!isOpen && (
        <button
          type="button"
          aria-label="Open customer support chat"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-sm bg-primary px-5 py-3.5 text-primary-foreground shadow-[var(--shadow-chat-trigger)] transition-colors hover:bg-olive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <MessageSquareText className="h-4 w-4" />
          <span className="label-caps">Store Assistant</span>
          {hasUnread ? (
            <span
              className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-olive ring-2 ring-background"
              aria-hidden="true"
            />
          ) : null}
        </button>
      )}

      {isOpen && (
        <div className="w-[calc(100vw-1.5rem)] max-w-[400px] origin-bottom-right animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-sm border border-border/70 bg-background shadow-[var(--shadow-chat-panel)] duration-200 sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-border/70 bg-surface px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-olive-soft text-olive">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Store Assistant</p>
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-olive" aria-hidden="true" />
                  Online now
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Clear chat"
                title="Clear chat"
                onClick={clearChat}
                className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                title={isMinimized ? "Expand chat" : "Minimize chat"}
                onClick={() => setIsMinimized((value) => !value)}
                className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Close chat"
                title="Close chat"
                onClick={() => setIsOpen(false)}
                className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div
                ref={bodyRef}
                className="flex max-h-[420px] min-h-[280px] flex-col gap-4 overflow-y-auto bg-background p-3 sm:max-h-[480px]"
              >
                {messages.map((message, idx) => {
                  const isUser = message.role === "user";
                  const rowClassName = isUser
                    ? "flex items-end justify-end gap-2"
                    : "flex items-end gap-2";
                  const bubbleClassName = isUser
                    ? "max-w-[78%] animate-in fade-in slide-in-from-right-4 rounded-sm bg-primary px-3.5 py-2.5 text-sm leading-6 text-primary-foreground"
                    : "max-w-[78%] animate-in fade-in slide-in-from-left-4 rounded-sm border border-border/70 bg-surface px-3.5 py-2.5 text-sm leading-6 text-foreground";

                  return (
                    <div
                      key={message.id}
                      className={`${rowClassName} chat-message`}
                      data-chat-index={Math.min(idx, 5)}
                    >
                      {!isUser ? (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-olive-soft text-olive">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      ) : null}

                      <div className={bubbleClassName}>
                        {message.text.split("\n").map((line, index) => (
                          <p key={`${message.id}-${index}`} className="whitespace-pre-line">
                            {line}
                          </p>
                        ))}

                        {message.productCards && message.productCards.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {message.productCards.map((product, pidx) => (
                              <div
                                key={product.id}
                                className="chat-product animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-sm border border-border/70 bg-background"
                                data-chat-index={Math.min(pidx, 3)}
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-32 w-full object-cover"
                                />
                                <div className="space-y-2 p-2.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium text-foreground">
                                      {product.name}
                                    </p>
                                    <span className="text-xs text-muted-foreground">
                                      ★ {product.rating}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">${product.price}</p>
                                  <div className="flex gap-2">
                                    <Link
                                      to={`/product/${product.slug}`}
                                      className="inline-flex flex-1 items-center justify-center rounded-sm bg-primary px-2.5 py-2 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-olive"
                                    >
                                      View product
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => addToCart(product.id, 1)}
                                      className="inline-flex flex-1 items-center justify-center rounded-sm border border-border px-2.5 py-2 text-[11px] font-medium text-foreground transition-colors hover:border-olive hover:text-olive"
                                    >
                                      Add to cart
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {isUser ? (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {quickReplies.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom border-t border-border/70 bg-surface p-3 duration-300">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, qidx) => (
                      <button
                        key={reply}
                        type="button"
                        onClick={() => handleQuickReply(reply)}
                        className="chat-reply animate-in fade-in zoom-in rounded-sm border border-border/70 bg-background px-3 py-1.5 text-xs text-foreground transition-all hover:border-olive hover:bg-muted hover:text-olive"
                        data-chat-index={Math.min(qidx, 5)}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="border-t border-border/70 p-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    aria-label="Type your message"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type your message…"
                    className="h-11 flex-1 rounded-sm border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-olive"
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    disabled={!input.trim()}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-colors hover:bg-olive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

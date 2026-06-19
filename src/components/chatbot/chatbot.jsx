import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";


const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Chào bạn! Mình có thể hỗ trợ gì hôm nay?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setMessages([...messages, { from: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { from: "bot", text: data.reply }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { from: "bot", text: "Xin lỗi, hệ thống bận!" }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Chat Box */}
      {isOpen && (
        <div className="fixed z-50 flex flex-col overflow-hidden bg-white border shadow-xl bottom-24 right-6 w-80 rounded-xl animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white bg-gradient-to-r from-yellow-400 to-orange-500">
            <div className="flex items-center gap-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                alt="support"
                className="w-6 h-6 rounded-full"
              />
              <span className="font-semibold">Hỗ trợ khách hàng</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:opacity-70"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto text-sm max-h-80 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[70%] ${
                    msg.from === "user"
                      ? "bg-yellow-400 text-black rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 max-w-[70%] italic animate-pulse">
                  Đang trả lời...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center px-3 py-2 bg-white border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 text-sm placeholder-gray-400 border-none focus:ring-0"
            />
            <button
              onClick={sendMessage}
              className="p-1 text-yellow-500 transition hover:text-orange-500"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-40 p-4 text-white transition transform bg-yellow-500 rounded-full shadow-xl bottom-6 right-6 hover:bg-yellow-600 hover:scale-105"
      >
        <MessageSquare size={24} />
      </button>
    </>
  );
};

export default Chatbot;

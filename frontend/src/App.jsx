import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

function App() {

  // -----------------------------
  // STATES
  // -----------------------------

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello 👋 Ask me coding, writing, data, or career questions."
    }
  ]);

  // -----------------------------
  // SEND MESSAGE
  // -----------------------------

  const sendMessage = async () => {

    if (!message.trim()) return;

    // User message

    const userMessage = {
      type: "user",
      text: message
    };

    // Add user message immediately

    setMessages((prev) => [...prev, userMessage]);

    // Store current message

    const currentMessage = message;

    // Clear input

    setMessage("");

    // Start loading

    setLoading(true);

    try {

      // API CALL

      const response = await fetch(
        "https://ai-prompt-router.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: currentMessage
          }),
        }
      );

      const data = await response.json();

      // Bot response

      const botMessage = {
        type: "bot",
        text: data.response,
        intent: data.intent,
        confidence: data.confidence
      };

      // Add bot response

      setMessages((prev) => [
        ...prev,
        botMessage
      ]);

    } catch (error) {

      console.log(error);

      const errorMessage = {
        type: "bot",
        text: "Error connecting to backend."
      };

      setMessages((prev) => [
        ...prev,
        errorMessage
      ]);

    } finally {

      // Stop loading

      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (

    <div className="h-screen flex bg-slate-950 text-white">

      {/* SIDEBAR */}

      <div className="w-72 bg-slate-900 border-r border-slate-800 p-6 hidden md:flex flex-col">

        {/* LOGO */}

        <div className="flex items-center gap-3 mb-10">

          <div className="bg-blue-600 p-3 rounded-2xl">
            <Bot size={28} />
          </div>

          <div>

            <h1 className="text-2xl font-bold">
              AI Router
            </h1>

            <p className="text-sm text-slate-400">
              Multi-Agent Assistant
            </p>

          </div>

        </div>

        {/* SUPPORTED EXPERTS */}

        <div className="bg-slate-800 rounded-2xl p-5 mb-6">

          <h2 className="font-semibold text-lg mb-4">
            Supported Experts
          </h2>

          <div className="space-y-3 text-slate-300">

            <div>💻 Code Expert</div>
            <div>📊 Data Analyst</div>
            <div>✍️ Writing Coach</div>
            <div>🎯 Career Advisor</div>

          </div>

        </div>

        {/* AI ROUTING */}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">

          <div className="flex items-center gap-2 mb-3">

            <Sparkles size={18} />

            <h2 className="font-semibold">
              AI Routing
            </h2>

          </div>

          <p className="text-sm text-slate-300 leading-6">
            Requests are classified and routed
            to the best AI expert automatically.
          </p>

        </div>

      </div>

      {/* MAIN AREA */}

      <div className="flex-1 flex flex-col">

        {/* HEADER */}

        <div className="border-b border-slate-800 px-8 py-5 bg-slate-900">

          <h1 className="text-3xl font-bold">
            AI Prompt Router
          </h1>

          <p className="text-slate-400 mt-1">
            Powered by Groq API
          </p>

        </div>

        {/* CHAT AREA */}

        <div className="flex-1 overflow-y-auto p-6">

          <div className="max-w-4xl mx-auto space-y-6">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`flex ${
                  msg.type === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-2xl px-5 py-4 rounded-3xl ${
                    msg.type === "user"
                      ? "bg-blue-600"
                      : "bg-slate-800 border border-slate-700"
                  }`}
                >

                  {/* INTENT BADGES */}

                  {msg.type === "bot" && msg.intent && (

                    <div className="flex gap-3 mb-3">

                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                        {msg.intent}
                      </span>

                      <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                        {(msg.confidence * 100).toFixed(1)}%
                      </span>

                    </div>
                  )}

                  {/* MESSAGE */}

                  <div className="prose prose-invert max-w-none">

                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>

                  </div>

                </div>

              </div>
            ))}

            {/* LOADING */}

            {loading && (

              <div className="flex justify-start">

                <div className="bg-slate-800 border border-slate-700 px-5 py-4 rounded-3xl">

                  <div className="flex gap-2">

                    <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>

                    <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>

                    <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>

                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* INPUT AREA */}

        <div className="border-t border-slate-800 p-6 bg-slate-900">

          <div className="max-w-4xl mx-auto flex gap-4">

            <textarea
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none resize-none"
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 transition-all px-6 rounded-2xl flex items-center justify-center"
            >

              <Send size={24} />

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;


import { useState, useRef, useEffect } from 'react';
import Header from "./components/header.jsx";
import './App.css'

function App() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = { sender: "user", text: message, type: "user" };
    setChatLog((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch('https://chatbot-1utp.vercel.app/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur serveur: ${res.status} - ${errorText}`);
      }

      if (!res.body) {
        throw new Error('Pas de corps de réponse');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiMessage = "";

      setChatLog((prev) => [...prev, { sender: "AI", text: "...", type: "ai" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        aiMessage += chunk;

        setChatLog((prev) => {
          const newLog = [...prev];
          newLog[newLog.length - 1] = { 
            sender: "AI", 
            text: aiMessage,
            type: "ai"
          };
          return newLog;
        });
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      setChatLog((prev) => [
        ...prev, 
        { 
          sender: "AI", 
          text: `Erreur: ${error.message}`,
          type: "error"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div
      style={{ backgroundImage: 'url("/materiel-medical-avec-copie-espace.jpg")' }}
      className="bg-cover bg-center min-h-screen w-full backdrop-blur-sm flex flex-col"
    >
      {/* <Header /> */}

      
      <main className="flex-1 flex flex-col">
        <section className="flex justify-center items-center py-8">
          <div className="bg-white bg-opacity-90 border border-gray-200 rounded-xl p-6 text-center max-w-2xl mx-4 shadow-lg">
            <p className="text-2xl font-semibold text-gray-800">Salut, en quoi puis-je vous aider ?</p>
            <p className="text-gray-600 mt-2">Je suis votre assistant médical spécialisé</p>
          </div>
        </section>
          
        
        <div 
          ref={chatContainerRef}
          className="chat-container  rounded-xl p-20 my-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent"
        >
        <div className='wesh'>
          <div className="space-y-4">
            {chatLog.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
            
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg 2xl:max-w-xl p-4 rounded-2xl shadow-md ${
                    msg.type === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : msg.type === "error"
                      ? "bg-red-100 text-red-800 border border-red-200 rounded-bl-none"
                      : "bg-green-100 text-gray-800 border border-green-200 rounded-bl-none"
                  }`}
                >
                  <div className="font-semibold mb-1 text-lg">
                    {msg.type === "user" ? "Vous" : "Assistant Médical"}
                  </div>
                  <div className="text-lg">{msg.text}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start text-lg">
                <div className="bg-green-100 text-gray-800 p-4 rounded-2xl rounded-bl-none border border-green-200 max-w-xs lg:max-w-md xl:max-w-lg 2xl:max-w-xl text-lg">
                  <div className="font-semibold mb-1">Assistant Médical</div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        

          <div className="flex justify-center">
            <div className="bg-white border border-gray-300 px-4 py-3 flex items-center w-full max-w-3xl rounded-full shadow-lg">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isLoading}
                type="text"
                placeholder="Posez votre question médicale..." 
                className="flex-1 text-lg border-none outline-none px-4 bg-transparent"
              />
              <button 
                onClick={sendMessage} 
                disabled={isLoading}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isLoading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#ffffff"
                  >
                    <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
       
      </main>
    </div>
  );
}

export default App;
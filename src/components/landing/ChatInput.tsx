import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ChatInputProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({ 
  onSubmit, 
  placeholder = "Describe your construction project...",
  disabled = false 
}: ChatInputProps) {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || disabled) return;
    
    // Call the onSubmit handler with the current prompt
    onSubmit(prompt);
    setPrompt(""); // Clear input after submission
  };

  return (
    <div className="relative">
      {/* Add decorative gradient shapes to blend with the page */}
      <div className="absolute w-[350px] h-[250px] opacity-20 transform -rotate-[20deg] -top-[150px] right-[10%] pointer-events-none" style={{zIndex: -1}}>
        <div className="absolute w-[350px] h-[270px] rounded-full bg-gradient-to-b from-transparent to-[#9747FF] blur-[100px]"></div>
      </div>
      
      <div className="absolute w-[300px] h-[200px] opacity-20 transform rotate-[30deg] -bottom-[50px] left-[20%] pointer-events-none" style={{zIndex: -1}}>
        <div className="absolute w-[300px] h-[200px] bg-gradient-to-b from-[rgba(0,100,255,0.00)] to-[rgba(151,71,255,0.6)] blur-[100px]"></div>
      </div>
    
      <form
        onSubmit={handleSubmit}
        className="bg-[rgba(140,140,140,0.24)] border self-stretch flex w-[90%] mx-auto items-stretch gap-5 flex-wrap justify-between mt-[80px] px-6 py-3 rounded-[39px] border-[rgba(140,140,140,0.1)] border-solid max-md:max-w-full max-md:mt-10 relative"
      >
        <div className="flex items-stretch gap-6 text-xl text-[rgba(66,66,66,1)] font-normal tracking-[-1.4px] flex-grow">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full my-auto bg-transparent outline-none overflow-visible min-w-[250px] py-2 pl-4 ${
              disabled ? 'opacity-50' : ''
            }`}
            aria-label="Chat prompt input"
          />
        </div>
        <div className="flex items-stretch gap-[30px]">
          <button
            type="submit"
            aria-label="Send message"
            disabled={disabled || !prompt.trim()}
            className={`aspect-[1] w-16 shrink-0 h-16 rounded-[32px] flex items-center justify-center ${
              disabled || !prompt.trim() 
                ? 'bg-[rgba(151,71,255,0.5)]' 
                : 'bg-[rgba(151,71,255,1)] hover:bg-[rgba(151,71,255,0.9)]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
} 
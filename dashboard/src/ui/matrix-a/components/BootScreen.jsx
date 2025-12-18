import React from "react";

export function BootScreen({ onSkip }) {
  return (
    <div
      className="min-h-screen bg-[#050505] text-[#00FF41] font-mono flex items-center justify-center p-4 cursor-pointer"
      onClick={onSkip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSkip?.();
      }}
      aria-label="Skip boot screen"
    >
      <div className="text-center z-10 animate-pulse select-none">
        <pre className="text-[8px] leading-[1.2] mb-6 opacity-80">
          {`
██╗   ██╗██╗██████╗ ███████╗███████╗ ██████╗  ██████╗ ██████╗ ███████╗
██║   ██║██║██╔══██╗██╔════╝██╔════╝██╔════╝ ██╔═══██╗██╔══██╗██╔════╝
██║   ██║██║██████╔╝█████╗  ███████╗██║      ██║   ██║██████╔╝█████╗  
╚██╗ ██╔╝██║██╔══██╗██╔══╝  ╚════██║██║      ██║   ██║██╔══██╗██╔══╝  
 ╚████╔╝ ██║██████╔╝███████╗███████║╚██████╗ ╚██████╔╝██║  ██║███████╗
  ╚═══╝  ╚═╝╚═════╝ ╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝
`}
        </pre>
        <p className="tracking-[0.8em] text-[10px] font-black uppercase text-[#00FF41]/60">
          Booting_Vibe_OS
        </p>
        <p className="mt-6 text-[9px] opacity-30 tracking-widest uppercase">
          Click to skip
        </p>
      </div>
    </div>
  );
}

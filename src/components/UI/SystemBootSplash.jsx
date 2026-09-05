import React, { useState, useEffect, useRef } from 'react';
import { Shield, Radio, Cpu, Terminal, ArrowRight, Zap, Globe, Sparkles } from 'lucide-react';
import { AudioService } from '../../services/audioService';

const DIAGNOSTIC_STEPS = [
  { label: 'INITIALIZING TANGENT OS KERNEL v4.20', code: 'SYS.CORE', delay: 300 },
  { label: 'ESTABLISHING UPLINK TO TERRAN DATA NET', code: 'NET.TERRAN', delay: 700 },
  { label: 'VERIFYING QUANTUM CRYPTOGRAPHIC PROTOCOLS', code: 'SEC.LATTICE', delay: 1100 },
  { label: 'MOUNTING OMNICORTEX ASSET CATOLOGUE', code: 'DBM.OMNI', delay: 1500 },
  { label: 'CALIBRATING THE STAGE TACTICAL VTT ENGINE', code: 'VTT.WEBGPU', delay: 1900 },
  { label: 'ALL SYSTEMS OPERATIONAL // READY FOR OPERATIVE LINK', code: 'STATUS.OK', delay: 2300 },
];

export const SystemBootSplash = ({ onComplete, isStandalone = false }) => {
  const [progress, setProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const canvasRef = useRef(null);

  // Digital Rain / Data Stream Visual Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const characters = '01010101ABCDEF0123456789ΔΩΨλξτηθTERRAN.NET-TANGENT-SF-RP-SYS-4096-HEX';
    const fontSize = 13;
    const columns = Math.floor(width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    const render = () => {
      // Semi-transparent fade to create stream trails
      ctx.fillStyle = 'rgba(9, 13, 22, 0.18)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Random head character has bright cyan/white glow
        if (Math.random() > 0.88) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 8;
        } else if (Math.random() > 0.4) {
          ctx.fillStyle = '#22d3ee';
          ctx.shadowColor = '#0891b2';
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
          ctx.shadowBlur = 0;
        }

        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Diagnostic progression sequence
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // total duration in ms

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      // Match step index
      const stepIdx = DIAGNOSTIC_STEPS.findIndex((s, idx) => {
        const nextStep = DIAGNOSTIC_STEPS[idx + 1];
        if (!nextStep) return true;
        return elapsed >= s.delay && elapsed < nextStep.delay;
      });

      if (stepIdx !== -1) {
        setActiveStepIndex(stepIdx);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setProgress(100);
        AudioService.playTerminalBeep(1400, 0.05);

        if (!isStandalone) {
          // Brief pause at 100% then smooth transition
          setTimeout(() => {
            handleProceed();
          }, 450);
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isStandalone]);

  const handleProceed = () => {
    setIsFadingOut(true);
    AudioService.playTerminalBeep(1200, 0.04);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 350);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden bg-[#090d16] text-slate-100 transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Matrix Data Stream Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

      {/* Cybernetic Radial Vignette & Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,21,39,0.5)_0%,rgba(9,13,22,0.95)_75%)] pointer-events-none" />
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(34,211,238,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top Telemetry Header Bar */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-5 flex items-center justify-between font-mono text-[10px] sm:text-xs text-cyan-400/80 border-b border-cyan-500/20 bg-slate-950/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_8px_#22d3ee]" />
          <span className="tracking-widest font-bold text-cyan-300">TANGENT SF RP // KERNEL v4.20.9</span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">NODE ID: TERRAN-SOL-GATEWAY-01</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Radio size={13} className="text-cyan-400 animate-pulse" />
            <span className="text-slate-300">CARRIER: <strong className="text-cyan-300">942.88 GHz</strong></span>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
              SYS STATUS: {progress < 100 ? 'INITIALIZING' : 'SYNCHRONIZED'}
            </span>
          </div>
        </div>
      </div>

      {/* Central Glassmorphic Command & Readout Console */}
      <div className="relative z-10 w-[92%] max-w-xl mx-auto flex flex-col items-center">
        {/* Holographic Concentric Reticle */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed animate-spin [animation-duration:20s]" />
          {/* Middle counter-spinning ring */}
          <div className="absolute inset-2 sm:inset-3 rounded-full border border-cyan-400/50 border-t-transparent border-b-transparent animate-spin [animation-duration:8s] [animation-direction:reverse]" />
          {/* Inner ring */}
          <div className="absolute inset-5 sm:inset-6 rounded-full border-2 border-cyan-400/70 border-r-transparent animate-spin [animation-duration:4s]" />
          
          {/* Reticle Crosshairs */}
          <div className="absolute w-full h-[1px] bg-cyan-500/20" />
          <div className="absolute h-full w-[1px] bg-cyan-500/20" />

          {/* Central Pulsing Core Emblem */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/80 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            <Zap size={24} className="text-cyan-300 animate-pulse" />
            <span className="text-[7px] font-mono font-bold text-cyan-200 tracking-tighter mt-0.5">CORE</span>
          </div>
        </div>

        {/* Main Terminal Readout Card (Glassmorphism + Cyan Accents) */}
        <div className="w-full bg-[#0d1117]/85 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col gap-4 font-mono">
          {/* Title Banner */}
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
            <div className="flex items-center gap-2.5">
              <Cpu size={18} className="text-cyan-400" />
              <div>
                <h1 className="text-xs sm:text-sm font-bold tracking-widest text-slate-100 uppercase">
                  TANGENT SCIENCE FANTASY ENGINE
                </h1>
                <p className="text-[10px] text-cyan-400 tracking-wide">
                  TACTICAL VTT &amp; TERRAN DATA NET RECEPTOR
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg sm:text-2xl font-black text-cyan-300 tracking-wider">
                {progress}%
              </span>
            </div>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="w-full space-y-1.5">
            <div className="h-2 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-300 rounded-full transition-all duration-75 shadow-[0_0_12px_#22d3ee]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>BOOT_PHASE: {activeStepIndex + 1}/{DIAGNOSTIC_STEPS.length}</span>
              <span className="text-cyan-400">{DIAGNOSTIC_STEPS[activeStepIndex]?.code || 'SYSTEM'}</span>
            </div>
          </div>

          {/* Live Diagnostic Stream Log */}
          <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 space-y-1.5 min-h-[110px] flex flex-col justify-end text-[10px] sm:text-[11px] overflow-hidden">
            {DIAGNOSTIC_STEPS.slice(0, activeStepIndex + 1).map((step, idx) => {
              const isCurrent = idx === activeStepIndex;
              return (
                <div
                  key={step.code}
                  className={`flex items-center justify-between gap-2 transition-all ${
                    isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={isCurrent ? 'text-cyan-400' : 'text-slate-600'}>&gt;</span>
                    <span className="truncate">{step.label}</span>
                  </div>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950/40 text-cyan-400 shrink-0">
                    {idx < activeStepIndex ? '[OK]' : isCurrent ? '[SYNC...]' : '[WAIT]'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Controls & Bypass / Launch button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-[9px] text-slate-400">
              <Globe size={12} className="text-cyan-400" />
              <span>TERRAN DATA NET LINKED</span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95 cursor-pointer"
            >
              <span>{progress === 100 ? 'ENTER SYSTEM' : 'BYPASS // LAUNCH'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between font-mono text-[9px] text-slate-500 border-t border-slate-900 bg-slate-950/60 backdrop-blur-sm z-10">
        <div>SECURITY: 4096-BIT QUANTUM LATTICE</div>
        <div className="text-center hidden sm:block text-cyan-400/70">TERRAN SCIENCE FANTASY INTERFACE</div>
        <div>MEM: 16384 TB // BUS: 128-BIT</div>
      </div>
    </div>
  );
};

export default SystemBootSplash;

// ============================================================
// RestTimer.jsx — Cronômetro de descanso reutilizável.
// Props:
//   tempoInicial (segundos)
//   onFinish() — chamado quando o tempo zera
//   onCancel() — chamado se o usuário cancelar
// ============================================================
import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { formatarTempo } from "../services/workout.js";

function tocarSom() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

function vibrar() {
  if (navigator.vibrate) {
    try { navigator.vibrate(500); } catch {}
  }
}

export default function RestTimer({ tempoInicial = 60, onFinish, onCancel }) {
  const [restante, setRestante] = useState(tempoInicial);
  const [rodando, setRodando] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!rodando || finalizado) return;
    intervalRef.current = setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setFinalizado(true);
          setRodando(false);
          tocarSom();
          vibrar();
          onFinish?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [rodando, finalizado]);

  const pausar = () => setRodando(false);
  const continuar = () => setRodando(true);
  const reiniciar = () => { setRestante(tempoInicial); setFinalizado(false); setRodando(true); };
  const cancelar = () => { clearInterval(intervalRef.current); onCancel?.(); };

  const progresso = tempoInicial > 0 ? (tempoInicial - restante) / tempoInicial : 1;
  const raio = 54;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia * (1 - progresso);

  if (finalizado) {
    return (
      <div className="rest-timer-card rest-timer-done">
        <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Descanso Finalizado</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>Hora da próxima série!</p>
        <button className="btn btn-primary" style={{ width: "auto", padding: "10px 24px" }} onClick={cancelar}>
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div className="rest-timer-card">
      <p style={{ color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
        Descanso
      </p>

      <div className="rest-timer-circle">
        <svg viewBox="0 0 120 120" width="140" height="140">
          <circle cx="60" cy="60" r={raio} fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={raio} fill="none"
            stroke="var(--primary)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="rest-timer-number">{formatarTempo(restante)}</span>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "center", flexWrap: "wrap" }}>
        {rodando ? (
          <button className="btn btn-secondary" style={{ width: "auto", padding: "10px 18px" }} onClick={pausar}>
            <Pause size={16} /> Pausar
          </button>
        ) : (
          <button className="btn btn-primary" style={{ width: "auto", padding: "10px 18px" }} onClick={continuar}>
            <Play size={16} /> Continuar
          </button>
        )}
        <button className="icon-btn" style={{ width: 40, height: 40 }} onClick={reiniciar} title="Reiniciar">
          <RotateCcw size={16} />
        </button>
        <button className="icon-btn" style={{ width: 40, height: 40 }} onClick={cancelar} title="Cancelar descanso">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
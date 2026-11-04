import { useState } from "react";
import {
  Sparkles,
  MessageCircle,
  Wallet,
  ChartNoAxesCombined,
  ArrowLeftRight,
  ArrowUp,
} from "lucide-react";
import "./App.css";

const suggestions = [
  { label: "Meu saldo", icon: Wallet },
  { label: "Gastos por categoria", icon: ChartNoAxesCombined },
  { label: "Últimas transações", icon: ArrowLeftRight },
];

export default function App() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);

  function sendMessage(text) {
    const content = text.trim();
    if (!content) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content },
      {
        role: "assistant",
        content:
          "A tela está em construção. Vamos conectar as consultas ao backend na próxima etapa.",
      },
    ]);

    setDraft("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(draft);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Expert Financeiro">
          <span className="brand-mark">
            <Sparkles size={22} aria-hidden="true" />
          </span>
          expert<span className="brand-dot">.</span>
        </a>

        <button
          className="new-conversation"
          onClick={() => {
            setMessages([]);
            setDraft("");
          }}
        >
          <MessageCircle size={19} aria-hidden="true" />
          Nova conversa
        </button>

        <section className="account-summary">
          <h2>Suas contas</h2>
          <p>Os saldos aparecerão aqui após conectarmos o backend.</p>
        </section>

        <div className="sidebar-footer">
          <span className="status-dot" />
          Interface em desenvolvimento
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <strong>Seu assistente financeiro</strong>
            <p>Clareza para entender seu dinheiro</p>
          </div>
          <span className="environment-badge">Modo demonstração</span>
        </header>

        <div className="chat-content">
          <section className="welcome">
            <p className="eyebrow">Finanças em uma conversa</p>
            <h1>Vamos entender suas finanças?</h1>
            <p className="welcome-description">
              Consulte suas contas, veja suas transações e descubra onde
              estão suas maiores saídas.
            </p>
          </section>

          <div className="suggestions">
            {suggestions.map(({ label, icon: Icon }) => (
              <button key={label} onClick={() => sendMessage(label)}>
                <Icon size={18} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <section
            className="messages"
            aria-label="Conversa com o Expert"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((message, index) => (
              <article
                key={index}
                className={`message message-${message.role}`}
              >
                <span className="message-author">
                  {message.role === "user" ? "Você" : "Expert"}
                </span>
                <p>{message.content}</p>
              </article>
            ))}
          </section>
        </div>

        <footer className="composer">
          <form className="message-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="message">
              Sua pergunta
            </label>
            <input
              id="message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Pergunte sobre seus dados fictícios…"
              autoComplete="off"
            />
            <button type="submit" disabled={!draft.trim()}>
              <span>Enviar</span>
              <ArrowUp size={19} aria-hidden="true" />
            </button>
          </form>

          <p className="demo-notice">
            Dados fictícios. Nenhuma movimentação financeira real.
          </p>
        </footer>
      </main>
    </div>
  );
}
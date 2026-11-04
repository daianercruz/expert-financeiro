import { useState } from "react";
import {
  Sparkles,
  MessageCircle,
  Wallet,
  ChartNoAxesCombined,
  ArrowLeftRight,
  ArrowUp,
} from "lucide-react";
import { initializeSandbox, getAccounts } from "./services/api";
import "./App.css";

const suggestions = [
  { label: "Meu saldo", icon: Wallet },
  { label: "Gastos por categoria", icon: ChartNoAxesCombined },
  { label: "Últimas transações", icon: ArrowLeftRight },
];

function formatMoney(value, currency) {
  if (value == null) return "Não informado";
  if (!currency) return `${value} (moeda não informada)`;

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

function describeAccount(account) {
  const currency =
    account.balances.iso_currency_code ??
    account.balances.unofficial_currency_code;

  if (account.type === "credit" || account.type === "loan") {
    return (
      "Saldo devedor: " +
      formatMoney(account.balances.current, currency)
    );
  }

  if (account.type === "investment") {
    return (
      "Saldo do investimento: " +
      formatMoney(account.balances.current, currency)
    );
  }

  return (
    "Disponível: " +
    formatMoney(account.balances.available, currency)
  );
}

export default function App() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accountsLoaded, setAccountsLoaded] = useState(false);

  async function sendMessage(text) {
    const content = text.trim();
    if (!content || loading) return;

    setDraft("");
    setMessages((previous) => [
      ...previous,
      { role: "user", content },
    ]);

    const normalized = content
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (!/saldo|contas?/.test(normalized)) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Por enquanto, consigo consultar seus saldos. As consultas de categorias e transações serão conectadas a seguir. Esta versão ainda não usa IA.",
        },
      ]);
      return;
    }

    setLoading(true);

    try {
      await initializeSandbox();
      const result = await getAccounts();

      setAccounts(result.accounts);
      setAccountsLoaded(true);

      const summary = result.accounts
        .map(
          (account) =>
            `${account.name}\n${describeAccount(account)}`
        )
        .join("\n\n");

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.accounts.length
            ? `Veja os saldos retornados:\n\n${summary}\n\nCartões e empréstimos representam dívida. Investimentos não são tratados como saldo disponível.\n\nFonte: Plaid Sandbox — dados fictícios.`
            : "Nenhuma conta encontrada no Plaid Sandbox.",
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Não consegui consultar as contas. Confira se o backend está rodando e tente novamente em Meu saldo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
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

          {!accountsLoaded ? (
            <p>Clique em Meu saldo para consultar suas contas.</p>
          ) : accounts.length === 0 ? (
            <p>Nenhuma conta encontrada.</p>
          ) : (
            accounts.map((account) => (
              <div className="sidebar-account" key={account.id}>
                <p>{account.name}</p>
                <strong>{describeAccount(account)}</strong>
              </div>
            ))
          )}
        </section>

        <div className="sidebar-footer">
          <span className="status-dot" />
          Dados fictícios · Plaid Sandbox
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <strong>Seu assistente financeiro</strong>
            <p>Clareza para entender seu dinheiro</p>
          </div>
          <span className="environment-badge">
            Modo demonstração
          </span>
        </header>

        <div className="chat-content">
          <section className="welcome">
            <p className="eyebrow">Finanças em uma conversa</p>
            <h1>Vamos entender suas finanças?</h1>
            <p className="welcome-description">
              Consulte suas contas, veja suas transações e descubra
              onde estão suas maiores saídas.
            </p>
          </section>

          <div className="suggestions">
            {suggestions.map(({ label, icon: Icon }) => (
              <button
                key={label}
                disabled={loading}
                onClick={() => sendMessage(label)}
              >
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
            aria-busy={loading}
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

            {loading && (
              <p role="status">Consultando o Plaid Sandbox…</p>
            )}
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
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !draft.trim()}
            >
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
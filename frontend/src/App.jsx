import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  MessageCircle,
  Wallet,
  ChartNoAxesCombined,
  ArrowLeftRight,
  ArrowUp,
} from "lucide-react";

import {
  initializeSandbox,
  getAccounts,
  getSpending,
  getTransactions,
  askQuestion,
} from "./services/api.js";

import AccountsSummary from "./components/AccountsSummary.jsx";
import SpendingSummary from "./components/SpendingSummary.jsx";
import TransactionsTable from "./components/TransactionsTable.jsx";
import "./App.css";

const suggestions = [
  { label: "Meu saldo", icon: Wallet, action: "accounts" },
  {
    label: "Gastos por categoria",
    icon: ChartNoAxesCombined,
    action: "spending",
  },
  {
    label: "Últimas transações",
    icon: ArrowLeftRight,
    action: "transactions",
  },
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

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [messages, loading]);

  async function sendMessage(text, action = "ai") {
    const content = text.trim();
    if (!content || loading) return;

    setDraft("");
    setMessages((previous) => [
      ...previous,
      { role: "user", content },
    ]);
    setLoading(true);

    try {
      let reply;

      if (action === "ai") {
        const result = await askQuestion(content);

        reply = {
          role: "assistant",
          content: result.answer,
          source: result.source,
        };
      } else {
        await initializeSandbox();

        if (action === "accounts") {
          const result = await getAccounts();

          setAccounts(result.accounts);
          setAccountsLoaded(true);

          reply = {
            role: "assistant",
            type: "accounts",
            accounts: result.accounts,
          };
        } else if (action === "spending") {
          reply = {
            role: "assistant",
            type: "spending",
            data: await getSpending(),
          };
        } else if (action === "transactions") {
          reply = {
            role: "assistant",
            type: "transactions",
            data: await getTransactions(),
          };
        } else {
          throw new Error("Consulta não reconhecida.");
        }
      }

      setMessages((previous) => [...previous, reply]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error instanceof TypeError
              ? "Não consegui conectar ao servidor. Confira se o backend está rodando e tente novamente."
              : error.message || "Não foi possível concluir a consulta.",
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

  function clearConversation() {
    setMessages([]);
    setDraft("");
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
          type="button"
          className="new-conversation"
          disabled={loading}
          onClick={clearConversation}
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
            {suggestions.map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                type="button"
                disabled={loading}
                onClick={() => sendMessage(label, action)}
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

                {message.type === "accounts" ? (
                  <AccountsSummary accounts={message.accounts} />
                ) : message.type === "spending" ? (
                  <SpendingSummary data={message.data} />
                ) : message.type === "transactions" ? (
                  <TransactionsTable data={message.data} />
                ) : (
                  <>
                    <p>{message.content}</p>

                    {message.source && (
                      <div className="response-source">
                        Fonte: {message.source} · Dados fictícios
                        <br />
                        Resposta gerada com Gemini.
                      </div>
                    )}
                  </>
                )}
              </article>
            ))}

            {loading && (
              <p role="status">Preparando sua resposta…</p>
            )}

            <div ref={messagesEndRef} aria-hidden="true" />
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
              maxLength={2000}
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
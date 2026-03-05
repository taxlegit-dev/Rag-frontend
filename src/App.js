import { useEffect, useState } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_RAG_API;

function App() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const domainOptions = [
    "ICFR",
    "AARAMBH",
    "NGO",
    "TAXLEGIT",
    "CSR",
    "DASHBOARD",
  ];
  const [domains, setDomains] = useState(["ICFR"]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (status !== "uploading") {
      return undefined;
    }

    let lastIndex = -1;
    const progressMessages = [
      "Refining data...",
      "Chunking data...",
      "Embedding data...",
      "Uploading data...",
    ];
    const tick = () => {
      let nextIndex = Math.floor(Math.random() * progressMessages.length);
      if (progressMessages.length > 1) {
        while (nextIndex === lastIndex) {
          nextIndex = Math.floor(Math.random() * progressMessages.length);
        }
      }
      lastIndex = nextIndex;
      setMessage(progressMessages[nextIndex]);
    };

    tick();
    const timer = setInterval(tick, 2000);
    return () => clearInterval(timer);
  }, [status]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);

    if (!API_URL) {
      setStatus("error");
      setMessage("Missing REACT_APP_RAG_API in .env");
      return;
    }

    if (!file) {
      setStatus("error");
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploaded_by_email", email || "test@example.com");
    if (domains.length) {
      formData.append("domains", domains.join(","));
    }

    try {
      setStatus("uploading");
      setMessage("Uploading data...");
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Upload failed");
      }
      setStatus("success");
      setResult(data);
      setMessage("Upload complete.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Upload failed");
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="brand">Vectorless RAG Upload</div>
        <p className="subtitle">
          Upload a document from your local machine. The server will build a
          PageIndex tree and store it in the database.
        </p>
      </header>

      <main className="card">
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Document</span>
            <input
              type="file"
              accept=".pdf,.md,.markdown,.txt,.docx,.xlsx,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <small>PDF, DOCX, XLSX, CSV, TXT, MD supported</small>
          </label>

          <label className="field">
            <span>Uploaded By Email</span>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <div className="field">
            <span>Domains</span>
            <div className="domains">
              {domainOptions.map((option) => {
                const checked = domains.includes(option);
                return (
                  <label
                    key={option}
                    className={`chip ${checked ? "active" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDomains((prev) => [...prev, option]);
                        } else {
                          setDomains((prev) =>
                            prev.filter((item) => item !== option),
                          );
                        }
                      }}
                    />
                    {option}
                  </label>
                );
              })}
            </div>
            <small>Select one or more domains</small>
          </div>

          <button
            className="primary"
            type="submit"
            disabled={status === "uploading"}
          >
            {status === "uploading" ? "Uploading..." : "Upload Document"}
          </button>
        </form>

        <section className="status">
          <div className={`pill ${status}`}>{status}</div>
          {message && <p className="message">{message}</p>}
        </section>

        {result && (
          <section className="result">
            <h3>Upload Result</h3>
            <div className="result-grid">
              <div>
                <span>Doc Name</span>
                <code>{result.doc_name}</code>
              </div>
              {result.doc_summary && (
                <div className="summary">
                  <span>Doc Summary</span>
                  <p>{result.doc_summary}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;

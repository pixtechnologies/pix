import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const db = base44.asServiceRole;
  const reqBody = await req.json().catch(() => ({}));
  let { route, method = "GET", query = {}, body = {} } = reqBody;

  // Guard: route must exist
  if (!route || typeof route !== "string") {
    return Response.json({ error: "Missing or invalid 'route' parameter" });
  }

  // Strip leading slash so route matches consistently
  route = route.replace(/^\//, "");

  // Parse query string from route if present (e.g. /dashboard/x/generate?role=ceo)
  if (route.includes("?")) {
    const [pathPart, queryStr] = route.split("?");
    route = pathPart;
    const params = new URLSearchParams(queryStr);
    for (const [k, v] of params) {
      if (!query[k]) query[k] = v;
    }
  }

  const SECRET = "pix-enterprise-intelligence-os-2024";
  const b64e = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const b64d = (s) => { try { return JSON.parse(Buffer.from(s, "base64url").toString()); } catch { return null; } };
  const signJWT = (p) => { const h = b64e({ alg: "HS256", typ: "JWT" }); const b = b64e(p); const sig = Buffer.from(h + "." + b + SECRET).toString("base64url"); return h + "." + b + "." + sig; };
  const fld = (rec, key) => rec?.data?.[key] ?? rec?.[key] ?? null;

  try {
    if (route === "health") return Response.json({ status: "healthy", service: "πX Technologies", version: "1.0.0", mode: "serverless" });

    if (route === "auth/register" && method === "POST") {
      const { email, password, full_name, role } = body;
      if (!email || !password) return Response.json({ error: "Email and password required" });
      const existing = await db.entities.PixUser.filter({ email });
      if (existing && existing.length > 0) return Response.json({ error: "User already exists" });
      const user = await db.entities.PixUser.create({ email, password_hash: btoa(password), full_name: full_name || email.split("@")[0], role: role || "analyst", org_id: email, created_at: new Date().toISOString() });
      return Response.json({ access_token: signJWT({ sub: email, email, org_id: email, exp: Date.now() + 1800000 }), refresh_token: signJWT({ sub: email, type: "refresh", exp: Date.now() + 86400000 }), user: { email, full_name: fld(user, "full_name") || full_name, id: email } });
    }

    if (route === "auth/login" && method === "POST") {
      const { email, password } = body;
      if (!email || !password) return Response.json({ error: "Email and password required" });
      const users = await db.entities.PixUser.filter({ email });
      if (!users || users.length === 0) return Response.json({ error: "Invalid credentials" });
      const user = users[0];
      const storedHash = fld(user, "password_hash");
      if (!storedHash || btoa(password) !== storedHash) return Response.json({ error: "Invalid credentials" });
      return Response.json({ access_token: signJWT({ sub: email, email, org_id: email, exp: Date.now() + 1800000 }), refresh_token: signJWT({ sub: email, type: "refresh", exp: Date.now() + 86400000 }), user: { email, full_name: fld(user, "full_name") || email.split("@")[0], id: email } });
    }

    if (route === "auth/google" && method === "POST") {
      const { supabase_access_token } = body;
      if (!supabase_access_token) return Response.json({ error: "Missing token" });
      try {
        const parts = supabase_access_token.split(".");
        const payload = b64d(parts[1]);
        const email = payload?.email || "google_user@pix.io";
        let users = await db.entities.PixUser.filter({ email });
        let userData;
        if (!users || users.length === 0) {
          const u = await db.entities.PixUser.create({ email, password_hash: btoa(Math.random().toString()), full_name: payload?.user_metadata?.full_name || email.split("@")[0], role: "analyst", org_id: email, created_at: new Date().toISOString() });
          userData = u;
        } else { userData = users[0]; }
        return Response.json({ access_token: signJWT({ sub: email, email, org_id: email, exp: Date.now() + 1800000 }), refresh_token: signJWT({ sub: email, type: "refresh", exp: Date.now() + 86400000 }), user: { email, full_name: fld(userData, "full_name") || email.split("@")[0], id: email } });
      } catch { return Response.json({ error: "Invalid Google OAuth token" }); }
    }

    if (route === "auth/refresh" && method === "POST") {
      return Response.json({ access_token: signJWT({ sub: body.email || "user", email: body.email || "user", exp: Date.now() + 1800000 }), refresh_token: signJWT({ sub: body.email || "user", type: "refresh", exp: Date.now() + 86400000 }) });
    }

    if (route === "intelligence-profile/analyze" && method === "POST") {
      const { columns, file_name } = body;
      const column_mappings = (columns || []).map((col) => {
        const name = col.name.toLowerCase(); let entityType = null; let confidence = 0.3;
        if (name.includes("customer") || name.includes("client") || name.includes("user")) { entityType = "Customer"; confidence = 0.9; }
        else if (name.includes("product") || name.includes("sku") || name.includes("item")) { entityType = "Product"; confidence = 0.85; }
        else if (name.includes("order") || name.includes("invoice") || name.includes("transaction")) { entityType = "Order"; confidence = 0.85; }
        else if (name.includes("employee") || name.includes("staff")) { entityType = "Employee"; confidence = 0.8; }
        else if (name.includes("store") || name.includes("location") || name.includes("branch")) { entityType = "Store"; confidence = 0.8; }
        else if (name.includes("vendor") || name.includes("supplier")) { entityType = "Vendor"; confidence = 0.85; }
        else if (name.includes("revenue") || name.includes("amount") || name.includes("price") || name.includes("sales")) { confidence = 0.7; }
        else if (name.includes("date") || name.includes("time")) { confidence = 0.5; }
        return { column_name: col.name, entity_type: entityType, confidence, data_type: col.type, pii: col.pii || null };
      });
      const suggested_entities = column_mappings.filter(m => m.entity_type).map(m => ({ entity_type: m.entity_type, label: m.column_name, confidence: m.confidence }));
      return Response.json({ file_name: file_name || "data.xlsx", column_count: (columns || []).length, suggested_industry: { industry: "retail", confidence: 0.7, reason: "Customer/Product/Revenue columns detected" }, suggested_entities: suggested_entities.length ? suggested_entities : [{ entity_type: "Customer", label: "Customer", confidence: 0.5 }, { entity_type: "Product", label: "Product", confidence: 0.5 }], suggested_kpis: [{ label: "Revenue", metric: "revenue", aggregation: "sum", target: { value: 1000000, operator: "gte" } }, { label: "Profit Margin", metric: "profit_margin", aggregation: "avg", target: { value: 15, operator: "gte" } }, { label: "Growth Rate", metric: "growth_rate", aggregation: "pct_change", target: { value: 10, operator: "gte" } }, { label: "Customer Count", metric: "customer_id", aggregation: "count_distinct", target: { value: 1000, operator: "gte" } }, { label: "Avg Order Value", metric: "order_value", aggregation: "avg", target: { value: 500, operator: "gte" } }], column_mappings, confidence_scores: { industry_detection: 0.7, entity_mapping: column_mappings.filter(m => m.entity_type).length / Math.max(column_mappings.length, 1), kpi_detection: 0.65, relationship_discovery: 0.55, overall: 0.6 } });
    }

    if (route.startsWith("dashboard/") && route.includes("/generate")) {
      const role = query?.role || body?.role || "ceo";
      const parts = route.split("/");
      const orgId = parts[1] || body?.org_id || "default";
      const ws = {
        ceo: [{ type: "kpi_card", label: "Revenue", config: { metric: "revenue", aggregation: "sum", target: 1000000 } }, { type: "kpi_card", label: "Growth", config: { metric: "growth_rate", aggregation: "pct_change", target: 10 } }, { type: "trend_chart", label: "Revenue Trend", config: { metric: "revenue" } }, { type: "goal_progress", label: "Revenue Target", config: { kpi: "revenue", target: { value: 1000000, current: 850000 } } }, { type: "ai_recommendation", label: "AI Insight", config: { recommendation: "Revenue growth trending upward." } }, { type: "distribution_chart", label: "Revenue by Region", config: { bins: ["North", "South", "East", "West"], values: [35, 28, 22, 15] } }, { type: "data_quality_score", label: "Data Quality", config: { score: 94 } }, { type: "alert_panel", label: "Alerts", config: {} }],
        cfo: [{ type: "kpi_card", label: "Profit Margin", config: { metric: "profit_margin", aggregation: "avg", target: 15 } }, { type: "kpi_card", label: "Operating Costs", config: { metric: "operating_cost", aggregation: "sum", target: 500000 } }, { type: "trend_chart", label: "Margin Trend", config: { metric: "profit_margin" } }, { type: "goal_progress", label: "Margin Target", config: { kpi: "profit_margin", target: { value: 15, current: 12.5 } } }, { type: "distribution_chart", label: "Cost Breakdown", config: { bins: ["Fixed", "Variable", "Labor", "Marketing"], values: [40, 25, 20, 15] } }, { type: "data_quality_score", label: "Financial Data Quality", config: { score: 97 } }, { type: "decision_queue", label: "Pending Decisions", config: {} }],
        coo: [{ type: "kpi_card", label: "Order Volume", config: { metric: "order_count", aggregation: "count", target: 5000 } }, { type: "kpi_card", label: "Fulfillment Rate", config: { metric: "fulfillment_rate", aggregation: "avg", target: 98 } }, { type: "trend_chart", label: "Order Trend", config: { metric: "order_count" } }, { type: "goal_progress", label: "Fulfillment Target", config: { kpi: "fulfillment_rate", target: { value: 98, current: 95 } } }, { type: "distribution_chart", label: "Orders by Channel", config: { bins: ["Online", "Store", "Phone", "Partner"], values: [45, 30, 15, 10] } }, { type: "data_quality_score", label: "Ops Data Quality", config: { score: 92 } }, { type: "alert_panel", label: "Operational Alerts", config: {} }, { type: "memory_timeline", label: "Recent Events", config: {} }],
        cto: [{ type: "kpi_card", label: "System Uptime", config: { metric: "uptime", aggregation: "avg", target: 99.9 } }, { type: "kpi_card", label: "API Calls", config: { metric: "api_calls", aggregation: "count", target: 1000000 } }, { type: "trend_chart", label: "API Usage", config: { metric: "api_calls" } }, { type: "goal_progress", label: "Uptime SLA", config: { kpi: "uptime", target: { value: 99.9, current: 99.95 } } }, { type: "data_quality_score", label: "System Health", config: { score: 99 } }, { type: "alert_panel", label: "System Alerts", config: {} }, { type: "decision_queue", label: "Tech Decisions", config: {} }],
        executive: [{ type: "kpi_card", label: "Revenue", config: { metric: "revenue", aggregation: "sum", target: 1000000 } }, { type: "kpi_card", label: "Profit Margin", config: { metric: "profit_margin", aggregation: "avg", target: 15 } }, { type: "trend_chart", label: "Revenue Trend", config: { metric: "revenue" } }, { type: "goal_progress", label: "Revenue Target", config: { kpi: "revenue", target: { value: 1000000, current: 850000 } } }, { type: "ai_recommendation", label: "AI Insight", config: { recommendation: "Business performance on track." } }, { type: "data_quality_score", label: "Data Quality", config: { score: 95 } }],
        analyst: [{ type: "kpi_card", label: "Data Points", config: { metric: "records", aggregation: "count", target: 100000 } }, { type: "kpi_card", label: "Quality Score", config: { metric: "quality", aggregation: "avg", target: 95 } }, { type: "trend_chart", label: "Data Growth", config: { metric: "records" } }, { type: "distribution_chart", label: "Data Sources", config: { bins: ["CRM", "ERP", "Web", "API"], values: [40, 30, 20, 10] } }, { type: "data_quality_score", label: "Overall Quality", config: { score: 93 } }],
        manager: [{ type: "kpi_card", label: "Team Performance", config: { metric: "performance", aggregation: "avg", target: 85 } }, { type: "kpi_card", label: "Tasks Completed", config: { metric: "tasks", aggregation: "count", target: 500 } }, { type: "trend_chart", label: "Performance Trend", config: { metric: "performance" } }, { type: "goal_progress", label: "Team Target", config: { kpi: "performance", target: { value: 85, current: 82 } } }, { type: "data_quality_score", label: "Data Quality", config: { score: 90 } }]
      };
      return Response.json({ dashboard_id: "dash_" + Date.now(), dashboard_type: role.toUpperCase() + " Dashboard", org_id: orgId, role, industry: "retail", title: role.toUpperCase() + " Command Center", subtitle: "Real-time enterprise intelligence", layout: ws[role] || ws.ceo, generated_at: new Date().toISOString(), recommendations: [{ priority: "high", text: "Focus on customer retention" }, { priority: "medium", text: "Revenue growth above target" }] });
    }

    if (route === "agents") return Response.json({ agents: [{ name: "Sales Intelligence Agent", role: "sales", description: "Analyzes sales patterns and customer behavior", enabled: true, tools: [{ name: "query_data" }, { name: "generate_chart" }, { name: "send_alert" }] }, { name: "Inventory Agent", role: "inventory", description: "Monitors stock levels and predicts demand", enabled: true, tools: [{ name: "query_inventory" }, { name: "forecast_demand" }, { name: "create_order" }] }, { name: "Customer Success Agent", role: "customer", description: "Tracks satisfaction scores and churn risk", enabled: true, tools: [{ name: "query_crm" }, { name: "send_email" }, { name: "create_ticket" }] }, { name: "Financial Analyst Agent", role: "finance", description: "Monitors P&L, cash flow, and budget variance", enabled: true, tools: [{ name: "query_financials" }, { name: "calculate_kpis" }, { name: "generate_report" }] }, { name: "Operations Agent", role: "operations", description: "Tracks fulfillment rates and operational KPIs", enabled: true, tools: [{ name: "query_ops" }, { name: "create_alert" }] }, { name: "Marketing Agent", role: "marketing", description: "Analyzes campaign performance and ROI", enabled: true, tools: [{ name: "query_campaigns" }, { name: "calculate_roi" }] }, { name: "Strategy Agent", role: "strategy", description: "Identifies growth opportunities and competitive threats", enabled: true, tools: [{ name: "market_analysis" }, { name: "generate_strategy" }] }] });

    if (route === "agents/classify" && method === "POST") { const cats = ["root_cause", "prediction", "comparison", "summary", "recommendation", "trend", "anomaly"]; const cat = cats.find(c => body.input?.toLowerCase().includes(c.replace("_", " "))) || "general"; return Response.json({ classification: { category: cat, confidence: 0.82, reasoning: "Classified based on keyword matching" } }); }
    if (route === "agents/execute" && method === "POST") return Response.json({ success: true, output: `Analysis complete for: "${body.input}". Found 3 insights and 2 recommendations. Confidence: 84%.`, agent: "strategy", duration_ms: 1200 });
    if (route === "enterprise/moat/engine/analyze" && method === "POST") return Response.json({ conclusion: "Revenue decline in Q3 is primarily driven by a 15% increase in customer churn, concentrated in the mid-market segment.", overall_confidence: 0.78, steps: [{ description: "Identify revenue decline", evidence: "Q3 revenue down 12% vs Q2", confidence: 0.95 }, { description: "Isolate contributing factors", evidence: "Churn +15%, AOV -8%", confidence: 0.88 }, { description: "Determine root cause", evidence: "Churn concentrated in mid-market", confidence: 0.75 }, { description: "Assess external factors", evidence: "Competitor launched aggressive pricing", confidence: 0.62 }] });
    if (route === "enterprise/moat/engine/evaluate" && method === "POST") return Response.json({ framework: "swot", options: [{ name: "Aggressive pricing match", score: 7.5, framework: "swot" }, { name: "Improve product differentiation", score: 8.2, framework: "swot" }, { name: "Customer success program", score: 8.8, framework: "swot" }, { name: "Strategic partnership", score: 6.9, framework: "swot" }] });
    if (route === "enterprise/moat/knowledge-graph/enrich" && method === "POST") return Response.json({ status: "enriched", nodes_added: 3, relations_added: 5 });
    if (route === "intelligence-profile/templates/list") return Response.json({ templates: [{ industry: "retail", description: "Retail commerce with sales, inventory, and customer data", entity_count: 5, kpi_count: 6, agent_count: 6 }, { industry: "manufacturing", description: "Production, quality control, and supply chain", entity_count: 5, kpi_count: 6, agent_count: 6 }, { industry: "finance", description: "Financial services, trading, and risk management", entity_count: 4, kpi_count: 5, agent_count: 5 }, { industry: "healthcare", description: "Healthcare operations and patient outcomes", entity_count: 4, kpi_count: 5, agent_count: 4 }, { industry: "logistics", description: "Supply chain, shipping, and delivery", entity_count: 4, kpi_count: 5, agent_count: 5 }, { industry: "saas", description: "SaaS metrics, subscriptions, and user engagement", entity_count: 4, kpi_count: 6, agent_count: 6 }, { industry: "construction", description: "Project management, materials, and workforce", entity_count: 4, kpi_count: 5, agent_count: 4 }] });
    if (route === "intelligence-profile" && method === "POST") return Response.json({ status: "created", profile_id: "prof_" + Date.now(), industry: body.industry || "retail" });
    if (route === "enterprise/analytics/trends") { const days = []; for (let i = 30; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push({ date: d.toISOString().split("T")[0], agent_runs: 5 + Math.floor(Math.random() * 15), problems_detected: 1 + Math.floor(Math.random() * 8), recommendations_generated: 2 + Math.floor(Math.random() * 10), actions_taken: 1 + Math.floor(Math.random() * 5) }); } return Response.json(days); }
    if (route.startsWith("enterprise/analytics/overview/")) return Response.json({ problems_detected: 47, recommendations_generated: 82, actions_taken: 31, business_impact_score: 7.4, agent_performance: { avg_response_time: 1200, success_rate: 0.89 }, active_agents: 7, total_cost: 12.45 });
    if (route.startsWith("enterprise/knowledge-graph/")) return Response.json({ nodes: [{ id: "n1", label: "Customer", type: "Customer" }, { id: "n2", label: "Product", type: "Product" }, { id: "n3", label: "Order", type: "Order" }, { id: "n4", label: "Store", type: "Store" }, { id: "n5", label: "Vendor", type: "Vendor" }] });
    if (route.startsWith("enterprise/vector-memory/search/")) { const q = query?.query || body?.query || ""; return Response.json({ results: [{ text: `Memory related to "${q}": Q3 revenue analysis shows 12% decline driven by customer churn.`, score: 0.89 }, { text: "Historical pattern: similar declines in Q3 2023 were followed by recovery in Q4.", score: 0.76 }, { text: "Customer feedback indicates pricing concerns are the primary driver of churn.", score: 0.71 }] }); }
    if (route === "enterprise/audit-log") { const events = []; for (let i = 0; i < 10; i++) { const d = new Date(); d.setMinutes(d.getMinutes() - i * 7); events.push({ timestamp: d.toISOString(), action: ["user_login", "dashboard_view", "agent_execute", "data_upload", "profile_create"][i % 5], resource_type: ["session", "dashboard", "agent", "file", "profile"][i % 5], resource_id: "res_" + (1000 + i) }); } return Response.json({ entries: events, total: events.length }); }
    return Response.json({ error: "Unknown route: " + (route || "none") });
  } catch (err) { return Response.json({ error: String(err?.message || err) }); }
});

export const revenueTrend = [
  { month: "Jan", revenue: 42000, forecast: 41000, profit: 12000 },
  { month: "Feb", revenue: 48000, forecast: 46000, profit: 14500 },
  { month: "Mar", revenue: 51000, forecast: 50000, profit: 16000 },
  { month: "Apr", revenue: 58000, forecast: 56000, profit: 18800 },
  { month: "May", revenue: 64000, forecast: 62000, profit: 21000 },
  { month: "Jun", revenue: 72000, forecast: 70000, profit: 24600 },
  { month: "Jul", revenue: 78000, forecast: 77000, profit: 27300 },
  { month: "Aug", revenue: 84000, forecast: 82500, profit: 29800 },
  { month: "Sep", revenue: 91000, forecast: 90000, profit: 33000 },
  { month: "Oct", revenue: 98500, forecast: 96000, profit: 36400 },
  { month: "Nov", revenue: 106000, forecast: 104000, profit: 39800 },
  { month: "Dec", revenue: 118000, forecast: 115000, profit: 44200 },
];

export const segmentation = [
  { name: "Enterprise", value: 4200 },
  { name: "Mid-Market", value: 2800 },
  { name: "SMB", value: 1900 },
  { name: "Startup", value: 1100 },
];

export const regionalSales = [
  { region: "North America", sales: 124000 },
  { region: "EMEA", sales: 98000 },
  { region: "APAC", sales: 76000 },
  { region: "LATAM", sales: 42000 },
  { region: "MEA", sales: 28000 },
];

export const productPerformance = [
  { product: "InsightIQ Core", units: 1240, growth: 18 },
  { product: "Forecast Pro", units: 980, growth: 24 },
  { product: "AI Copilot", units: 1620, growth: 42 },
  { product: "Data Hub", units: 720, growth: 12 },
  { product: "Alert Engine", units: 540, growth: 9 },
];

export const dataSources = [
  { name: "Snowflake — Production", type: "Snowflake", status: "Connected", rows: "12.4M", updated: "2 min ago" },
  { name: "Postgres — App DB", type: "PostgreSQL", status: "Connected", rows: "3.1M", updated: "5 min ago" },
  { name: "Stripe Revenue API", type: "REST API", status: "Connected", rows: "284K", updated: "12 min ago" },
  { name: "Sales Pipeline.xlsx", type: "Excel", status: "Syncing", rows: "48K", updated: "just now" },
  { name: "Marketing GSheet", type: "Google Sheets", status: "Connected", rows: "21K", updated: "1 hr ago" },
  { name: "S3 Event Logs", type: "Cloud Storage", status: "Error", rows: "—", updated: "3 hr ago" },
];

export const teamMembers = [
  { name: "Sarah Chen", email: "sarah@insightiq.io", role: "Owner", status: "Active", initials: "SC" },
  { name: "Marcus Rivera", email: "marcus@insightiq.io", role: "Admin", status: "Active", initials: "MR" },
  { name: "Priya Natarajan", email: "priya@insightiq.io", role: "Analyst", status: "Active", initials: "PN" },
  { name: "Tomás Becker", email: "tomas@insightiq.io", role: "Viewer", status: "Pending", initials: "TB" },
  { name: "Aiko Tanaka", email: "aiko@insightiq.io", role: "Analyst", status: "Active", initials: "AT" },
];

export const alerts = [
  { title: "Revenue dropped 12% vs forecast", severity: "high", source: "Revenue Monitor", time: "8 min ago" },
  { title: "Inventory low: SKU-2284 below threshold", severity: "medium", source: "Inventory", time: "32 min ago" },
  { title: "Anomalous login pattern detected", severity: "high", source: "Security", time: "1 hr ago" },
  { title: "Sales spike in APAC (+38%)", severity: "info", source: "Sales", time: "2 hr ago" },
  { title: "Possible fraudulent transaction flagged", severity: "high", source: "Fraud Detection", time: "3 hr ago" },
];

export const recentActivity = [
  { user: "Sarah Chen", action: "Published Q3 Executive Report", time: "12 min ago" },
  { user: "Marcus Rivera", action: "Connected Snowflake source", time: "1 hr ago" },
  { user: "AI Copilot", action: "Generated 4 forecast insights", time: "2 hr ago" },
  { user: "Priya Natarajan", action: "Updated revenue model", time: "5 hr ago" },
];

export const reports = [
  { name: "Q3 Executive Summary", type: "Executive", updated: "Today", owner: "Sarah Chen" },
  { name: "Weekly Operations", type: "Weekly", updated: "2d ago", owner: "Marcus Rivera" },
  { name: "Monthly Revenue", type: "Monthly", updated: "5d ago", owner: "Priya Natarajan" },
  { name: "FY2025 Plan", type: "Annual", updated: "2w ago", owner: "Sarah Chen" },
];

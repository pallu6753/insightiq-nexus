import type { Row } from "./types";

function rand(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function makeSales(): Row[] {
  const r = rand(42);
  const products = ["InsightIQ Core", "AI Copilot", "Forecast Pro", "Data Hub", "Alert Engine"];
  const regions = ["North America", "EMEA", "APAC", "LATAM", "MEA"];
  const segments = ["Enterprise", "Mid-Market", "SMB", "Startup"];
  const rows: Row[] = [];
  const start = Date.parse("2024-01-01");
  for (let i = 0; i < 1200; i++) {
    const date = new Date(start + i * 86400000 * 0.35 + r() * 86400000);
    const units = Math.floor(5 + r() * 80);
    const price = 120 + r() * 480;
    rows.push({
      order_id: `ORD-${10000 + i}`,
      date: date.toISOString().slice(0, 10),
      product: products[Math.floor(r() * products.length)],
      region: regions[Math.floor(r() * regions.length)],
      segment: segments[Math.floor(r() * segments.length)],
      units,
      unit_price: Math.round(price * 100) / 100,
      revenue: Math.round(units * price * 100) / 100,
      profit: Math.round(units * price * (0.2 + r() * 0.2) * 100) / 100,
    });
  }
  return rows;
}

function makeFinance(): Row[] {
  const r = rand(7);
  const categories = ["Payroll", "Marketing", "R&D", "Ops", "SG&A", "Cloud"];
  const rows: Row[] = [];
  for (let y = 2023; y <= 2025; y++) {
    for (let m = 1; m <= 12; m++) {
      for (const cat of categories) {
        rows.push({
          month: `${y}-${String(m).padStart(2, "0")}`,
          category: cat,
          budget: Math.round((40000 + r() * 60000)),
          actual: Math.round((40000 + r() * 65000)),
          variance_pct: Math.round((r() - 0.5) * 200) / 10,
        });
      }
    }
  }
  return rows;
}

function makeHR(): Row[] {
  const r = rand(19);
  const depts = ["Engineering", "Sales", "Marketing", "Support", "People", "Finance"];
  const levels = ["IC1", "IC2", "IC3", "IC4", "Manager", "Director", "VP"];
  const rows: Row[] = [];
  for (let i = 0; i < 320; i++) {
    rows.push({
      employee_id: `EMP-${1000 + i}`,
      department: depts[Math.floor(r() * depts.length)],
      level: levels[Math.floor(r() * levels.length)],
      salary: Math.round(70000 + r() * 180000),
      tenure_years: Math.round(r() * 8 * 10) / 10,
      performance: Math.round((3 + r() * 2) * 10) / 10,
      is_remote: r() > 0.5,
    });
  }
  return rows;
}

function makeMarketing(): Row[] {
  const r = rand(88);
  const channels = ["Google", "LinkedIn", "Meta", "Email", "Organic", "Referral", "Events"];
  const campaigns = ["Q1 Launch", "AI Copilot Beta", "Enterprise ABM", "SMB Growth", "Retention"];
  const rows: Row[] = [];
  const start = Date.parse("2024-06-01");
  for (let i = 0; i < 800; i++) {
    const impressions = Math.floor(1000 + r() * 40000);
    const clicks = Math.floor(impressions * (0.005 + r() * 0.04));
    const conversions = Math.floor(clicks * (0.01 + r() * 0.08));
    const spend = Math.round((100 + r() * 4900) * 100) / 100;
    rows.push({
      date: new Date(start + i * 86400000 * 0.5).toISOString().slice(0, 10),
      channel: channels[Math.floor(r() * channels.length)],
      campaign: campaigns[Math.floor(r() * campaigns.length)],
      impressions,
      clicks,
      conversions,
      spend,
      revenue: Math.round(conversions * (200 + r() * 1200) * 100) / 100,
    });
  }
  return rows;
}

function makeInventory(): Row[] {
  const r = rand(313);
  const warehouses = ["WH-NA-01", "WH-EU-01", "WH-APAC-01", "WH-LATAM-01"];
  const categories = ["Hardware", "Accessories", "Consumables", "Kits"];
  const rows: Row[] = [];
  for (let i = 0; i < 500; i++) {
    const stock = Math.floor(r() * 800);
    rows.push({
      sku: `SKU-${2000 + i}`,
      category: categories[Math.floor(r() * categories.length)],
      warehouse: warehouses[Math.floor(r() * warehouses.length)],
      on_hand: stock,
      reorder_point: 50 + Math.floor(r() * 150),
      unit_cost: Math.round((5 + r() * 200) * 100) / 100,
      last_restock: new Date(Date.now() - r() * 86400000 * 120).toISOString().slice(0, 10),
    });
  }
  return rows;
}

export const SAMPLE_DATASETS: Array<{ id: string; name: string; build: () => Row[] }> = [
  { id: "sample-sales", name: "Sales — 2024 Orders", build: makeSales },
  { id: "sample-finance", name: "Finance — Budget vs Actual", build: makeFinance },
  { id: "sample-hr", name: "HR — Headcount", build: makeHR },
  { id: "sample-marketing", name: "Marketing — Campaign Performance", build: makeMarketing },
  { id: "sample-inventory", name: "Inventory — Stock Levels", build: makeInventory },
];

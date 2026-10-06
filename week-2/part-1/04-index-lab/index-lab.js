// NJ-W2-04 — insert 100k tasks, compare explain() before/after an index, and measure what the index costs.
// Run: npm run w2:index-lab   (uses its own database, nj_w2_lab, so the seed data is untouched)

const lab = db.getSiblingDB(process.env.LAB_DB_NAME || 'nj_w2_lab');
const col = lab.tasks_big;
const TOTAL = 100_000;
const BATCH = 10_000;

// Seeded pseudo-random numbers, so every run produces the same data.
let seed = 42;
const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const STATUSES = ['todo', 'in_progress', 'done'];
const TAGS = ['backend', 'frontend', 'auth', 'api', 'bug', 'docs', 'testing'];
const START = new Date('2026-01-01').getTime();
const DAY = 24 * 60 * 60 * 1000;

const makeDocs = (count, offset) => Array.from({ length: count }, (_, i) => ({
  title: `Task #${offset + i}`,
  status: pick(STATUSES),
  priority: 1 + Math.floor(rand() * 5),
  dueDate: new Date(START + Math.floor(rand() * 365) * DAY),
  tags: [pick(TAGS), pick(TAGS)],
  estimateHours: 1 + Math.floor(rand() * 8),
  createdAt: new Date(START + Math.floor(rand() * 300) * DAY),
}));

const timeIt = (fn) => {
  const t = Date.now();
  fn();
  return Date.now() - t;
};

// Collect every stage name in the winning plan (handles classic and SBE explain formats).
const stages = (node, out = []) => {
  if (!node) return out;
  if (node.stage) out.push(node.stage + (node.indexName ? `(${node.indexName})` : ''));
  if (node.inputStage) stages(node.inputStage, out);
  (node.inputStages || []).forEach((s) => stages(s, out));
  return out;
};

const report = (label, cursor) => {
  const ex = cursor.explain('executionStats');
  const wp = ex.queryPlanner.winningPlan;
  const s = ex.executionStats;
  print(`\n${label}`);
  print(`  plan:              ${stages(wp.queryPlan || wp).join(' <- ')}`);
  print(`  nReturned:         ${s.nReturned}`);
  print(`  totalKeysExamined: ${s.totalKeysExamined}`);
  print(`  totalDocsExamined: ${s.totalDocsExamined}`);
  print(`  executionTimeMs:   ${s.executionTimeMillis}`);
};

// Write cost: time inserting 10k extra docs, then remove them again.
const writeCost = () => {
  const docs = makeDocs(BATCH, TOTAL).map((doc) => ({ ...doc, scratch: true }));
  const ms = timeIt(() => col.insertMany(docs, { ordered: false }));
  col.deleteMany({ scratch: true });
  return ms;
};

// ---------- 1. Insert 100k docs ----------
col.drop();
const insertMs = timeIt(() => {
  for (let offset = 0; offset < TOTAL; offset += BATCH) col.insertMany(makeDocs(BATCH, offset), { ordered: false });
});
print(`Inserted ${col.countDocuments()} docs in ${insertMs} ms`);

// The query under test: "urgent todo tasks, soonest due first"
const filter = { status: 'todo', priority: 5 };
const sort = { dueDate: 1 };

// ---------- 2. Before ----------
report('BEFORE index — find(status todo, priority 5).sort(dueDate)', col.find(filter).sort(sort));
const writeBefore = writeCost();

// ---------- 3. Create a compound index (ESR: Equality fields, then Sort field) ----------
const buildMs = timeIt(() => col.createIndex({ status: 1, priority: 1, dueDate: 1 }, { name: 'status_priority_dueDate' }));
print(`\nCreated index status_priority_dueDate in ${buildMs} ms`);

// ---------- 4. After ----------
report('AFTER index — same query', col.find(filter).sort(sort));
report('AFTER index — find(priority 5) only (no status prefix)', col.find({ priority: 5 }));

// ---------- 5. Cost ----------
const writeAfter = writeCost();
const sizes = col.stats().indexSizes;
print('\nCOST');
print(`  index size:              ${(sizes.status_priority_dueDate / 1024).toFixed(0)} KB (data: ${(col.stats().size / 1024 / 1024).toFixed(1)} MB)`);
print(`  insert 10k, no index:    ${writeBefore} ms`);
print(`  insert 10k, with index:  ${writeAfter} ms`);

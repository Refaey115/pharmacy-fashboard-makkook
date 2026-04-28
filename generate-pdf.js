// generate-pdf.js
// Reads the Claude conversation JSONL and produces a clean PDF
// Run with: node generate-pdf.js

const fs   = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// ── Config ────────────────────────────────────────────────
const JSONL_PATH = path.join(
  process.env.USERPROFILE,
  '.claude', 'projects',
  'C--Users-hp-Desktop-To-do-list',
  'd1d2ef93-1997-4ea0-80ee-75f330f44732.jsonl'
);
const OUT_PATH = path.join(process.env.USERPROFILE, 'Desktop', 'makkook-pharmacy-dashboard-conversation.pdf');

// ── Colours ───────────────────────────────────────────────
const C = {
  accent:   '#E1541D',
  dark:     '#1a1a1a',
  mid:      '#444444',
  light:    '#888888',
  border:   '#dddddd',
  userBg:   '#FFF8F5',
  asstBg:   '#F7F9FF',
  white:    '#ffffff',
};

// ── Helpers ───────────────────────────────────────────────
function getText(msg) {
  const content = msg.message && msg.message.content;
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(c => c.type === 'text')
      .map(c => c.text || '')
      .join('\n');
  }
  return '';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) +
    '  ' + d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

// Condense long code blocks to a single summary line
function condenseText(text) {
  // Replace code fences that span more than 8 lines with a summary
  return text.replace(/```[\w]*\n([\s\S]*?)```/g, (match, code) => {
    const lines = code.trim().split('\n');
    if (lines.length <= 8) return match; // keep short blocks
    // Try to guess filename from nearby context — just summarise
    return `[Code block: ${lines.length} lines]`;
  });
}

// ── Load messages ─────────────────────────────────────────
const raw   = fs.readFileSync(JSONL_PATH, 'utf8').split('\n').filter(Boolean);
const parsed = raw.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

const messages = parsed
  .filter(p => (p.type === 'user' || p.type === 'assistant') && getText(p).trim().length > 10)
  .map(p => ({
    role:      p.type,
    timestamp: p.timestamp || '',
    text:      condenseText(getText(p).trim()),
  }));

console.log(`Found ${messages.length} messages. Building PDF…`);

// ── Build PDF ─────────────────────────────────────────────
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 60, bottom: 60, left: 60, right: 60 },
  info: {
    Title:   'Makkook Pharmacy Dashboard — Build Conversation',
    Author:  'Makkook.AI',
    Subject: 'Full project conversation log',
  },
});

const stream = fs.createWriteStream(OUT_PATH);
doc.pipe(stream);

const W = doc.page.width - 120; // usable width

// ── Title page ────────────────────────────────────────────
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#212121');

// Orange accent bar
doc.rect(0, 0, 8, doc.page.height).fill(C.accent);

// Logo text
doc.fontSize(28).fillColor(C.accent).font('Helvetica-Bold')
   .text('MAKKOOK.AI', 80, 200, { align: 'left' });

doc.fontSize(18).fillColor(C.white).font('Helvetica')
   .text('Pharmacy Dashboard', 80, 240);

doc.moveDown(0.5);
doc.fontSize(13).fillColor('#aaaaaa')
   .text('Build Conversation Log', 80, doc.y);

// Divider
doc.rect(80, doc.y + 24, W, 1).fill(C.accent);

doc.fontSize(11).fillColor('#888888')
   .text(`${messages.length} exchanges  ·  Project: makkook-pharmacy-dashboard`, 80, doc.y + 36);

doc.fontSize(11).fillColor('#888888')
   .text(`Generated: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}`, 80, doc.y + 16);

// Contents summary
const userCount = messages.filter(m => m.role === 'user').length;
const asstCount = messages.filter(m => m.role === 'assistant').length;
doc.fontSize(11).fillColor('#888888')
   .text(`User messages: ${userCount}   ·   Assistant messages: ${asstCount}`, 80, doc.y + 16);

doc.addPage();

// ── Helper: draw one message bubble ──────────────────────
function drawMessage(role, timestamp, text) {
  const isUser = role === 'user';
  const label  = isUser ? 'YOU' : 'CLAUDE';
  const labelColor = isUser ? C.accent : '#3B82F6';
  const bgColor    = isUser ? C.userBg : C.asstBg;
  const borderColor = isUser ? '#FDDDD2' : '#DBEAFE';

  // Check remaining space — add page if < 120pt left
  const remaining = doc.page.height - doc.page.margins.bottom - doc.y;
  if (remaining < 120) doc.addPage();

  const startY = doc.y;

  // Label row
  doc.fontSize(9).fillColor(labelColor).font('Helvetica-Bold')
     .text(label, 60, startY, { continued: true });

  doc.fontSize(9).fillColor(C.light).font('Helvetica')
     .text(`   ${formatDate(timestamp)}`, { continued: false });

  doc.moveDown(0.25);

  // Measure text height to draw background rect
  const textY = doc.y;

  // Background box (we'll draw it after measuring — use a simple approach)
  doc.rect(58, textY - 6, W + 4, 4).fill(bgColor); // top cap

  // Body text
  doc.fontSize(10).fillColor(C.dark).font('Helvetica')
     .text(text, 60, textY, {
       width: W,
       lineGap: 3,
     });

  const endY = doc.y;

  // Draw left accent line
  doc.rect(58, textY - 6, 3, endY - textY + 18)
     .fill(isUser ? C.accent : '#3B82F6');

  // Bottom separator
  doc.moveDown(0.8);
  doc.rect(60, doc.y, W, 0.5).fill(C.border);
  doc.moveDown(0.8);
}

// ── Page header (repeated on each page via event) ─────────
doc.on('pageAdded', () => {
  doc.rect(0, 0, doc.page.width, 36).fill('#212121');
  doc.rect(0, 0, doc.page.width, 36).fill('#212121');
  doc.fontSize(9).fillColor(C.accent).font('Helvetica-Bold')
     .text('MAKKOOK.AI', 60, 13, { continued: true });
  doc.fillColor('#888888').font('Helvetica')
     .text('  ·  Pharmacy Dashboard — Build Conversation', { continued: false });
  doc.y = 52;
});

// Trigger header on first content page
doc.rect(0, 0, doc.page.width, 36).fill('#212121');
doc.fontSize(9).fillColor(C.accent).font('Helvetica-Bold')
   .text('MAKKOOK.AI', 60, 13, { continued: true });
doc.fillColor('#888888').font('Helvetica')
   .text('  ·  Pharmacy Dashboard — Build Conversation', { continued: false });
doc.y = 52;

// ── Write all messages ────────────────────────────────────
messages.forEach((m, i) => {
  // Section break every 10 exchanges
  if (i > 0 && i % 20 === 0) {
    doc.addPage();
  }
  drawMessage(m.role, m.timestamp, m.text);
});

// ── Final page ────────────────────────────────────────────
doc.addPage();
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#212121');
doc.rect(0, 0, 8, doc.page.height).fill(C.accent);

doc.fontSize(20).fillColor(C.white).font('Helvetica-Bold')
   .text('End of Conversation Log', 80, 300, { align: 'left' });

doc.fontSize(12).fillColor('#888888').font('Helvetica')
   .text(`Total exchanges: ${messages.length}`, 80, doc.y + 20);
doc.text(`Project: makkook-pharmacy-dashboard`, 80, doc.y + 12);
doc.text(`Powered by Makkook.AI`, 80, doc.y + 12);

doc.end();

stream.on('finish', () => {
  console.log(`\n✓ PDF saved to:\n  ${OUT_PATH}\n`);
});
stream.on('error', err => {
  console.error('Error writing PDF:', err);
});

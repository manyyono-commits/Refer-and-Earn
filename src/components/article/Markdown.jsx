import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import styles from './Article.module.css';

/*
 * Small, safe Markdown renderer for blog posts. Produces React elements only
 * (no innerHTML), so pasted content can never inject scripts.
 *
 * Blocks:  # / ## heading (H2), ### H3, #### H4, paragraphs, - or * lists,
 *          1. numbered lists, > note box, >! warning box, | tables |,
 *          ![alt](image-url) on its own line, --- divider.
 * Inline:  **bold**, *italic*, `code`, [text](url).
 */

const SAFE_URL = /^(https?:\/\/|\/|#|mailto:)/i;

function Inline({ text }) {
  const out = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = k++;
    if (m[1] != null) out.push(<strong key={key}><Inline text={m[1]} /></strong>);
    else if (m[2] != null) out.push(<em key={key}><Inline text={m[2]} /></em>);
    else if (m[3] != null) out.push(<code key={key}>{m[3]}</code>);
    else {
      const [label, href] = [m[4], m[5]];
      if (!SAFE_URL.test(href)) out.push(label);
      else if (href.startsWith('/')) out.push(<Link key={key} to={href}>{label}</Link>);
      else
        out.push(
          <a key={key} href={href} target={href.startsWith('#') ? undefined : '_blank'} rel="noopener noreferrer">
            {label}
          </a>,
        );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
const LIST_UL = /^\s*[-*+]\s+/;
const LIST_OL = /^\s*\d+[.)]\s+/;
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

/** Splits Markdown into block objects. */
export function parseBlocks(src) {
  const lines = String(src ?? '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }
    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      blocks.push({ type: 'h', level: Math.max(2, h[1].length), text: h[2].replace(/\s+#+$/, '') });
      i++;
    } else if (/^(-{3,}|\*{3,})$/.test(t)) {
      blocks.push({ type: 'hr' });
      i++;
    } else if (IMAGE.test(t)) {
      const [, alt, src2] = t.match(IMAGE);
      blocks.push({ type: 'img', alt, src: src2 });
      i++;
    } else if (isTableRow(t) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = cells(t);
      const rows = [];
      i += 2;
      while (i < lines.length && isTableRow(lines[i])) rows.push(cells(lines[i++]));
      blocks.push({ type: 'table', head, rows });
    } else if (t.startsWith('>')) {
      const warn = t.startsWith('>!');
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        buf.push(lines[i].trim().replace(/^>!?\s?/, ''));
        i++;
      }
      blocks.push({ type: warn ? 'warning' : 'note', text: buf.join(' ') });
    } else if (LIST_UL.test(line) || LIST_OL.test(line)) {
      const ordered = LIST_OL.test(line);
      const re = ordered ? LIST_OL : LIST_UL;
      const items = [];
      while (i < lines.length && re.test(lines[i])) {
        let item = lines[i].replace(re, '');
        i++;
        // Indented continuation lines belong to the item.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !LIST_UL.test(lines[i]) && !LIST_OL.test(lines[i])) {
          item += ` ${lines[i].trim()}`;
          i++;
        }
        items.push(item.trim());
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items });
    } else {
      // Always take the current line, so a stray "| ... |" line can't stall the parser.
      const buf = [t];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^(#{1,4})\s/.test(lines[i].trim()) &&
        !lines[i].trim().startsWith('>') &&
        !LIST_UL.test(lines[i]) &&
        !LIST_OL.test(lines[i]) &&
        !isTableRow(lines[i]) &&
        !IMAGE.test(lines[i].trim())
      ) {
        buf.push(lines[i].trim());
        i++;
      }
      blocks.push({ type: 'p', text: buf.join(' ') });
    }
  }
  return blocks;
}

function Block({ b }) {
  switch (b.type) {
    case 'h': {
      const Tag = `h${b.level}`;
      return <Tag className={b.level > 2 ? styles.sub : undefined}><Inline text={b.text} /></Tag>;
    }
    case 'hr':
      return <hr className={styles.hr} />;
    case 'img':
      return SAFE_URL.test(b.src) ? (
        <figure className={styles.figure}>
          <img src={b.src} alt={b.alt} loading="lazy" decoding="async" />
          {b.alt && <figcaption>{b.alt}</figcaption>}
        </figure>
      ) : null;
    case 'table':
      return (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>{b.head.map((c, i) => <th key={i} scope="col"><Inline text={c} /></th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={ri}>{r.map((c, ci) => <td key={ci}><Inline text={c} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'note':
    case 'warning':
      return <p className={b.type === 'note' ? styles.note : styles.warning}><Inline text={b.text} /></p>;
    case 'ul':
    case 'ol': {
      const Tag = b.type;
      return (
        <Tag className={styles.list} style={b.type === 'ol' ? { listStyle: 'decimal' } : undefined}>
          {b.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}
        </Tag>
      );
    }
    default:
      return <p><Inline text={b.text} /></p>;
  }
}

export default function Markdown({ source }) {
  return parseBlocks(source).map((b, i) => <Block key={i} b={b} />);
}

import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBold,
  FaEye,
  FaHeading,
  FaImage,
  FaItalic,
  FaLink,
  FaListOl,
  FaListUl,
  FaPen,
  FaPlus,
  FaRegStickyNote,
  FaSave,
  FaTable,
  FaTrash,
  FaUpload,
} from 'react-icons/fa';
import { slugify } from '../../../utils/slugify';
import { getErrorMessage, useUploadBlogImageMutation } from '../../../services/adminApi';
import PostView from '../../Blog/PostView';
import ImageField from './ImageField';
import styles from '../Admin.module.css';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SITE = 'https://manyyonogames.com';

export const EMPTY_POST = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  coverImageAlt: '',
  author: '',
  category: '',
  tags: '',
  faqs: [],
  status: 'draft',
  publishedAt: '',
  seo: {
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    twitterTitle: '',
    twitterDescription: '',
    ogImage: '',
    canonical: '',
    noindex: false,
  },
};

/** Date → value for <input type="datetime-local"> in the admin's own time zone. */
export const toLocalInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toPayload = (v, status) => ({
  ...v,
  status,
  tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean),
  faqs: v.faqs.filter((f) => f.q.trim() || f.a.trim()),
  publishedAt: v.publishedAt ? new Date(v.publishedAt).toISOString() : null,
});

const validate = (v) => {
  const e = {};
  if (!v.title.trim()) e.title = 'Title is required.';
  if (!SLUG_RE.test(v.slug)) e.slug = 'Use lowercase letters, numbers and single hyphens.';
  if (v.faqs.some((f) => (f.q.trim() || f.a.trim()) && !(f.q.trim() && f.a.trim()))) {
    e.faqs = 'Every FAQ needs both a question and an answer.';
  }
  return e;
};

/** Character counter with a soft recommended limit. */
function Counter({ value, max }) {
  const n = value.length;
  return (
    <small className={n > max ? styles.fieldError : styles.help}>
      {n}/{max} characters{n > max ? ' — may be cut off in search results' : ''}
    </small>
  );
}

// Markdown snippets inserted by the toolbar.
const SNIPPETS = {
  h2: { before: '\n## ', after: '\n', placeholder: 'Section heading' },
  h3: { before: '\n### ', after: '\n', placeholder: 'Sub-heading' },
  bold: { before: '**', after: '**', placeholder: 'bold text' },
  italic: { before: '*', after: '*', placeholder: 'italic text' },
  link: { before: '[', after: '](https://)', placeholder: 'link text' },
  ul: { before: '\n- ', after: '\n- Item two\n', placeholder: 'Item one' },
  ol: { before: '\n1. ', after: '\n2. Step two\n', placeholder: 'Step one' },
  note: { before: '\n> ', after: '\n', placeholder: 'Helpful note shown in a blue box' },
  warning: { before: '\n>! ', after: '\n', placeholder: 'Important warning shown in a yellow box' },
  table: {
    before: '\n| Column 1 | Column 2 |\n| --- | --- |\n| ',
    after: ' | Value |\n',
    placeholder: 'Value',
  },
};

export default function PostForm({ initialValues, isEdit, onSubmit, isSubmitting, serverError, viewUrl }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [slugLocked, setSlugLocked] = useState(Boolean(initialValues.slug));
  const [tab, setTab] = useState('write');
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef(null);
  const imageInputRef = useRef(null);
  const [uploadImage, { isLoading: uploadingInline }] = useUploadBlogImageMutation();

  const set = (field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !slugLocked) next.slug = slugify(value);
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };
  const setSeo = (field, value) => {
    setValues((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }));
    setErrors((prev) => ({ ...prev, [`seo.${field}`]: undefined }));
  };
  const bind = (field) => ({
    name: field,
    value: values[field],
    onChange: (e) => set(field, e.target.value),
    'aria-invalid': Boolean(errors[field]),
  });
  const bindSeo = (field) => ({
    name: `seo.${field}`,
    value: values.seo[field],
    onChange: (e) => setSeo(field, e.target.value),
    'aria-invalid': Boolean(errors[`seo.${field}`]),
  });
  const fieldError = (key) => errors[key] && <small className={styles.fieldError}>{errors[key]}</small>;

  // ---------- Content editor helpers ----------
  const insert = (before, after = '', placeholder = '') => {
    const el = contentRef.current;
    const text = values.content;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const selected = text.slice(start, end) || placeholder;
    const next = text.slice(0, start) + before + selected + after + text.slice(end);
    set('content', next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };
  const snippet = (key) => {
    const s = SNIPPETS[key];
    insert(s.before, s.after, s.placeholder);
  };

  const handleInlineImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setErrors((p) => ({ ...p, content: 'Image must be 2 MB or smaller.' }));
    try {
      const { url } = await uploadImage(file).unwrap();
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      insert(`\n![${alt}](${url})\n`, '', '');
    } catch (err) {
      setErrors((p) => ({ ...p, content: getErrorMessage(err, 'Upload failed.') }));
    }
  };

  // ---------- FAQs ----------
  const setFaq = (i, key, value) => {
    setValues((prev) => ({ ...prev, faqs: prev.faqs.map((f, j) => (j === i ? { ...f, [key]: value } : f)) }));
    setErrors((prev) => ({ ...prev, faqs: undefined }));
  };
  const addFaq = () => setValues((prev) => ({ ...prev, faqs: [...prev.faqs, { q: '', a: '' }] }));
  const removeFaq = (i) => setValues((prev) => ({ ...prev, faqs: prev.faqs.filter((_, j) => j !== i) }));

  // ---------- Submit ----------
  const submit = async (status) => {
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    try {
      await onSubmit(toPayload(values, status));
    } catch (err) {
      if (err?.data?.fields) setErrors(err.data.fields);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ---------- Search preview ----------
  const seoTitle = values.seo.title || values.title || 'Post title';
  const seoDesc = values.seo.description || values.excerpt || 'Add a meta description or excerpt to control this text.';
  const previewPost = {
    ...values,
    tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
    faqs: values.faqs.filter((f) => f.q && f.a),
    publishedAt: values.publishedAt || new Date().toISOString(),
  };

  return (
    <form className={styles.formGrid} onSubmit={(e) => { e.preventDefault(); submit('published'); }} noValidate>
      <div className={styles.formMain}>
        {serverError && (
          <div className={styles.errorBanner} role="alert">
            {serverError}
          </div>
        )}

        <fieldset className={styles.card}>
          <legend>Post details</legend>
          <label className={styles.field}>
            <span>Title (H1) *</span>
            <input type="text" maxLength={200} {...bind('title')} autoFocus={!isEdit} />
            {fieldError('title')}
          </label>
          <label className={styles.field}>
            <span>URL slug *</span>
            <div className={styles.prefixInput}>
              <span>/blog/</span>
              <input
                type="text"
                maxLength={120}
                {...bind('slug')}
                onChange={(e) => {
                  setSlugLocked(true);
                  set('slug', e.target.value.toLowerCase());
                }}
              />
            </div>
            <small className={styles.help}>{SITE}/blog/{values.slug || 'your-post'}/</small>
            {fieldError('slug')}
          </label>
          <label className={styles.field}>
            <span>Excerpt</span>
            <textarea rows={3} maxLength={500} {...bind('excerpt')} />
            <small className={styles.help}>
              Short summary for the blog list. Also used as the meta description if you leave that empty.
            </small>
            {fieldError('excerpt')}
          </label>
        </fieldset>

        <fieldset className={styles.card}>
          <legend>Featured image</legend>
          <ImageField
            label="Cover image"
            value={values.coverImage}
            onChange={(url) => set('coverImage', url)}
            error={errors.coverImage}
            onError={(msg) => setErrors((p) => ({ ...p, coverImage: msg }))}
            help="1200×630 px recommended (also used for social sharing). PNG, JPG, WEBP or GIF, up to 2 MB."
          />
          <label className={styles.field}>
            <span>Image alt text</span>
            <input type="text" maxLength={200} {...bind('coverImageAlt')} placeholder="Describe the image for search engines and screen readers" />
          </label>
        </fieldset>

        <fieldset className={styles.card}>
          <legend>Content</legend>
          <div className={styles.editorTabs} role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'write'} className={tab === 'write' ? styles.editorTabActive : styles.editorTab} onClick={() => setTab('write')}>
              <FaPen aria-hidden="true" /> Write
            </button>
            <button type="button" role="tab" aria-selected={tab === 'preview'} className={tab === 'preview' ? styles.editorTabActive : styles.editorTab} onClick={() => setTab('preview')}>
              <FaEye aria-hidden="true" /> Preview
            </button>
          </div>

          {tab === 'write' ? (
            <>
              <div className={styles.editorToolbar} aria-label="Formatting">
                <button type="button" onClick={() => snippet('h2')} title="Heading (H2)"><FaHeading /> H2</button>
                <button type="button" onClick={() => snippet('h3')} title="Sub-heading (H3)"><FaHeading /> H3</button>
                <button type="button" onClick={() => snippet('bold')} title="Bold"><FaBold /></button>
                <button type="button" onClick={() => snippet('italic')} title="Italic"><FaItalic /></button>
                <button type="button" onClick={() => snippet('link')} title="Link"><FaLink /></button>
                <button type="button" onClick={() => snippet('ul')} title="Bullet list"><FaListUl /></button>
                <button type="button" onClick={() => snippet('ol')} title="Numbered list"><FaListOl /></button>
                <button type="button" onClick={() => snippet('note')} title="Note box"><FaRegStickyNote /> Note</button>
                <button type="button" onClick={() => snippet('warning')} title="Warning box"><FaRegStickyNote /> Warning</button>
                <button type="button" onClick={() => snippet('table')} title="Table"><FaTable /></button>
                <button type="button" onClick={() => imageInputRef.current?.click()} title="Upload and insert image" disabled={uploadingInline}>
                  {uploadingInline ? <FaUpload /> : <FaImage />} {uploadingInline ? 'Uploading…' : 'Image'}
                </button>
                <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleInlineImage} hidden />
              </div>
              <textarea
                ref={contentRef}
                className={styles.editor}
                rows={24}
                {...bind('content')}
                aria-label="Post content (Markdown)"
                placeholder={'Write your post here.\n\n## Section heading\n\nA paragraph with **bold** text and a [link](/all-yono-games/).\n\n- Bullet point\n- Another point'}
              />
              <small className={styles.help}>
                Markdown: <code>## Heading</code> · <code>### Sub-heading</code> · <code>**bold**</code> · <code>*italic*</code> ·{' '}
                <code>[text](url)</code> · <code>- list</code> · <code>1. list</code> · <code>&gt; note</code> ·{' '}
                <code>&gt;! warning</code> · <code>| table |</code> · <code>![alt](image-url)</code>. The title above is the
                page&rsquo;s only H1, so start sections with <code>##</code>.
              </small>
            </>
          ) : (
            <div className={styles.previewPane}>
              <PostView post={previewPost} />
            </div>
          )}
          {fieldError('content')}
        </fieldset>

        <fieldset className={styles.card}>
          <legend>FAQs</legend>
          <p className={styles.help} style={{ marginTop: 0 }}>
            Shown at the end of the post and added as FAQ structured data for Google and AI answers.
          </p>
          {values.faqs.map((f, i) => (
            <div key={i} className={styles.faqRow}>
              <div className={styles.faqRowHead}>
                <strong>Question {i + 1}</strong>
                <button type="button" className={`${styles.iconBtn} ${styles.danger}`} onClick={() => removeFaq(i)} aria-label={`Remove question ${i + 1}`}>
                  <FaTrash />
                </button>
              </div>
              <input type="text" value={f.q} onChange={(e) => setFaq(i, 'q', e.target.value)} placeholder="Question" maxLength={300} aria-label={`Question ${i + 1}`} />
              <textarea rows={3} value={f.a} onChange={(e) => setFaq(i, 'a', e.target.value)} placeholder="Answer" maxLength={3000} aria-label={`Answer ${i + 1}`} />
            </div>
          ))}
          {fieldError('faqs')}
          <button type="button" className={styles.secondaryBtn} onClick={addFaq}>
            <FaPlus aria-hidden="true" /> Add FAQ
          </button>
        </fieldset>

        <fieldset className={styles.card}>
          <legend>SEO</legend>
          <div className={styles.serpPreview} aria-label="Google search preview">
            <div className={styles.serpUrl}>{SITE} › blog › {values.slug || 'your-post'}</div>
            <div className={styles.serpTitle}>{seoTitle}</div>
            <div className={styles.serpDesc}>{seoDesc}</div>
          </div>

          <label className={styles.field}>
            <span>SEO title</span>
            <input type="text" maxLength={200} {...bindSeo('title')} placeholder={values.title || 'Defaults to the post title'} />
            <Counter value={seoTitle} max={60} />
          </label>
          <label className={styles.field}>
            <span>Meta description</span>
            <textarea rows={3} maxLength={400} {...bindSeo('description')} placeholder={values.excerpt || 'Defaults to the excerpt'} />
            <Counter value={values.seo.description || values.excerpt} max={160} />
          </label>
          <label className={styles.field}>
            <span>Keywords</span>
            <input type="text" maxLength={500} {...bindSeo('keywords')} placeholder="Yono Games, Yono APK, Rummy Games India" />
            <small className={styles.help}>Comma-separated. Defaults to the tags.</small>
          </label>

          <details className={styles.details}>
            <summary>Social sharing (Open Graph &amp; Twitter)</summary>
            <div className={styles.row2}>
              <label className={styles.field}>
                <span>Open Graph title</span>
                <input type="text" maxLength={200} {...bindSeo('ogTitle')} placeholder="Defaults to SEO title" />
              </label>
              <label className={styles.field}>
                <span>Twitter title</span>
                <input type="text" maxLength={200} {...bindSeo('twitterTitle')} placeholder="Defaults to Open Graph title" />
              </label>
            </div>
            <div className={styles.row2}>
              <label className={styles.field}>
                <span>Open Graph description</span>
                <textarea rows={3} maxLength={400} {...bindSeo('ogDescription')} placeholder="Defaults to meta description" />
              </label>
              <label className={styles.field}>
                <span>Twitter description</span>
                <textarea rows={3} maxLength={400} {...bindSeo('twitterDescription')} placeholder="Defaults to Open Graph description" />
              </label>
            </div>
            <ImageField
              label="Social image"
              value={values.seo.ogImage}
              onChange={(url) => setSeo('ogImage', url)}
              error={errors['seo.ogImage']}
              onError={(msg) => setErrors((p) => ({ ...p, 'seo.ogImage': msg }))}
              help="Optional. Defaults to the cover image. 1200×630 px."
            />
          </details>

          <details className={styles.details}>
            <summary>Advanced</summary>
            <label className={styles.field}>
              <span>Canonical URL</span>
              <input type="url" maxLength={500} {...bindSeo('canonical')} placeholder={`${SITE}/blog/${values.slug || 'your-post'}/`} />
              <small className={styles.help}>Leave empty unless this post is a copy of another page.</small>
              {fieldError('seo.canonical')}
            </label>
            <label className={styles.checkbox}>
              <input type="checkbox" checked={values.seo.noindex} onChange={(e) => setSeo('noindex', e.target.checked)} />
              <span>Hide from search engines (noindex)</span>
            </label>
          </details>
        </fieldset>
      </div>

      <aside className={styles.formSide}>
        <fieldset className={styles.card}>
          <legend>Publish</legend>
          <p className={styles.help} style={{ marginTop: 0 }}>
            Status: <strong>{initialValues.status === 'published' ? 'Published' : 'Draft'}</strong>
          </p>
          <label className={styles.field}>
            <span>Publish date</span>
            <input type="datetime-local" {...bind('publishedAt')} />
            <small className={styles.help}>Empty = now. A future date schedules the post.</small>
            {fieldError('publishedAt')}
          </label>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
              <FaSave aria-hidden="true" />{' '}
              {isSubmitting ? 'Saving…' : initialValues.status === 'published' ? 'Update' : 'Publish'}
            </button>
            <button type="button" className={styles.secondaryBtn} disabled={isSubmitting} onClick={() => submit('draft')}>
              {initialValues.status === 'published' ? 'Unpublish (draft)' : 'Save draft'}
            </button>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.secondaryBtn} onClick={() => setShowPreview(true)}>
              <FaEye aria-hidden="true" /> Full preview
            </button>
            {viewUrl && (
              <a href={viewUrl} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
                View live
              </a>
            )}
            <Link to="/admin/posts" className={styles.secondaryBtn}>
              Cancel
            </Link>
          </div>
        </fieldset>

        <fieldset className={styles.card}>
          <legend>Organise</legend>
          <label className={styles.field}>
            <span>Author</span>
            <input type="text" maxLength={80} {...bind('author')} placeholder="Many Yono Games" />
          </label>
          <label className={styles.field}>
            <span>Category</span>
            <input type="text" maxLength={60} {...bind('category')} placeholder="Guides" />
          </label>
          <label className={styles.field}>
            <span>Tags</span>
            <input type="text" {...bind('tags')} placeholder="yono games, apk, rummy" />
            <small className={styles.help}>Comma-separated.</small>
          </label>
        </fieldset>
      </aside>

      {showPreview && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Post preview">
          <div className={styles.modalBar}>
            <strong>Preview</strong>
            <button type="button" className={styles.secondaryBtn} onClick={() => setShowPreview(false)}>
              Close
            </button>
          </div>
          <div className={styles.modalBody}>
            <PostView post={previewPost} />
          </div>
        </div>
      )}
    </form>
  );
}

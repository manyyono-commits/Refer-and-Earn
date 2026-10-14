import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSave } from 'react-icons/fa';
import AppCard from '../../../components/common/AppCard';
import { slugify } from '../../../utils/slugify';
import IconField from './IconField';
import { EMPTY_APP } from './emptyApp';
import styles from '../Admin.module.css';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOR_RE = /^#[0-9a-f]{6}$/i;
const NUMBER_FIELDS = ['bonus', 'minWithdraw', 'rating'];

// Empty number inputs become null so the server reports them instead of silently saving 0.
const toPayload = (values) => {
  const payload = { ...values };
  for (const field of NUMBER_FIELDS) {
    payload[field] = values[field] === '' ? null : Number(values[field]);
  }
  return payload;
};

const validate = (values) => {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!SLUG_RE.test(values.slug)) errors.slug = 'Use lowercase letters, numbers and single hyphens.';
  if (values.bonus === '') errors.bonus = 'Bonus is required.';
  return errors;
};

/**
 * Shared add/edit form. `onSubmit(payload)` should return a promise that rejects
 * with the RTK Query error so server-side field errors can be shown.
 */
export default function AppForm({ initialValues = EMPTY_APP, submitLabel, onSubmit, isSubmitting, serverError }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  // While adding, the slug follows the name until the admin edits it by hand.
  const [slugLocked, setSlugLocked] = useState(Boolean(initialValues.slug));

  const set = (field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !slugLocked) next.slug = slugify(value);
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined, ...(field === 'name' ? { slug: undefined } : {}) }));
  };

  const bind = (field) => ({
    name: field,
    value: values[field],
    onChange: (e) => set(field, e.target.value),
    'aria-invalid': Boolean(errors[field]),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await onSubmit(toPayload(values));
    } catch (err) {
      if (err?.data?.fields) setErrors(err.data.fields);
    }
  };

  const fieldError = (field) => errors[field] && <small className={styles.fieldError}>{errors[field]}</small>;

  const preview = {
    ...values,
    id: 0,
    name: values.name || 'App name',
    slug: values.slug || 'preview',
    bonus: Number(values.bonus) || 0,
    minWithdraw: Number(values.minWithdraw) || 0,
  };

  return (
    <form className={styles.formGrid} onSubmit={handleSubmit} noValidate>
      <div className={styles.formMain}>
        {serverError && (
          <div className={styles.errorBanner} role="alert">
            {serverError}
          </div>
        )}

        <fieldset className={styles.card}>
          <legend>Basic details</legend>
          <div className={styles.row2}>
            <label className={styles.field}>
              <span>App name *</span>
              <input type="text" maxLength={60} {...bind('name')} autoFocus />
              {fieldError('name')}
            </label>
            <label className={styles.field}>
              <span>URL slug *</span>
              <div className={styles.prefixInput}>
                <span>/</span>
                <input
                  type="text"
                  maxLength={60}
                  {...bind('slug')}
                  onChange={(e) => {
                    setSlugLocked(true);
                    set('slug', e.target.value.toLowerCase());
                  }}
                />
              </div>
              {fieldError('slug')}
            </label>
          </div>

          <IconField
            value={values.icon}
            onChange={(url) => set('icon', url)}
            name={values.name}
            badge={values.badge}
            color={values.color}
            error={errors.icon}
            onError={(msg) => setErrors((prev) => ({ ...prev, icon: msg }))}
          />

          <div className={styles.row2}>
            <label className={styles.field}>
              <span>Badge text</span>
              <input type="text" maxLength={6} placeholder="Auto from name" {...bind('badge')} />
              <small className={styles.help}>Shown when there is no icon image.</small>
              {fieldError('badge')}
            </label>
            <label className={styles.field}>
              <span>Badge colour</span>
              <div className={styles.colorInput}>
                <input
                  type="color"
                  {...bind('color')}
                  value={COLOR_RE.test(values.color) ? values.color : '#000000'}
                  aria-label="Badge colour picker"
                />
                <input type="text" {...bind('color')} maxLength={7} aria-label="Badge colour hex" />
              </div>
              {fieldError('color')}
            </label>
          </div>

          <label className={styles.field}>
            <span>Description</span>
            <textarea rows={4} maxLength={1000} {...bind('description')} />
            <small className={styles.help}>{values.description.length}/1000 · Shown on the app page.</small>
            {fieldError('description')}
          </label>
        </fieldset>

        <fieldset className={styles.card}>
          <legend>Offer &amp; download</legend>
          <div className={styles.row2}>
            <label className={styles.field}>
              <span>Sign-up bonus (₹) *</span>
              <input type="number" min="0" step="1" inputMode="numeric" {...bind('bonus')} />
              {fieldError('bonus')}
            </label>
            <label className={styles.field}>
              <span>Min. withdrawal (₹)</span>
              <input type="number" min="0" step="1" inputMode="numeric" {...bind('minWithdraw')} />
              {fieldError('minWithdraw')}
            </label>
          </div>
          <label className={styles.field}>
            <span>Download link</span>
            <input type="url" placeholder="https://…" {...bind('downloadUrl')} />
            <small className={styles.help}>Where the download button on the app page goes.</small>
            {fieldError('downloadUrl')}
          </label>
        </fieldset>

        <fieldset className={styles.card}>
          <legend>App page stats</legend>
          <div className={styles.row4}>
            <label className={styles.field}>
              <span>Rating (0–5)</span>
              <input type="number" min="0" max="5" step="0.1" {...bind('rating')} />
              {fieldError('rating')}
            </label>
            <label className={styles.field}>
              <span>Downloads</span>
              <input type="text" maxLength={20} placeholder="10K+" {...bind('downloads')} />
              {fieldError('downloads')}
            </label>
            <label className={styles.field}>
              <span>Size</span>
              <input type="text" maxLength={20} placeholder="45 MB" {...bind('size')} />
              {fieldError('size')}
            </label>
            <label className={styles.field}>
              <span>Version</span>
              <input type="text" maxLength={20} placeholder="1.0.0" {...bind('version')} />
              {fieldError('version')}
            </label>
          </div>
        </fieldset>
      </div>

      <aside className={styles.formSide}>
        <fieldset className={styles.card}>
          <legend>Placement</legend>
          <label className={styles.field}>
            <span>Show in tab</span>
            <select {...bind('category')}>
              <option value="new">New Games</option>
              <option value="other">Other Games</option>
            </select>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => set('featured', e.target.checked)}
            />
            <span>Featured on home page</span>
          </label>
        </fieldset>

        <div className={styles.card}>
          <div className={styles.previewLabel}>Live preview</div>
          <div className={styles.previewBox}>
            <AppCard key={values.icon} app={preview} index={1} />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
            <FaSave aria-hidden="true" /> {isSubmitting ? 'Saving…' : submitLabel}
          </button>
          <Link to="/admin" className={styles.secondaryBtn}>
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}

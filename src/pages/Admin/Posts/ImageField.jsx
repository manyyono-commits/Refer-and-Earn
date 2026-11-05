import { useRef } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { getErrorMessage, useUploadBlogImageMutation } from '../../../services/adminApi';
import styles from '../Admin.module.css';

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

/** Upload a blog image, or paste a URL. Calls onChange(url). */
export default function ImageField({ label, value, onChange, error, onError, help }) {
  const inputRef = useRef(null);
  const [upload, { isLoading }] = useUploadBlogImageMutation();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES) return onError('Image must be 2 MB or smaller.');
    try {
      const { url } = await upload(file).unwrap();
      onChange(url);
      onError(undefined);
    } catch (err) {
      onError(getErrorMessage(err, 'Upload failed.'));
    }
  };

  return (
    <div className={styles.field}>
      <span>{label}</span>
      {value && <img src={value} alt="" className={styles.coverPreview} />}
      <div className={styles.iconButtons}>
        <button type="button" className={styles.secondaryBtn} onClick={() => inputRef.current?.click()} disabled={isLoading}>
          <FaUpload aria-hidden="true" /> {isLoading ? 'Uploading…' : 'Upload image'}
        </button>
        {value && (
          <button type="button" className={styles.secondaryBtn} onClick={() => onChange('')}>
            <FaTimes aria-hidden="true" /> Remove
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleFile} hidden />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste an image URL (https://…)"
        aria-label={`${label} URL`}
        aria-invalid={Boolean(error)}
      />
      {help && <small className={styles.help}>{help}</small>}
      {error && <small className={styles.fieldError}>{error}</small>}
    </div>
  );
}

import { useRef } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import AppIcon from '../../../components/common/AppIcon';
import { getErrorMessage, useUploadIconMutation } from '../../../services/adminApi';
import styles from '../Admin.module.css';

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

/** Icon picker: upload an image or paste a URL. Falls back to the coloured badge when empty. */
export default function IconField({ value, onChange, name, badge, color, error, onError }) {
  const inputRef = useRef(null);
  const [uploadIcon, { isLoading }] = useUploadIconMutation();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES) {
      onError('Image must be 2 MB or smaller.');
      return;
    }
    try {
      const { url } = await uploadIcon(file).unwrap();
      onChange(url);
      onError(undefined);
    } catch (err) {
      onError(getErrorMessage(err, 'Upload failed.'));
    }
  };

  return (
    <div className={styles.field}>
      <span>Icon</span>
      <div className={styles.iconField}>
        {/* key forces AppIcon to retry loading when the URL changes */}
        <AppIcon key={value} src={value} name={name || 'App'} badge={badge} color={color} size={72} />
        <div className={styles.iconControls}>
          <div className={styles.iconButtons}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => inputRef.current?.click()}
              disabled={isLoading}
            >
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
            aria-label="Icon URL"
            aria-invalid={Boolean(error)}
          />
          <small className={styles.help}>PNG, JPG, WEBP or GIF, up to 2 MB. Square images look best.</small>
          {error && <small className={styles.fieldError}>{error}</small>}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

export default function ImageUploadField({ label = 'Cover image', accept = 'image/*', onChange }) {
  const [preview, setPreview] = useState('');
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  function handleChange(event) {
    const file = event.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
    onChange(file);
  }
  return (
    <label className="upload-field">
      <span>{label}</span>
      <input type="file" accept={accept} onChange={handleChange} />
      {preview ? <img src={preview} alt="Selected preview" /> : <span className="upload-placeholder">Drop a file or browse</span>}
    </label>
  );
}

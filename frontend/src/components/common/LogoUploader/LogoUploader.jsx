import React, { useRef, useState } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import styles from './LogoUploader.module.css';

export function LogoUploader({ currentLogoUrl, academyName, onUpload, onRemove, disabled }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const getInitials = (name) => {
    if (!name) return 'TH';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    // Validação de tipo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setLocalError('Formato inválido. Use imagens PNG, JPEG ou WebP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validação de tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setLocalError('O arquivo ultrapassa o limite de 2MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setLocalError(err.message || 'Erro ao enviar a imagem.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (disabled || isUploading) return;
    setLocalError(null);
    setIsUploading(true);
    try {
      await onRemove();
    } catch (err) {
      setLocalError(err.message || 'Erro ao remover imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const serverHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const fullLogoUrl = currentLogoUrl 
    ? (currentLogoUrl.startsWith('http') ? currentLogoUrl : `http://${serverHost}:3001${currentLogoUrl}`)
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.avatarWrapper}>
        {fullLogoUrl ? (
          <img src={fullLogoUrl} alt={`Logo de ${academyName || 'Academia'}`} className={styles.logoImage} />
        ) : (
          <div className={styles.placeholderAvatar}>
            <span className={styles.initials}>{getInitials(academyName)}</span>
          </div>
        )}

        {isUploading && (
          <div className={styles.loadingOverlay}>
            <Loader2 className={styles.spinner} size={24} />
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp"
          className={styles.hiddenInput}
          disabled={disabled || isUploading}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={styles.uploadButton}
          disabled={disabled || isUploading}
        >
          <Camera size={16} />
          <span>{currentLogoUrl ? 'Alterar foto' : 'Enviar logotipo'}</span>
        </button>

        {currentLogoUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className={styles.removeButton}
            disabled={disabled || isUploading}
            title="Remover logotipo"
            aria-label="Remover logotipo"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {localError && <span className={styles.errorMessage}>{localError}</span>}
      <span className={styles.hint}>Formatos: PNG, JPEG ou WebP (máx. 2MB)</span>
    </div>
  );
}

import React, { useRef, useState, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import CloseButton from '../atoms/CloseButton';

/**
 * 画像プレビューコンポーネント
 * @param {Object} props - props
 * @param {Object} props.image - 画像情報
 * @param {Function} props.onClear - クリアボタンハンドラ
 * @param {Function} props.onCropChange - クロップ範囲変更ハンドラ
 * @param {Object} props.crop - クロップ範囲
 * @returns {JSX.Element} - 画像プレビューコンポーネント
 */
const ImagePreviewPanel = ({ image, onClear, crop, onCropChange }) => {
  const imgRef = useRef(null);
  const [internalCrop, setInternalCrop] = useState(
    crop || { unit: '%', width: 80, aspect: undefined }
  );

  // crop propが変わったときのみ反映
  useEffect(() => {
    setInternalCrop(crop || { unit: '%', width: 80, aspect: undefined });
  }, [crop]);

  // クロップ完了時にピクセル値も親に渡す
  const handleCropComplete = c => {
    if (imgRef.current && c.width && c.height) {
      const imageEl = imgRef.current;
      const displayWidth = imageEl.width;
      const displayHeight = imageEl.height;
      const naturalWidth = imageEl.naturalWidth;
      const naturalHeight = imageEl.naturalHeight;
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
      const pixelCrop = {
        x: Math.round(c.x * scaleX),
        y: Math.round(c.y * scaleY),
        width: Math.round(c.width * scaleX),
        height: Math.round(c.height * scaleY),
      };
      if (onCropChange) onCropChange(c, imageEl, pixelCrop);
    } else {
      if (onCropChange) onCropChange(c, imgRef.current, null);
    }
  };

  if (!image) return null;
  return (
    <div className="image-preview">
      <div style={{ position: 'relative' }}>
        <ReactCrop
          crop={internalCrop}
          onChange={c => {
            setInternalCrop(c);
            if (onCropChange) onCropChange(c, imgRef.current, null);
          }}
          onComplete={handleCropComplete}
          aspect={internalCrop.aspect}
          style={{ maxWidth: '100%', maxHeight: 500 }}
        >
          <img
            ref={imgRef}
            src={image.src}
            alt={image.name}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </ReactCrop>
        <CloseButton onClick={onClear} position="top-right" />
      </div>
    </div>
  );
};

export default ImagePreviewPanel;

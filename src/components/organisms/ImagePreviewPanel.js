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
 * @param {boolean} props.isDownloadProcessing - ダウンロード画像生成中フラグ
 * @param {number} props.downloadProgress - ダウンロード進捗（%）
 * @returns {JSX.Element} - 画像プレビューコンポーネント
 */
const ImagePreviewPanel = ({
  image,
  onClear,
  crop,
  onCropChange,
  isDownloadProcessing,
  downloadProgress,
}) => {
  const imgRef = useRef(null);
  const [internalCrop, setInternalCrop] = useState(crop);

  // crop propが変わったときのみ反映
  useEffect(() => {
    setInternalCrop(crop);
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

  // ReactCropに渡す前にundefinedを補正
  const safeCrop = {
    ...internalCrop,
    x: internalCrop.x ?? 0,
    y: internalCrop.y ?? 0,
    width: internalCrop.width ?? 1,
    height: internalCrop.height ?? 1,
  };

  if (!image) return null;
  return (
    <div className="image-preview">
      <div style={{ position: 'relative' }}>
        <ReactCrop
          crop={safeCrop}
          onChange={c => {
            setInternalCrop(c);
            if (
              onCropChange &&
              (c.x !== internalCrop.x ||
                c.y !== internalCrop.y ||
                c.width !== internalCrop.width ||
                c.height !== internalCrop.height)
            ) {
              onCropChange(c, imgRef.current, null);
            }
          }}
          onComplete={handleCropComplete}
          aspect={internalCrop.aspect}
          style={{ maxWidth: '100%', maxHeight: 500 }}
        >
          <img
            ref={imgRef}
            src={image.previewSrc || image.src}
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

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
const ImagePreviewPanel = ({ image, onClear, crop, onCropChange, showCrop = true, aspect }) => {
  const imgRef = useRef(null);
  const [internalCrop, setInternalCrop] = useState(crop);
  // 画像の表示サイズを管理
  const [imgDisplaySize, setImgDisplaySize] = useState({ width: 0, height: 0 });

  // crop propが変わったときのみ反映
  useEffect(() => {
    setInternalCrop(crop);
  }, [crop]);

  // 画像読み込み時に表示サイズを取得
  const handleImgLoad = e => {
    const el = e.target;
    setImgDisplaySize({ width: el.width, height: el.height });
  };

  // ウィンドウリサイズ時にも画像表示サイズを再取得
  useEffect(() => {
    const updateImgSize = () => {
      if (imgRef.current) {
        setImgDisplaySize({ width: imgRef.current.width, height: imgRef.current.height });
      }
    };
    window.addEventListener('resize', updateImgSize);
    updateImgSize();
    return () => window.removeEventListener('resize', updateImgSize);
  }, [image]);

  // クロップ値を画像枠内に収める補正関数
  const clampCropToImage = (crop, imgEl) => {
    if (!imgEl) return crop;
    const displayWidth = imgEl.width;
    const displayHeight = imgEl.height;
    let x = Math.max(0, crop.x ?? 0);
    let y = Math.max(0, crop.y ?? 0);
    let width = crop.width ?? 1;
    let height = crop.height ?? 1;
    // x, y, width, heightが画像枠を超えないように補正
    if (x + width > displayWidth) width = displayWidth - x;
    if (y + height > displayHeight) height = displayHeight - y;
    return { ...crop, x, y, width, height };
  };

  // クロップ値を画像枠内に収める補正関数（UI最大枠用）
  const clampCropToDisplay = crop => {
    let x = Math.max(0, crop.x ?? 0);
    let y = Math.max(0, crop.y ?? 0);
    let width = crop.width ?? 1;
    let height = crop.height ?? 1;
    if (x + width > imgDisplaySize.width) width = imgDisplaySize.width - x;
    if (y + height > imgDisplaySize.height) height = imgDisplaySize.height - y;
    width = Math.max(1, width);
    height = Math.max(1, height);
    return { ...crop, x, y, width, height };
  };

  // クロップ完了時にピクセル値も親に渡す
  const handleCropComplete = c => {
    if (imgRef.current && c.width && c.height) {
      const imageEl = imgRef.current;
      // 補正
      const clampedCrop = clampCropToImage(c, imageEl);
      const displayWidth = imageEl.width;
      const displayHeight = imageEl.height;
      const naturalWidth = imageEl.naturalWidth;
      const naturalHeight = imageEl.naturalHeight;
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
      const pixelCrop = {
        x: Math.round(clampedCrop.x * scaleX),
        y: Math.round(clampedCrop.y * scaleY),
        width: Math.round(clampedCrop.width * scaleX),
        height: Math.round(clampedCrop.height * scaleY),
      };
      if (onCropChange) onCropChange(clampedCrop, imageEl, pixelCrop);
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
        {showCrop ? (
          <ReactCrop
            crop={safeCrop}
            onChange={c => {
              // UI上の最大枠で補正
              const clampedCrop = clampCropToDisplay(c);
              setInternalCrop(clampedCrop);
              if (
                onCropChange &&
                (clampedCrop.x !== internalCrop.x ||
                  clampedCrop.y !== internalCrop.y ||
                  clampedCrop.width !== internalCrop.width ||
                  clampedCrop.height !== internalCrop.height)
              ) {
                onCropChange(clampedCrop, imgRef.current, null);
              }
            }}
            onComplete={handleCropComplete}
            aspect={aspect}
            style={{ maxWidth: '100%', maxHeight: 500 }}
          >
            <img
              ref={imgRef}
              src={image.previewSrc || image.src}
              alt={image.name}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onLoad={handleImgLoad}
            />
          </ReactCrop>
        ) : (
          <img
            ref={imgRef}
            src={image.previewSrc || image.src}
            alt={image.name}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        )}
        <CloseButton onClick={onClear} position="top-right" />
      </div>
    </div>
  );
};

export default ImagePreviewPanel;

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
 * @param {string|undefined} props.aspectRatio - アスペクト比（例: '16:9'）
 * @returns {JSX.Element} - 画像プレビューコンポーネント
 */
const ImagePreviewPanel = ({ image, onClear, crop, onCropChange, aspectRatio }) => {
  const imgRef = useRef(null);
  const [internalCrop, setInternalCrop] = useState(
    crop || { unit: '%', width: 80, aspect: undefined }
  );

  // アスペクト比が変更されたらcropのaspectも更新
  useEffect(() => {
    if (aspectRatio && aspectRatio !== 'original') {
      const [w, h] = aspectRatio.split(':').map(Number);
      setInternalCrop(prev => ({ ...prev, aspect: w / h }));
    } else {
      setInternalCrop(prev => ({ ...prev, aspect: undefined }));
    }
  }, [aspectRatio, image]);

  // 指定アスペクト比で画像中央にフィットする初期クロップ領域を計算
  const getDefaultCrop = () => {
    if (!imgRef.current || !aspectRatio || aspectRatio === 'original') {
      return { unit: '%', width: 80, aspect: undefined };
    }
    const [w, h] = aspectRatio.split(':').map(Number);
    const aspect = w / h;
    const naturalWidth = imgRef.current.naturalWidth;
    const naturalHeight = imgRef.current.naturalHeight;
    const imgAspect = naturalWidth / naturalHeight;
    let crop = { unit: 'px', aspect };
    if (aspect > imgAspect) {
      // 横長比率: 横いっぱい、縦を中央に
      crop.width = naturalWidth;
      crop.height = Math.round(naturalWidth / aspect);
      crop.x = 0;
      crop.y = Math.round((naturalHeight - crop.height) / 2);
    } else {
      // 縦長比率: 縦いっぱい、横を中央に
      crop.height = naturalHeight;
      crop.width = Math.round(naturalHeight * aspect);
      crop.y = 0;
      crop.x = Math.round((naturalWidth - crop.width) / 2);
    }
    // ReactCropは%単位が推奨なので変換
    crop.unit = '%';
    crop.x = (crop.x / naturalWidth) * 100;
    crop.y = (crop.y / naturalHeight) * 100;
    crop.width = (crop.width / naturalWidth) * 100;
    crop.height = (crop.height / naturalHeight) * 100;
    return crop;
  };

  // アスペクト比や画像が変わったときに初期クロップをセット
  useEffect(() => {
    if (image && imgRef.current) {
      if (aspectRatio && aspectRatio !== 'original') {
        setInternalCrop(getDefaultCrop());
      } else {
        setInternalCrop(crop || { unit: '%', width: 80, aspect: undefined });
      }
    }
  }, [aspectRatio, image]);

  // crop propが変わったときのみ反映
  useEffect(() => {
    setInternalCrop(crop || { unit: '%', width: 80, aspect: undefined });
  }, [crop]);

  // クロップ完了時にピクセル値も親に渡す
  const handleCropComplete = (c, percentCrop) => {
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

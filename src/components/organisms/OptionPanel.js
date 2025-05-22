import React from 'react';
import OptionGroup from '../molecules/OptionGroup';
import ColorPicker from '../atoms/ColorPicker';
import Select from '../atoms/Select';
import Button from '../atoms/Button';
import { BORDER_SIZE_OPTIONS, DEFAULT_COLORS } from '../../utils/constants';

const ASPECT_RATIO_OPTIONS = [
  { value: 1, label: '1:1' },
  { value: 21 / 9, label: '21:9' },
  { value: 16 / 9, label: '16:9' },
];

/**
 * 埋め込みオプションパネルコンポーネント
 * @param {Object} props - props
 * @param {string} props.textColor - テキスト色
 * @param {Function} props.onTextColorChange - テキスト色変更ハンドラ
 * @param {string} props.backgroundColor - 背景色
 * @param {Function} props.onBackgroundColorChange - 背景色変更ハンドラ
 * @param {number} props.borderSize - 枠線サイズ
 * @param {Function} props.onBorderSizeChange - 枠線サイズ変更ハンドラ
 * @param {Function} props.onGenerateImage - 画像生成ハンドラ
 * @param {boolean} props.isProcessing - 処理中かどうか
 * @param {boolean} props.showCrop - クロップ領域表示フラグ
 * @param {Function} props.onShowCropChange - クロップ領域表示変更ハンドラ
 * @param {number} props.aspect - アスペクト比
 * @param {Function} props.onAspectChange - アスペクト比変更ハンドラ
 * @returns {JSX.Element} - オプションパネルコンポーネント
 */
const OptionPanel = ({
  textColor,
  onTextColorChange,
  backgroundColor,
  onBackgroundColorChange,
  borderSize,
  onBorderSizeChange,
  onGenerateImage,
  isProcessing,
  showCrop,
  onShowCropChange,
  aspect,
  onAspectChange,
}) => {
  return (
    <div className="embed-options">
      <h3>オプション</h3>
      <div className="options-row">
        <OptionGroup label="テキスト色: ">
          <ColorPicker
            value={textColor}
            onChange={e => onTextColorChange(e.target.value)}
            presets={DEFAULT_COLORS.PRESET_TEXT_COLORS}
          />
        </OptionGroup>
        <OptionGroup label="背景色: ">
          <ColorPicker
            value={backgroundColor}
            onChange={e => onBackgroundColorChange(e.target.value)}
            presets={DEFAULT_COLORS.PRESET_BACKGROUND_COLORS}
          />
        </OptionGroup>
        <OptionGroup label="白枠のサイズ: ">
          <Select
            options={BORDER_SIZE_OPTIONS}
            value={borderSize}
            onChange={e => onBorderSizeChange(Number(e.target.value))}
          />
        </OptionGroup>
        <OptionGroup label="アスペクト比: ">
          <Select
            options={ASPECT_RATIO_OPTIONS}
            value={aspect}
            onChange={e => onAspectChange(Number(e.target.value))}
          />
        </OptionGroup>
        <OptionGroup label="クロップ領域を表示" isCheckbox>
          <input
            type="checkbox"
            checked={showCrop}
            onChange={e => onShowCropChange(e.target.checked)}
            style={{ marginLeft: 4 }}
          />
        </OptionGroup>
      </div>
      <div className="embed-buttons">
        <Button type="primary" onClick={onGenerateImage} disabled={isProcessing}>
          {isProcessing ? '処理中...' : '画像を生成'}
        </Button>
      </div>
    </div>
  );
};

export default OptionPanel;

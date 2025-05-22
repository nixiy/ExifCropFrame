import React from 'react';
import OptionGroup from '../molecules/OptionGroup';
import ColorPicker from '../atoms/ColorPicker';
import Select from '../atoms/Select';
import Button from '../atoms/Button';
import { BORDER_SIZE_OPTIONS, DEFAULT_COLORS } from '../../utils/constants';

/**
 * 埋め込みオプションパネルコンポーネント
 * @param {Object} props - props
 * @param {string} props.textColor - テキスト色
 * @param {Function} props.onTextColorChange - テキスト色変更ハンドラ
 * @param {string} props.backgroundColor - 背景色
 * @param {Function} props.onBackgroundColorChange - 背景色変更ハンドラ
 * @param {number} props.borderSize - 枠線サイズ
 * @param {Function} props.onBorderSizeChange - 枠線サイズ変更ハンドラ
 * @param {string} props.aspectRatio - アスペクト比
 * @param {Function} props.onAspectRatioChange - アスペクト比変更ハンドラ
 * @param {Function} props.onGenerateImage - 画像生成ハンドラ
 * @param {boolean} props.isProcessing - 処理中かどうか
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
}) => {
  return (
    <div className="embed-options">
      <h3>埋め込みオプション</h3>
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
      <div className="embed-buttons">
        <Button type="primary" onClick={onGenerateImage} disabled={isProcessing}>
          {isProcessing ? '処理中...' : '画像を生成'}
        </Button>
      </div>
    </div>
  );
};

export default OptionPanel;

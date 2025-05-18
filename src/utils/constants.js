/**
 * デフォルトで選択されるEXIFタグ
 */
export const DEFAULT_SELECTED_TAGS = [
  'Make',
  'Model',
  'ExposureTime',
  'FNumber',
  'ISOSpeedRatings',
  'FocalLength',
  'LensModel',
  'LensInfo',
  'LensID',
];

/**
 * 白枠サイズのオプション
 */
export const BORDER_SIZE_OPTIONS = [
  { value: 1, label: '極細' },
  { value: 2, label: '細い' },
  { value: 3, label: '標準' },
  { value: 4, label: '太い' },
  { value: 5, label: '極太' },
];

/**
 * アスペクト比のオプション
 */
export const ASPECT_RATIO_OPTIONS = [
  { value: 'original', label: '元のサイズ' },
  { value: '32:9', label: '32:9 (スーパーウルトラワイド)' },
  { value: '21:9', label: '21:9 (シネマスコープ)' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2 (35mmフィルム)' },
  { value: '1:1', label: '1:1 (正方形)' },
];

/**
 * デフォルト色の設定
 */
export const DEFAULT_COLORS = {
  TEXT: '#ffffff', // 黒
  BACKGROUND: '#000000', // 白
  // プリセット色の追加オプション
  PRESET_TEXT_COLORS: [
    { value: '#000000', label: '黒' },
    { value: '#FFFFFF', label: '白' },
    { value: '#0000FF', label: '青' },
    { value: '#FF0000', label: '赤' },
    { value: '#007500', label: '緑' },
  ],
  PRESET_BACKGROUND_COLORS: [
    { value: '#FFFFFF', label: '白' },
    { value: '#000000', label: '黒' },
    { value: '#F0F0F0', label: '薄灰色' },
    { value: '#FFF0E0', label: '薄橙色' },
    { value: '#F0FFFF', label: '薄水色' },
  ],
};

import React from 'react';

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
 * デフォルト色の設定
 */
export const DEFAULT_COLORS = {
  TEXT: '#808080',
  BACKGROUND: '#ffffff',
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

/**
 * アスペクト比のオプション
 */
export const PORTRAIT_ASPECT_RATIOS = [
  {
    value: 1 / 5,
    label: '1:5',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 1 5" xmlns="http://www.w3.org/2000/svg">
        <rect width="1" height="5" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 1 / 4,
    label: '1:4',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 1 4" xmlns="http://www.w3.org/2000/svg">
        <rect width="1" height="4" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 1 / 3,
    label: '1:3',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 1 3" xmlns="http://www.w3.org/2000/svg">
        <rect width="1" height="3" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 1 / 2.5,
    label: '1:2.5',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 2 5" xmlns="http://www.w3.org/2000/svg">
        <rect width="2" height="5" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 9 / 21,
    label: '9:21',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 9 21" xmlns="http://www.w3.org/2000/svg">
        <rect width="9" height="21" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 9 / 16,
    label: '9:16',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 9 16" xmlns="http://www.w3.org/2000/svg">
        <rect width="9" height="16" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 3 / 4,
    label: '3:4',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 3 4" xmlns="http://www.w3.org/2000/svg">
        <rect width="3" height="4" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 2 / 3,
    label: '2:3',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 2 3" xmlns="http://www.w3.org/2000/svg">
        <rect width="2" height="3" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 1,
    label: '1:1',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg">
        <rect width="1" height="1" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
];

// 横向きのアスペクト比
export const LANDSCAPE_ASPECT_RATIOS = [
  {
    value: 1,
    label: '1:1',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg">
        <rect width="1" height="1" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 3 / 2,
    label: '3:2',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
        <rect width="3" height="2" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 4 / 3,
    label: '4:3',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 4 3" xmlns="http://www.w3.org/2000/svg">
        <rect width="4" height="3" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 16 / 9,
    label: '16:9',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 16 9" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="9" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 21 / 9,
    label: '21:9',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 21 9" xmlns="http://www.w3.org/2000/svg">
        <rect width="21" height="9" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 2.5,
    label: '2.5:1',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 5 2" xmlns="http://www.w3.org/2000/svg">
        <rect width="5" height="2" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 3,
    label: '3:1',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 3 1" xmlns="http://www.w3.org/2000/svg">
        <rect width="3" height="1" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 4,
    label: '4:1',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 4 1" xmlns="http://www.w3.org/2000/svg">
        <rect width="4" height="1" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    value: 5,
    label: '5:1',
    icon: (
      <svg className="aspect-ratio-icon" viewBox="0 0 5 1" xmlns="http://www.w3.org/2000/svg">
        <rect width="5" height="1" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
];

// アスペクト比の向き
export const ORIENTATION_OPTIONS = [
  { value: 'landscape', label: '横' },
  { value: 'portrait', label: '縦' },
];

import React from 'react';
import TagCheckbox from '../molecules/TagCheckbox';
import { JAPANESE_TAG_NAMES } from '../../utils/constants';

/**
 * EXIF情報のタグセレクターコンポーネント
 * @param {Object} props - props
 * @param {Object} props.exifData - EXIF情報
 * @param {Object} props.selectedTags - 選択されたタグ
 * @param {Function} props.onTagChange - タグ選択変更ハンドラ
 * @returns {JSX.Element} - タグセレクターコンポーネント
 */
const TagSelector = ({ exifData, selectedTags, onTagChange }) => {
  if (!exifData || Object.keys(exifData).length === 0) {
    return null;
  }

  return (
    <div className="exif-tags-selector">
      <h4>表示するExif項目を選択</h4>
      <div className="tags-list">
        {Object.keys(exifData).map(tag => {
          // 日本語表示名に変換
          const displayName = JAPANESE_TAG_NAMES[tag] || tag;

          return (
            <TagCheckbox
              key={tag}
              tag={tag}
              label={displayName}
              checked={!!selectedTags[tag]}
              onChange={(tag, isChecked) => {
                onTagChange({
                  ...selectedTags,
                  [tag]: isChecked,
                });
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TagSelector;

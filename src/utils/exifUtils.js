import ExifParser from 'exif-parser';

/**
 * EXIFデータを解析する関数
 * @param {File} file - 画像ファイル
 * @returns {Promise<Object>} - 解析されたEXIFデータ
 */
export const getExifData = file => {
  return new Promise(resolve => {
    const exifData = {};

    const fileReader = new FileReader();
    fileReader.onload = function () {
      try {
        const buffer = fileReader.result;
        const parser = ExifParser.create(buffer);
        const result = parser.parse();

        if (result && result.tags) {
          const tags = result.tags;

          // 一般的なExifタグをマッピング
          const tagMappings = {
            // 基本情報
            Make: tags.Make,
            Model: tags.Model,
            DateTime: tags.DateTimeOriginal || tags.DateTime,

            // 露出情報
            ExposureTime: tags.ExposureTime,
            FNumber: tags.FNumber,
            ISOSpeedRatings: tags.ISO,
            FocalLength: tags.FocalLength,
            ExposureProgram: tags.ExposureProgram,
            MeteringMode: tags.MeteringMode,
            Flash: tags.Flash,
            WhiteBalance: tags.WhiteBalance,

            // 解像度情報
            Resolution:
              tags.ExifImageWidth && tags.ExifImageHeight
                ? `${tags.ExifImageWidth} × ${tags.ExifImageHeight}`
                : undefined,

            // GPS情報
            GPSLatitude: tags.GPSLatitude,
            GPSLongitude: tags.GPSLongitude,
            GPSAltitude: tags.GPSAltitude,

            // レンズ情報
            LensModel: tags.LensModel || tags.LensType || tags.Lens,
          };

          // 有効なタグのみをexifDataに追加
          Object.entries(tagMappings).forEach(([key, value]) => {
            if (value !== undefined) {
              // 特定のタグのフォーマットを調整
              switch (key) {
                case 'ExposureTime':
                  // 露出時間をより読みやすい形式に変換 (例: "1/100 s")
                  if (value < 1) {
                    exifData[key] = `1/${Math.round(1 / value)}s`;
                  } else {
                    exifData[key] = `${value}s`;
                  }
                  break;
                case 'FNumber':
                  // F値をフォーマット (例: "f/2.8")
                  exifData[key] = `f/${value}`;
                  break;
                case 'FocalLength':
                  // 焦点距離をフォーマット (例: "24mm")
                  exifData[key] = `${value}mm`;
                  break;
                default:
                  exifData[key] = value;
              }
            }
          });

          // レンズ仕様情報の処理
          if (tags.LensSpecification) {
            const lens = tags.LensSpecification;
            if (Array.isArray(lens) && lens.length >= 4) {
              const minFocal = lens[0];
              const maxFocal = lens[1];
              const minFNumber = lens[2];
              const maxFNumber = lens[3];

              if (minFocal === maxFocal) {
                exifData['LensInfo'] = `${minFocal}mm f/${minFNumber}`;
              } else {
                exifData['LensInfo'] = `${minFocal}-${maxFocal}mm f/${minFNumber}-${maxFNumber}`;
              }
            }
          }

          // Sony特有のタグを処理
          if (!exifData['LensModel'] && tags.SonyLensID) {
            exifData['LensModel'] = `Sony Lens (ID: ${tags.SonyLensID})`;
          }

          // MakerNotes内のLensID（合成タグ）があれば追加
          if (tags.LensID) {
            exifData['LensID'] = tags.LensID;
          }
        }      } catch (e) {
        console.error('Exif情報の解析に失敗しました:', e);
      } finally {
        resolve(exifData);
      }
    };

    fileReader.onerror = function () {
      console.error('ファイルの読み込みに失敗しました');
      resolve(exifData);
    };

    // ファイルをArrayBufferとして読み込む
    fileReader.readAsArrayBuffer(file);
  });
};

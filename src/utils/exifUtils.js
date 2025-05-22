import ExifParser from 'exif-parser';

/**
 * EXIFデータを解析する関数
 * @param {File} file - 画像ファイル
 * @returns {Promise<Object>} - 解析されたEXIFデータ
 */
export const getExifData = file => {
  return new Promise(resolve => {
    const fileReader = new FileReader();
    fileReader.onload = function () {
      let exifData = {};
      try {
        const buffer = fileReader.result;
        exifData = parseExifFromBuffer(buffer);
      } catch (e) {
        console.error('Exif情報の解析に失敗しました:', e);
      } finally {
        resolve(exifData);
      }
    };
    fileReader.onerror = function () {
      console.error('ファイルの読み込みに失敗しました');
      resolve({});
    };
    fileReader.readAsArrayBuffer(file);
  });
};

// Exifパース処理
function parseExifFromBuffer(buffer) {
  const parser = ExifParser.create(buffer);
  const result = parser.parse();
  if (result && result.tags) {
    let exifData = mapAndFormatExifTags(result.tags);
    exifData = enrichExifData(exifData, result.tags);
    return exifData;
  }
  return {};
}

// Exifタグをマッピング・整形する
function mapAndFormatExifTags(tags) {
  const exifData = {};
  const tagMappings = {
    Make: tags.Make,
    Model: tags.Model,
    DateTime: tags.DateTimeOriginal || tags.DateTime,
    ExposureTime: tags.ExposureTime,
    FNumber: tags.FNumber,
    ISOSpeedRatings: tags.ISO,
    FocalLength: tags.FocalLength,
    ExposureProgram: tags.ExposureProgram,
    MeteringMode: tags.MeteringMode,
    Flash: tags.Flash,
    WhiteBalance: tags.WhiteBalance,
    Resolution:
      tags.ExifImageWidth && tags.ExifImageHeight
        ? `${tags.ExifImageWidth} × ${tags.ExifImageHeight}`
        : undefined,
    GPSLatitude: tags.GPSLatitude,
    GPSLongitude: tags.GPSLongitude,
    GPSAltitude: tags.GPSAltitude,
    LensModel: tags.LensModel || tags.LensType || tags.Lens,
  };
  Object.entries(tagMappings).forEach(([key, value]) => {
    if (value !== undefined) {
      switch (key) {
        case 'ExposureTime':
          if (value < 1) {
            exifData[key] = `1/${Math.round(1 / value)}s`;
          } else {
            exifData[key] = `${value}s`;
          }
          break;
        case 'FNumber':
          exifData[key] = `f/${value}`;
          break;
        case 'FocalLength':
          exifData[key] = `${value}mm`;
          break;
        default:
          exifData[key] = value;
      }
    }
  });
  return exifData;
}

// レンズ仕様やSony特有タグなど追加情報を付与
function enrichExifData(exifData, tags) {
  // レンズ仕様情報
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
  // Sony特有のタグ
  if (!exifData['LensModel'] && tags.SonyLensID) {
    exifData['LensModel'] = `Sony Lens (ID: ${tags.SonyLensID})`;
  }
  // MakerNotes内のLensID
  if (tags.LensID) {
    exifData['LensID'] = tags.LensID;
  }
  return exifData;
}

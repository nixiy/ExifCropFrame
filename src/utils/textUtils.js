// 1行目のカメラ情報テキスト生成
export function getCameraInfoText(exifData, selectedTagKeys) {
    const make = selectedTagKeys.includes('Make') ? exifData['Make'] : '';
    const model = selectedTagKeys.includes('Model') ? exifData['Model'] : '';
    const lensModel = selectedTagKeys.includes('LensModel') ? exifData['LensModel'] : '';
    let cameraText = make && model ? `${make.trim()}  ${model.trim()}` : make || model;
    if (lensModel) {
        return `${cameraText} / ${lensModel.trim()}`;
    }
    return cameraText;
}

// 2行目の詳細情報テキスト生成
export function getDetailsInfoText(exifData, selectedTagKeys) {
    const focalLength = selectedTagKeys.includes('FocalLength') ? exifData['FocalLength'] : '';
    const fNumber = selectedTagKeys.includes('FNumber') ? exifData['FNumber'] : '';
    const exposureTime = selectedTagKeys.includes('ExposureTime') ? exifData['ExposureTime'] : '';
    const iso = selectedTagKeys.includes('ISOSpeedRatings')
        ? `ISO${exifData['ISOSpeedRatings']}`
        : '';
    const details = [focalLength, fNumber, exposureTime, iso].filter(Boolean);
    return details.length > 0 ? details.join(' / ') : '';
}

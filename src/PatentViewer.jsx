import React from 'react';
import ImageViewer from './ImageViewer'; // ImageViewerは変更なしのためコードは省略

/**
 * 段落要素を表示するコンポーネント
 * @param {{ p: { number: string, text: string } }} props
 * @returns {JSX.Element}
 */
const Paragraph = ({ p }) => (
  <p>
    {p.number && `【${p.number}】 `}
    {p.text}
  </p>
);

/**
 * 書誌情報セクション
 * @param {{ data: object }} props - 書誌情報データ
 * @returns {JSX.Element|null}
 */
const BibliographicDataSection = ({ data }) => (
  <section className="card">
    <h1>{data.inventionTitle}</h1>
    <h2>書誌情報</h2>
    <p><strong>公開番号:</strong> {data.publicationNumber}</p>
    <p><strong>公開日:</strong> {data.publicationDate}</p>
    <p><strong>出願番号:</strong> {data.applicationNumber}</p>
    <p><strong>出願日:</strong> {data.filingDate}</p>
    <p><strong>出願人:</strong> {data.applicants.join(', ')}</p>
    <p><strong>発明者:</strong> {data.inventors.join(', ')}</p>
  </section>
);

/**
 * 要約セクション
 * @param {{ abstractText: string }} props
 * @returns {JSX.Element|null}
 */
const AbstractSection = ({ abstractText }) => {
  if (!abstractText) return null;
  return (
    <section className="card">
      <h2>要約</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{abstractText}</p>
    </section>
  );
};

/**
 * 特許請求の範囲セクション
 * @param {{ claims: Array<object> }} props
 * @returns {JSX.Element|null}
 */
const ClaimsSection = ({ claims }) => {
  if (!claims || claims.length === 0) return null;
  return (
    <section className="card">
      <h2>特許請求の範囲</h2>
      {claims.map(c => (
        <div key={c.number} className="claim">
          <h4>【請求項{c.number}】</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{c.text.split('<com:Br/>').join('\n')}</p>
        </div>
      ))}
    </section>
  );
};

/**
 * 明細書セクション
 * @param {{ description: object }} props
 * @returns {JSX.Element|null}
 */
const DescriptionSection = ({ description }) => {
  // 表示すべきデータが一つもない場合はセクション自体を描画しない
  const hasData = Object.values(description).some(arr => arr.length > 0);
  if (!hasData) return null;

  return (
    <section className="card">
      <h2>明細書</h2>
      {description.technicalField.length > 0 && <h3>【技術分野】</h3>}
      {description.technicalField.map((p, i) => <Paragraph key={`tf-${i}`} p={p} />)}
      
      {description.backgroundArt.length > 0 && <h3>【背景技術】</h3>}
      {description.backgroundArt.map((p, i) => <Paragraph key={`ba-${i}`} p={p} />)}
      
      {description.inventionSummary.length > 0 && <h3>【発明の概要】</h3>}
      {description.inventionSummary.map((p, i) => <Paragraph key={`is-${i}`} p={p} />)}
      
      {description.drawingDescription.length > 0 && <h3>【図面の簡単な説明】</h3>}
      {description.drawingDescription.map((p, i) => <Paragraph key={`dd-${i}`} p={p} />)}
      
      {description.embodimentDescription.length > 0 && <h3>【発明を実施するための形態】</h3>}
      {description.embodimentDescription.map((p, i) => <Paragraph key={`ed-${i}`} p={p} />)}
    </section>
  );
};

/**
 * 図面セクション
 * @param {{ drawings: Array<object>, imageFiles: object }} props
 * @returns {JSX.Element|null}
 */
const DrawingsSection = ({ drawings, imageFiles }) => {
  if (!drawings || drawings.length === 0) return null;
  return (
    <section className="card">
      <h2>図面</h2>
      <div className="drawings-grid">
        {drawings.map(d => (
          <div key={d.number} className="drawing">
            <h4>【図{d.number}】</h4>
            {imageFiles[d.fileName] ? (
              <ImageViewer file={imageFiles[d.fileName]} />
            ) : (
              <div className="image-placeholder">
                画像 '{d.fileName}' がアップロードされていません
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};


/**
 * 解析された特許データを表示するためのメインコンポーネント
 * @param {{ patentData: object, imageFiles: object }} props
 * @returns {JSX.Element}
 */
const PatentViewer = ({ patentData, imageFiles }) => {
  return (
    <div className="viewer-container">
      <BibliographicDataSection data={patentData} />
      <AbstractSection abstractText={patentData.abstract} />
      <ClaimsSection claims={patentData.claims} />
      <DescriptionSection description={patentData.description} />
      <DrawingsSection drawings={patentData.drawings} imageFiles={imageFiles} />
    </div>
  );
};

export default PatentViewer;

import React from 'react';
import ImageViewer from './ImageViewer';


// 段落を表示するための補助コンポーネント
const Paragraph = ({ p }) => (
  <p>
    {p.number && `【${p.number}】 `}
    {p.text}
  </p>
);

const PatentViewer = ({ data, images }) => {
  return (
    <div className="viewer-container">
      {/* 発明の名称 */}
      <section className="card">
        <h1>{data.inventionTitle}</h1>
      </section>

      {/* 書誌情報 */}
      <section className="card">
        <h2>書誌情報</h2>
        <p><strong>公開番号:</strong> {data.publicationNumber}</p>
        <p><strong>公開日:</strong> {data.publicationDate}</p>
        <p><strong>出願番号:</strong> {data.applicationNumber}</p>
        <p><strong>出願日:</strong> {data.filingDate}</p>
        <p><strong>出願人:</strong> {data.applicants.join(', ')}</p>
        <p><strong>発明者:</strong> {data.inventors.join(', ')}</p>
      </section>

      {/* 要約 */}
      <section className="card">
        <h2>要約</h2>
        <p>{data.abstract}</p>
      </section>
      
      {/* 特許請求の範囲 */}
      <section className="card">
        <h2>特許請求の範囲</h2>
        {data.claims.map(c => (
          <div key={c.number} className="claim">
            <h4>【請求項{c.number}】</h4>
            <p style={{ whiteSpace: 'pre-wrap' }}>{c.text.split('<com:Br/>').join('\n')}</p>
          </div>
        ))}
      </section>

      {/* 明細書 */}
      <section className="card">
        <h2>明細書</h2>
        <h3>【技術分野】</h3>
        {data.description.technicalField.map((p, i) => <Paragraph key={`tf-${i}`} p={p} />)}
        <h3>【背景技術】</h3>
        {data.description.backgroundArt.map((p, i) => <Paragraph key={`ba-${i}`} p={p} />)}
        <h3>【発明の概要】</h3>
        {data.description.inventionSummary.map((p, i) => <Paragraph key={`is-${i}`} p={p} />)}
         <h3>【図面の簡単な説明】</h3>
        {data.description.drawingDescription.map((p, i) => <Paragraph key={`dd-${i}`} p={p} />)}
        <h3>【発明を実施するための形態】</h3>
        {data.description.embodimentDescription.map((p, i) => <Paragraph key={`ed-${i}`} p={p} />)}
      </section>
      
      {/* 図面 */}
      <section className="card">
        <h2>図面</h2>
        <div className="drawings-grid">
          {data.drawings.map(d => (
            <div key={d.number} className="drawing">
              <h4>【図{d.number}】</h4>
              {images[d.fileName] ? (
                <ImageViewer file={images[d.fileName]} />
              ) : (
                <div className="image-placeholder">
                  画像 '{d.fileName}' がアップロードされていません
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PatentViewer;

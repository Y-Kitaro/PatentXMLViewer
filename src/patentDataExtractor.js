import { getTextByXpath, getNodesByXpath } from './xmlUtils';

/**
 * 段落ノードの配列から整形済みテキストオブジェクトの配列を生成する
 * @param {Node} node - 段落の親となるノード
 * @param {Document} xmlDoc - XML Documentオブジェクト
 * @returns {Array<{number: string, text: string}>} 段落オブジェクトの配列
 */
const getParagraphs = (node, xmlDoc) => {
  if (!node) return [];
  // getNodesByXpathにxmlDocを渡す
  return getNodesByXpath('.//com:P | .//pat:P', node, xmlDoc).map(p => ({
    number: p.getAttribute('com:pNumber'),
    text: p.textContent.trim(),
  }));
};

/**
 * 解析済みのXML Documentオブジェクトから特許データを抽出し、整形されたJSオブジェクトを返す
 * @param {Document} xmlDoc - parseXmlStringによって生成されたXML Documentオブジェクト
 * @returns {object} 整形された特許データオブジェクト
 */
export const extractPatentData = (xmlDoc) => {
  const biblioDataXpath = '//jppat:InternationalPatentPublicationBibliographicData | //jppat:UnexaminedPatentPublicationBibliographicData';
  const biblioData = getNodesByXpath(biblioDataXpath, xmlDoc, xmlDoc)[0];
  
  const descriptionNode = getNodesByXpath('//jppat:Description', xmlDoc, xmlDoc)[0];
  const claimsNode = getNodesByXpath('//pat:Claims', xmlDoc, xmlDoc)[0];
  const abstractNode = getNodesByXpath('//pat:Abstract', xmlDoc, xmlDoc)[0];
  const drawingsNode = getNodesByXpath('//pat:Drawings', xmlDoc, xmlDoc)[0];

  return {
    // 全てのヘルパー関数呼び出しにxmlDocを渡す
    inventionTitle: getTextByXpath('.//pat:InventionTitle', biblioData, xmlDoc),
    publicationNumber: getTextByXpath('.//pat:PublicationNumber', biblioData, xmlDoc),
    publicationDate: getTextByXpath('.//com:PublicationDate', biblioData, xmlDoc),
    applicationNumber: getTextByXpath('.//com:ApplicationNumberText', biblioData, xmlDoc),
    filingDate: getTextByXpath('.//pat:FilingDate', biblioData, xmlDoc),
    
    applicants: getNodesByXpath('.//jppat:Applicant', biblioData, xmlDoc).map(node => 
      getTextByXpath('.//com:EntityName', node, xmlDoc)
    ),
    inventors: getNodesByXpath('.//jppat:Inventor', biblioData, xmlDoc).map(node =>
      getTextByXpath('.//com:EntityName', node, xmlDoc)
    ),

    abstract: getParagraphs(abstractNode, xmlDoc).map(p => p.text).join('\n'),

    description: {
      technicalField: getParagraphs(getNodesByXpath('.//pat:TechnicalField', descriptionNode, xmlDoc)[0], xmlDoc),
      backgroundArt: getParagraphs(getNodesByXpath('.//pat:BackgroundArt', descriptionNode, xmlDoc)[0], xmlDoc),
      inventionSummary: getParagraphs(getNodesByXpath('.//pat:InventionSummary', descriptionNode, xmlDoc)[0], xmlDoc),
      drawingDescription: getParagraphs(getNodesByXpath('.//pat:DrawingDescription', descriptionNode, xmlDoc)[0], xmlDoc),
      embodimentDescription: getNodesByXpath('.//pat:EmbodimentDescription | .//pat:EmbodimentExample', descriptionNode, xmlDoc)
        .flatMap(node => getParagraphs(node, xmlDoc)),
    },

    claims: getNodesByXpath('.//pat:Claim', claimsNode, xmlDoc).map(node => ({
      number: getTextByXpath('.//pat:ClaimNumber', node, xmlDoc),
      text: getTextByXpath('.//pat:ClaimText', node, xmlDoc),
    })),
    
    drawings: getNodesByXpath('.//pat:Figure', drawingsNode, xmlDoc).map(node => ({
      number: getTextByXpath('.//pat:FigureNumber', node, xmlDoc),
      fileName: getTextByXpath('.//com:FileName', node, xmlDoc),
    })),
  };
};

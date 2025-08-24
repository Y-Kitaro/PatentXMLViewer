// =======================================================
// 全ての項目でnull/undefinedを想定した、より堅牢なパーサー
// =======================================================

// 1. 使用するXML名前空間を定義
const namespaces = {
  jppat: 'http://www.jpo.go.jp/standards/XMLSchema/ST96/JPPatent',
  pat: 'http://www.wipo.int/standards/XMLSchema/ST96/Patent',
  com: 'http://www.wipo.int/standards/XMLSchema/ST96/Common',
  jpcom: 'http://www.jpo.go.jp/standards/XMLSchema/ST96/JPCommon'
};

// 2. 名前空間リゾルバ関数を作成
const nsResolver = (prefix) => namespaces[prefix] || null;

// 3. XPathを評価するためのグローバルなxmlDoc変数
let xmlDoc;

// 4. XPathヘルパー関数 (null安全設計)
/**
 * XPathを使って単一のノードのテキスト内容を取得します。
 * 起点ノードが存在しない、または要素が見つからない場合は空文字('')を返します。
 */
const getTextByXpath = (xpath, contextNode) => {
  if (!contextNode) return ''; // 起点ノードがなければ安全に終了
  const result = xmlDoc.evaluate(xpath, contextNode, nsResolver, XPathResult.STRING_TYPE, null);
  return result.stringValue.trim();
};

/**
 * XPathを使って複数のノードを取得します。
 * 起点ノードが存在しない場合は空配列([])を返します。
 */
const getNodesByXpath = (xpath, contextNode) => {
  if (!contextNode) return []; // 起点ノードがなければ安全に終了
  const result = [];
  const iterator = xmlDoc.evaluate(xpath, contextNode, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  let node = iterator.iterateNext();
  while (node) {
    result.push(node);
    node = iterator.iterateNext();
  }
  return result;
};

// メインのXML解析関数
export const parsePatentXml = (xmlString) => {
  const parser = new DOMParser();
  xmlDoc = parser.parseFromString(xmlString, 'application/xml');

  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    // XMLとして不正な場合はここでエラーを投げる
    throw new Error('XMLとして解析できませんでした。ファイルが破損している可能性があります。');
  }

  // --- 各セクションの親ノードを取得します。これらは存在しない可能性があります (undefinedになる) ---
  const biblioDataXpath = '//jppat:InternationalPatentPublicationBibliographicData | //jppat:UnexaminedPatentPublicationBibliographicData';
  const biblioData = getNodesByXpath(biblioDataXpath, xmlDoc)[0];
  
  const descriptionNode = getNodesByXpath('//jppat:Description', xmlDoc)[0];
  const claimsNode = getNodesByXpath('//pat:Claims', xmlDoc)[0];
  const abstractNode = getNodesByXpath('//pat:Abstract', xmlDoc)[0];
  const drawingsNode = getNodesByXpath('//pat:Drawings', xmlDoc)[0];

  // 段落取得ヘルパー
  const getParagraphs = (node) => {
    if (!node) return [];
    return getNodesByXpath('.//com:P | .//pat:P', node).map(p => ({
      number: p.getAttribute('com:pNumber'),
      text: p.textContent.trim(),
    }));
  };

  return {
    // biblioDataが存在しなくても、ヘルパー関数が空文字や空配列を返すため安全
    inventionTitle: getTextByXpath('.//pat:InventionTitle', biblioData),
    publicationNumber: getTextByXpath('.//pat:PublicationNumber', biblioData),
    publicationDate: getTextByXpath('.//com:PublicationDate', biblioData),
    applicationNumber: getTextByXpath('.//com:ApplicationNumberText', biblioData),
    filingDate: getTextByXpath('.//pat:FilingDate', biblioData),
    
    applicants: getNodesByXpath('.//jppat:Applicant', biblioData).map(node => 
      getTextByXpath('.//com:EntityName', node)
    ),
    inventors: getNodesByXpath('.//jppat:Inventor', biblioData).map(node =>
      getTextByXpath('.//com:EntityName', node)
    ),

    abstract: getParagraphs(abstractNode).map(p => p.text).join('\n'),

    description: {
      technicalField: getParagraphs(getNodesByXpath('.//pat:TechnicalField', descriptionNode)[0]),
      backgroundArt: getParagraphs(getNodesByXpath('.//pat:BackgroundArt', descriptionNode)[0]),
      inventionSummary: getParagraphs(getNodesByXpath('.//pat:InventionSummary', descriptionNode)[0]),
      drawingDescription: getParagraphs(getNodesByXpath('.//pat:DrawingDescription', descriptionNode)[0]),
      embodimentDescription: getNodesByXpath('.//pat:EmbodimentDescription | .//pat:EmbodimentExample', descriptionNode)
        .flatMap(node => getParagraphs(node)),
    },

    claims: getNodesByXpath('.//pat:Claim', claimsNode).map(node => ({
      number: getTextByXpath('.//pat:ClaimNumber', node),
      text: getTextByXpath('.//pat:ClaimText', node),
    })),
    
    drawings: getNodesByXpath('.//pat:Figure', drawingsNode).map(node => ({
      number: getTextByXpath('.//pat:FigureNumber', node),
      fileName: getTextByXpath('.//com:FileName', node),
    })),
  };
};

import { DOMParser } from '@xmldom/xmldom';

export function parseCustomersXML(xmlData){

const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlData, "text/xml");

const ledgerNodes = xmlDoc.getElementsByTagName("LEDGER");
const groupedLedgers = {};

for (let i = 0; i < ledgerNodes.length; i++) {
  const ledger = ledgerNodes[i];
  const nameNode = ledger.getElementsByTagName("NAME")[0];
  const parentNode = ledger.getElementsByTagName("PARENT")[0];

  if (nameNode && parentNode) {
    const name = nameNode.textContent.trim();
    const parent = parentNode.textContent.trim();

    if (!groupedLedgers[parent]) {
      groupedLedgers[parent] = [];
    }
    groupedLedgers[parent].push(name);
  }
}

// console.log(JSON.stringify(groupedLedgers, null, 2));
return groupedLedgers;



}
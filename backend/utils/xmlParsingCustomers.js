import { DOMParser } from '@xmldom/xmldom';

export function parseCustomersXML(xmlData){

const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlData, "text/xml");
const envelopeChildren = xmlDoc.documentElement.childNodes;

const result = [];
let currentGroup = null;

for (let i = 0; i < envelopeChildren.length; i++) {
    const node = envelopeChildren[i];
    
    if (node.nodeType === 1) { // ELEMENT_NODE
        const value = node.textContent.trim();

        if (node.tagName === 'GROUPNAME') {
            currentGroup = {
                group: value,
                ledgers: []
            };
            result.push(currentGroup);
        } else if (node.tagName === 'LEDGERNAME' && currentGroup) {
            currentGroup.ledgers.push(value);
        }
    }
}

return result;

}
import extractMRP from "./extractMRP.js";
export async function parseStockItemPriceList(xmlString, companyName) {

    // --- Helper function to decode common XML entities ---
    function decodeXmlEntities(encodedString) {
        if (typeof encodedString !== 'string') {
            return encodedString;
        }
        return encodedString.replace(/&quot;/g, '"')
                            .replace(/&apos;/g, "'")
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&amp;/g, '&');
    }

    // --- Helper function to get the full string of an element, handling nesting and prefix issues ---
    function getElementBlock(data, tagName) {
        const tagStartPattern = `<${tagName}`;
        const endTagStr = `</${tagName}>`;
        let searchStartIndex = 0;

        while (searchStartIndex < data.length) {
            let startIndex = data.indexOf(tagStartPattern, searchStartIndex);

            if (startIndex === -1) {
                return { block: null, nextPos: -1 };
            }

            const charAfterPattern = data.charAt(startIndex + tagStartPattern.length);
            if (charAfterPattern !== ' ' && charAfterPattern !== '>' && charAfterPattern !== '/') {
                searchStartIndex = startIndex + 1;
                continue;
            }

            let openTagEndIndex = data.indexOf(">", startIndex);
            if (openTagEndIndex === -1) {
                return { block: null, nextPos: -1 };
            }

            if (data.charAt(openTagEndIndex - 1) === '/') { // Self-closing tag
                return { block: data.substring(startIndex, openTagEndIndex + 1), nextPos: openTagEndIndex + 1 };
            }

            let level = 1;
            let currentScanPos = openTagEndIndex + 1;

            while (level > 0 && currentScanPos < data.length) {
                let nextOpenIndex = -1;
                let tempNextOpenIndexSearch = currentScanPos;
                while (tempNextOpenIndexSearch < data.length) {
                    let potNextOpen = data.indexOf(tagStartPattern, tempNextOpenIndexSearch);
                    if (potNextOpen === -1) break;
                    const charAft = data.charAt(potNextOpen + tagStartPattern.length);
                    if (charAft === ' ' || charAft === '>' || charAft === '/') {
                        nextOpenIndex = potNextOpen;
                        break;
                    }
                    tempNextOpenIndexSearch = potNextOpen + 1;
                }

                const nextCloseIndex = data.indexOf(endTagStr, currentScanPos);

                if (nextCloseIndex === -1) {
                    return { block: null, nextPos: -1 };
                }

                if (nextOpenIndex !== -1 && nextOpenIndex < nextCloseIndex) {
                    level++;
                    const nestedOpenTagEnd = data.indexOf(">", nextOpenIndex);
                    if (nestedOpenTagEnd === -1) return { block: null, nextPos: -1 };
                    currentScanPos = nestedOpenTagEnd + 1;
                } else {
                    level--;
                    if (level === 0) {
                        const endIndex = nextCloseIndex + endTagStr.length;
                        return { block: data.substring(startIndex, endIndex), nextPos: endIndex };
                    }
                    currentScanPos = nextCloseIndex + endTagStr.length;
                }
            }
            return { block: null, nextPos: -1 };
        }
        return { block: null, nextPos: -1 };
    }

    // --- Helper function to get text content from a tag ---
    function getElementText(dataBlock, tagName) {
        if (!dataBlock) return "";
        let contentStartOffset = -1;

        const simpleStartTag = `<${tagName}>`;
        let startOffset = dataBlock.indexOf(simpleStartTag);

        if (startOffset !== -1) {
            contentStartOffset = startOffset + simpleStartTag.length;
        } else {
            const attrStartTag = `<${tagName} `;
            startOffset = dataBlock.indexOf(attrStartTag);
            if (startOffset !== -1) {
                const openTagEndGtOffset = dataBlock.indexOf(">", startOffset + attrStartTag.length - 1);
                if (openTagEndGtOffset !== -1) {
                    if (dataBlock.charAt(openTagEndGtOffset - 1) === '/') {
                        return "";
                    }
                    contentStartOffset = openTagEndGtOffset + 1;
                } else {
                    return "";
                }
            } else {
                const emptyTagMarker = `<${tagName}/>`;
                 if (dataBlock.indexOf(emptyTagMarker) !== -1) {
                     return "";
                 }
                return "";
            }
        }

        if (contentStartOffset === -1) {
            return "";
        }

        const endMarker = `</${tagName}>`;
        const endOffset = dataBlock.indexOf(endMarker, contentStartOffset);
        if (endOffset !== -1) {
            return decodeXmlEntities(dataBlock.substring(contentStartOffset, endOffset).trim());
        }
        return "";
    }

    // --- Helper function to get an attribute's value from an opening tag string ---
    function getAttributeValue(tagOpeningString, attrName) {
        if (!tagOpeningString) return "";
        const attrMarker = `${attrName}="`;
        let valStartIdx = tagOpeningString.indexOf(attrMarker);
        if (valStartIdx === -1) {
            return "";
        }
        valStartIdx += attrMarker.length;
        const valEndIdx = tagOpeningString.indexOf('"', valStartIdx);
        if (valEndIdx === -1) {
            return "";
        }
        return decodeXmlEntities(tagOpeningString.substring(valStartIdx, valEndIdx));
    }

    // --- Helper to find all occurrences of a tag block ---
    function findAllElementBlocks(dataBlock, tagName) {
        if (!dataBlock) return [];
        const elements = [];
        let currentPos = 0;
        while (currentPos < dataBlock.length) {
            const remainingBlock = dataBlock.substring(currentPos);
            const { block: elementContent, nextPos: nextPosInRemaining } = getElementBlock(remainingBlock, tagName);

            if (elementContent === null || nextPosInRemaining === -1) {
                break;
            }
            elements.push(elementContent);
            currentPos += nextPosInRemaining;
            if (nextPosInRemaining <= 0) {
                break;
            }
        }
        return elements;
    }

    // --- Main parsing logic ---
    const allStockItemObjects = [];

    if (typeof xmlString !== 'string' || !xmlString.trim()) {
        console.warn("parseStockItemPriceList: XML string is empty or not a string.");
        return allStockItemObjects;
    }

    const { block: dataBlock } = getElementBlock(xmlString, "DATA");
    if (!dataBlock) {
        return allStockItemObjects;
    }

    const { block: collectionBlock } = getElementBlock(dataBlock, "COLLECTION");
    if (!collectionBlock) {
        return allStockItemObjects;
    }

    const collectionOpenTagEnd = collectionBlock.indexOf(">");
    const collectionCloseTagPattern = `</COLLECTION>`;
    const collectionCloseTagStart = collectionBlock.lastIndexOf(collectionCloseTagPattern);

    let collectionContent = "";
    if (collectionOpenTagEnd !== -1 && collectionCloseTagStart !== -1 && collectionOpenTagEnd < collectionCloseTagStart) {
        collectionContent = collectionBlock.substring(collectionOpenTagEnd + 1, collectionCloseTagStart);
    } else {
        return allStockItemObjects;
    }

    const stockitemBlocksArray = findAllElementBlocks(collectionContent, "STOCKITEM");

    for (const stockitemFullBlock of stockitemBlocksArray) {
        const resultDict = {};

        const stockitemOpeningTagEnd = stockitemFullBlock.indexOf(">");
        if (stockitemOpeningTagEnd !== -1) {
            const stockitemOpeningTag = stockitemFullBlock.substring(0, stockitemOpeningTagEnd + 1);
            resultDict["item_name"] = getAttributeValue(stockitemOpeningTag, "NAME");
        } else {
            resultDict["item_name"] = "";
        }

        resultDict["standard_cost"] = getElementText(stockitemFullBlock, "STANDARDCOST");
        resultDict["standard_price"] = getElementText(stockitemFullBlock, "STANDARDPRICE");
        resultDict["stock_quantity"] = getElementText(stockitemFullBlock, "CLOSINGBALANCE");

        const { block: hsndetailsBlock } = getElementBlock(stockitemFullBlock, "HSNDETAILS.LIST");
        if (hsndetailsBlock) {
            resultDict["hsn_code"] = getElementText(hsndetailsBlock, "HSNCODE");
        } else {
            resultDict["hsn_code"] = "";
        }

        const gstData = {};
        const { block: gstdetailsListBlock } = getElementBlock(stockitemFullBlock, "GSTDETAILS.LIST");
        if (gstdetailsListBlock) {
            const { block: statewisedetailsBlock } = getElementBlock(gstdetailsListBlock, "STATEWISEDETAILS.LIST");
            if (statewisedetailsBlock) {
                const ratedetailBlocks = findAllElementBlocks(statewisedetailsBlock, "RATEDETAILS.LIST");
                for (const block of ratedetailBlocks) {
                    const dutyHead = getElementText(block, "GSTRATEDUTYHEAD");
                    const rate = getElementText(block, "GSTRATE");
                    if (dutyHead === "CGST") {
                        gstData["cgst_rate"] = rate;
                    } else if (dutyHead === "SGST/UTGST") {
                        gstData["sgst_utgst_rate"] = rate;
                    } else if (dutyHead === "IGST") {
                        gstData["igst_rate"] = rate;
                    }
                }
            }
        }
        resultDict["gst_details"] = gstData;

        const priceLevels = [];
        const { block: fullpricelistBlock } = getElementBlock(stockitemFullBlock, "FULLPRICELIST.LIST");
        if (fullpricelistBlock) {
            const pricelevellistItemBlocks = findAllElementBlocks(fullpricelistBlock, "PRICELEVELLIST.LIST");
            for (const itemBlock of pricelevellistItemBlocks) {
                const levelDetail = {};
                levelDetail["rate"] = getElementText(itemBlock, "RATE");
                levelDetail["ending_at"] = getElementText(itemBlock, "ENDINGAT");
                levelDetail["starting_from"] = getElementText(itemBlock, "STARTINGFROM");
                if (levelDetail["rate"]) {
                    priceLevels.push(levelDetail);
                }
            }
        }
        resultDict["price_level_list"] = priceLevels;

        // --- Modified MRP Logic ---
        let extractedMrpRate = null;
        const { block: mrpDetailsRawBlock } = getElementBlock(stockitemFullBlock, "MRPDETAILS.LIST");

        if (mrpDetailsRawBlock) {
            const openMrpListTagEnd = mrpDetailsRawBlock.indexOf('>');
            const closeMrpListTagPattern = `</MRPDETAILS.LIST>`;
            const closeMrpListTagStart = mrpDetailsRawBlock.lastIndexOf(closeMrpListTagPattern);

            if (openMrpListTagEnd !== -1 && closeMrpListTagStart !== -1 && openMrpListTagEnd < closeMrpListTagStart) {
                const mrpListContent = mrpDetailsRawBlock.substring(openMrpListTagEnd + 1, closeMrpListTagStart).trim();
                if (mrpListContent) {
                    const mrpRateDetailBlocks = findAllElementBlocks(mrpListContent, "MRPRATEDETAILS.LIST");
                    for (const rateBlock of mrpRateDetailBlocks) {
                        const currentMrp = getElementText(rateBlock, "MRPRATE");
                        if (currentMrp && currentMrp.trim() !== "") {
                            extractedMrpRate = currentMrp;
                            break; // Use the first valid MRP rate found
                        }
                    }
                }
            }
        }

        if (extractedMrpRate !== null && extractedMrpRate.trim() !== "") {
            resultDict["mrp_rate"] = extractedMrpRate;
        } else {
            // If MRP not found in XML structure, try to extract from item_name
            // Ensure 'extractMRP' function is defined and accessible in the scope
            if (typeof extractMRP === 'function') {
                resultDict["mrp_rate"] = extractMRP(resultDict["item_name"]);
            } else {
                console.warn(`extractMRP function is not defined. Cannot extract MRP from item name for: ${resultDict["item_name"]}`);
                resultDict["mrp_rate"] = null; // Or an empty string "", or other default
            }
        }
        // --- End of Modified MRP Logic ---

        resultDict["company_name"] = companyName;
        allStockItemObjects.push(resultDict);
    }
    return allStockItemObjects;
}
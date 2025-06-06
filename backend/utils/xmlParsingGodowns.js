import { DOMParser } from "@xmldom/xmldom";

async function parseStockItemGodown(xmlString, companyName) {
  console.log("Starting parseStockItemGodown (simplified for item name and godown details)...");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  // Check for XML parsing errors
  const parserErrorNode = xmlDoc.getElementsByTagName("parsererror");
  if (parserErrorNode.length > 0) {
    const errorContent = parserErrorNode[0].textContent;
    console.error("XML Parsing Error Detected:", errorContent);
    throw new Error("XML Parsing Error: " + errorContent);
  }

  // Ensure the root element is ENVELOPE
  if (!xmlDoc.documentElement || xmlDoc.documentElement.tagName !== "ENVELOPE") {
    console.error("XML root element is not ENVELOPE or is missing!");
    throw new Error("XML document does not have a root ENVELOPE element.");
  }

  const products = [];
  let currentProduct = null;
  let latestGodownName = null; // Stores the name of the most recently encountered godown

  // Using the original getText helper function from your provided code.
  // This function extracts text from a nested structure.
  const getText = (baseElement, selector) => {
    if (!baseElement) return "";
    const parts = selector.split(' '); // selector can be "TAG1" or "TAG1 TAG2" etc.
    let currentElement = baseElement;
    for (const part of parts) {
      if (!currentElement) return "";
      const childrenOfCurrent = currentElement.childNodes;
      let found = false;
      for (let i = 0; i < childrenOfCurrent.length; i++) {
        const childNode = childrenOfCurrent[i];
        if (childNode.nodeType === 1 && childNode.tagName === part) { // Node.ELEMENT_NODE
          currentElement = childNode;
          found = true;
          break;
        }
      }
      if (!found) return ""; // Path not found
    }
    return currentElement && currentElement.textContent ? currentElement.textContent.trim() : "";
  };

  // Iterate over direct children of the ENVELOPE tag
  const reportElements = xmlDoc.documentElement.childNodes;

  for (let i = 0; i < reportElements.length; i++) {
    const element = reportElements[i];

    // Ensure we are only processing Element nodes (nodeType 1)
    if (element.nodeType !== 1) {
      continue;
    }

    const tagName = element.tagName;

    if (tagName === "DSPACCNAME") {
      // If a previous product was being built, add it to the results.
      if (currentProduct) {
        products.push(currentProduct);
      }
      // Start a new product object.
      currentProduct = {
        name: getText(element, "DSPDISPNAME"), // Expects structure: DSPACCNAME > DSPDISPNAME
        godowns: [], // Initialize an empty array for godown details for this item
        companyName: companyName // Retain companyName as per original structure
      };
      latestGodownName = null; // Reset godown context for this new product

    } else if (tagName === "SSBATCHNAME" && currentProduct) {
      // This tag appears to provide the godown name context.
      // The actual godown name is expected within an SSGODOWN tag.
      latestGodownName = getText(element, "SSGODOWN"); // Expects structure: SSBATCHNAME > SSGODOWN

    } else if (tagName === "DSPSTKINFO" && currentProduct) {
      // This tag provides stock information.
      // If latestGodownName is set, this stock info pertains to that godown.
      if (latestGodownName) {
        // Attempt to find the DSPSTKCL element, which usually contains quantity details.
        const dspStkClNodes = element.getElementsByTagName("DSPSTKCL");
        if (dspStkClNodes.length > 0) {
          const dspStkCl = dspStkClNodes[0];
          const qty = getText(dspStkCl, "DSPCLQTY"); // Expects structure: DSPSTKCL > DSPCLQTY

          currentProduct.godowns.push({
            name: latestGodownName,
            qty: qty
            // If you also need rate and amount per godown, you can extract them here:
            // rate: getText(dspStkCl, "DSPCLRATE"),
            // amount: getText(dspStkCl, "DSPCLAMTA"),
          });
        }
        // Crucially, reset latestGodownName after its corresponding DSPSTKINFO has been processed.
        // This ensures that subsequent DSPSTKINFO (e.g., an item total) isn't wrongly attributed to this godown.
        latestGodownName = null;
      }
      // If latestGodownName is null at this point, this DSPSTKINFO might be for the item's
      // overall total quantity or some other summary not specific to a godown.
      // As per the requirement ("just item name and godown details"), such entries are ignored
      // for the godowns list.
    }
  }

  // After the loop, if there's a currentProduct still being built (i.e., the last item in the XML), add it.
  if (currentProduct) {
    products.push(currentProduct);
  }

  console.log("Finished parseStockItemGodown. Processed products count:", products.length);
  // return JSON.stringify(products, null, 2); 
  // // Return the array of products as a JSON string
  return products;
}

export default parseStockItemGodown;
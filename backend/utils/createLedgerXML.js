export function generateTallyLedgerXML(companyName, ledgerName, groupName, address, stateName, pincode, partyGst) {
    // Validate required parameters
    if (!companyName || !ledgerName || !groupName || !address ) {
      throw new Error("companyName, ledgerName, groupName, and address are required");
    }
  
    // Start building XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<ENVELOPE>\n`;
    
    // Header
    xml += `    <HEADER>\n`;
    xml += `        <VERSION>1</VERSION>\n`;
    xml += `        <TALLYREQUEST>Import</TALLYREQUEST>\n`;
    xml += `        <TYPE>Data</TYPE>\n`;
    xml += `        <ID>All Masters</ID>\n`;
    xml += `    </HEADER>\n`;
    
    // Body
    xml += `    <BODY>\n`;
    xml += `        <DESC>\n`;
    xml += `            <STATICVARIABLES>\n`;
    xml += `                <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>\n`;
    xml += `            </STATICVARIABLES>\n`;
    xml += `        </DESC>\n`;
    xml += `        <DATA>\n`;
    xml += `            <TALLYMESSAGE xmlns:UDF="TallyUDF">\n`;
    xml += `                <LEDGER NAME="${ledgerName}" ACTION="Create">\n`;
    xml += `                    <NAME.LIST>\n`;
    xml += `                        <NAME>${ledgerName}</NAME>\n`;
    xml += `                    </NAME.LIST>\n`;
    xml += `                    <PARENT>${groupName}</PARENT>\n`;
    xml += `                    <OPENINGBALANCE>0</OPENINGBALANCE>\n`;
    xml += `                    <CURRENCYNAME></CURRENCYNAME>\n`;
    xml += `                    <ISBILLWISEON>Yes</ISBILLWISEON>\n`;
    
    // Single address line
    xml += `                    <ADDRESS>${address}</ADDRESS>\n`;
    
    // Optional fields
    if (stateName) {
        xml += `                    <LEDSTATENAME>${stateName}</LEDSTATENAME>\n`;
    }
    if (pincode) {
        xml += `                    <PINCODE>${pincode}</PINCODE>\n`;
    }
    if (partyGst) {
        xml += `                    <PARTYGSTIN>${partyGst}</PARTYGSTIN>\n`;
        xml += `                    <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>\n`;
    }
    
    // Language name
    xml += `                    <LANGUAGENAME.LIST>\n`;
    xml += `                        <NAME.LIST TYPE="String">\n`;
    xml += `                            <NAME>${ledgerName}</NAME>\n`;
    xml += `                        </NAME.LIST>\n`;
    xml += `                        <LANGUAGEID>1033</LANGUAGEID>\n`;
    xml += `                    </LANGUAGENAME.LIST>\n`;
    
    // Close tags
    xml += `                </LEDGER>\n`;
    xml += `            </TALLYMESSAGE>\n`;
    xml += `        </DATA>\n`;
    xml += `    </BODY>\n`;
    xml += `</ENVELOPE>`;
    
    return xml;

  }
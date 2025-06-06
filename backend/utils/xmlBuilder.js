export function fetchStockGodownsXML({requestType,companyName}){
    return `
    <ENVELOPE>
    <HEADER>
        <TALLYREQUEST>${requestType} Data</TALLYREQUEST>
    </HEADER>
    <BODY>
        <EXPORTDATA>
            <REQUESTDESC>
                <REPORTNAME>Stock Summary</REPORTNAME>
                <STATICVARIABLES>
                    <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
                    <EXPLODEFLAG>Yes</EXPLODEFLAG>
                    <ISITEMWISE>Yes</ISITEMWISE>
                    <DSPPRIMARYGROUP>All Items</DSPPRIMARYGROUP>
                </STATICVARIABLES>
            </REQUESTDESC>
        </EXPORTDATA>
    </BODY>
</ENVELOPE>`.trim()//to remove whitespaces (if any)
}





export function fetchStockItemPriceListXML({companyName}){
    return `
    <ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>StockItemCombinedDetails</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        <SVCurrentCompany>${companyName}</SVCurrentCompany>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="StockItemCombinedDetails" ISMODIFY="No">
            <TYPE>StockItem</TYPE>
            <FETCH>
              Name,
              HsnDetails,
              GstDetails,
              StandardCost,
              StandardPrice,
              GSTApplicable,
              TaxRate,
              Rate,
              ClosingBalance,
              Mrpdetails
            </FETCH>
            <NATIVEMETHOD>FULLPRICELIST.LIST</NATIVEMETHOD>
            <NATIVEMETHOD>GSTDETAILSLIST.LIST</NATIVEMETHOD>
            <FILTERS>IsNotZero</FILTERS>
          </COLLECTION>
          <SYSTEM TYPE="Formulae" NAME="IsNotZero">
            NOT $$IsEmpty:$ClosingBalance AND $ClosingBalance != "0"
          </SYSTEM>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>

`.trim()
}



export function fetchCustomerXML(companyName){
  return `
  <ENVELOPE>
<HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>LedgersByGroup</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
          <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <REPORT NAME="LedgersByGroup">
            <FORMS>LedgersByGroupForm</FORMS>
          </REPORT>
          <FORM NAME="LedgersByGroupForm">
            <TOPPARTS>LedgersByGroupPart</TOPPARTS>
          </FORM>
          <PART NAME="LedgersByGroupPart">
            <TOPLINES>LedgersByGroupLine</TOPLINES>
            <REPEAT>LedgersByGroupLine : GroupCollection</REPEAT>
            <SCROLLED>Vertical</SCROLLED>
          </PART>
          <LINE NAME="LedgersByGroupLine">
            <LEFTFIELDS>GroupNameField</LEFTFIELDS>
            <EXPLODE>LedgersPart</EXPLODE>
          </LINE>
          <FIELD NAME="GroupNameField">
            <SET>$Name</SET>
            <XMLTAG>GroupName</XMLTAG>
          </FIELD>
          <PART NAME="LedgersPart">
            <TOPLINES>LedgersLine</TOPLINES>
            <REPEAT>LedgersLine : LedgersCollection</REPEAT>
            <SCROLLED>Vertical</SCROLLED>
          </PART>
          <LINE NAME="LedgersLine">
            <LEFTFIELDS>LedgerNameField</LEFTFIELDS>
          </LINE>
          <FIELD NAME="LedgerNameField">
            <SET>$Name</SET>
            <XMLTAG>LedgerName</XMLTAG>
          </FIELD>
          <COLLECTION NAME="GroupCollection">
            <TYPE>Group</TYPE>
          </COLLECTION>
          <COLLECTION NAME="LedgersCollection">
            <TYPE>Ledger</TYPE>
            <CHILDOF>$$Name</CHILDOF>
          </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>


  `.trim()
}
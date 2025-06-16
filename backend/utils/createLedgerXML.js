export function generateTallyLedgerXML() {
    const xml = `
    <ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>LedgersByGroup</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="LedgersByGroup" ISMODIFY="No">
            <TYPE>Ledger</TYPE>
            <FETCH>Name,Parent</FETCH>
            <BELONGSTO>$$String:##ACCOUNTSGROUPNAME</BELONGSTO>
          </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>
    `;

    return xml;

}
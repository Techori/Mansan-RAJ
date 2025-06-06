
import React, { ReactElement } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { DocumentProps } from '@react-pdf/renderer';

interface BillPDFViewerProps {
  children: ReactElement<DocumentProps>;
}

const BillPDFViewer: React.FC<BillPDFViewerProps> = ({ children }) => {
  return (
    <PDFViewer style={{ width: '100%', height: '400px' }}>
      {children}
    </PDFViewer>
  );
};

export default BillPDFViewer;

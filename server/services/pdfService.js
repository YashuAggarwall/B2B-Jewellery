import PDFDocument from 'pdfkit';

class PDFService {
    /**
     * Generate quotation PDF and stream it
     */
    async generateQuotationPDF(quotation, stream) {
        const doc = new PDFDocument({
            margin: 50,
            info: {
                Title: `Quotation ${quotation.quotationNumber}`,
                Author: 'B2B Jewellery Sourcing',
            }
        });

        doc.pipe(stream);

        // Header
        doc.fillColor('#444444')
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('B2B JEWELLERY', 50, 45)
            .fontSize(10)
            .font('Helvetica')
            .text('Visual Sourcing Platform', 50, 70)
            .text('Gurugram, India', 50, 85)
            .moveDown();

        // Quotation Title
        doc.fillColor('#2563eb') // primary-600
            .fontSize(25)
            .font('Helvetica-Bold')
            .text('QUOTATION', 50, 120, { align: 'right' });

        doc.fillColor('#444444')
            .fontSize(10)
            .font('Helvetica')
            .text(`Quotation #: ${quotation.quotationNumber}`, 50, 160, { align: 'right' })
            .text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, 50, 175, { align: 'right' })
            .text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 50, 190, { align: 'right' })
            .moveDown();

        // Customer Info
        doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 220);
        doc.fontSize(10).font('Helvetica')
            .text(quotation.userId?.name || 'Valued Customer', 50, 235)
            .text(quotation.userId?.company || 'Company Name', 50, 250)
            .text(quotation.userId?.email || 'Contact Email', 50, 265);

        // Table Header
        const tableTop = 320;
        doc.font('Helvetica-Bold');
        this.generateTableRow(doc, tableTop, 'Item', 'Category', 'Qty', 'Unit Price', 'Total');
        this.generateHr(doc, tableTop + 20);

        // Table Rows
        let i;
        const invoiceTableTop = 330;
        doc.font('Helvetica');

        for (i = 0; i < quotation.lineItems.length; i++) {
            const item = quotation.lineItems[i];
            const position = invoiceTableTop + (i + 1) * 35;

            // Handle long names
            const name = item.name.length > 35 ? item.name.substring(0, 32) + '...' : item.name;

            this.generateTableRow(
                doc,
                position,
                name,
                item.category,
                item.quantity.toString(),
                `INR ${item.unitPrice.toLocaleString()}`,
                `INR ${item.totalPrice.toLocaleString()}`
            );
            this.generateHr(doc, position + 22);
        }

        // Totals
        const subtotalPosition = invoiceTableTop + (i + 1) * 35 + 50;
        this.generateTableRow(doc, subtotalPosition, '', '', '', 'Subtotal', `INR ${quotation.subtotal.toLocaleString()}`);

        const totalMarginPosition = subtotalPosition + 25;
        this.generateTableRow(doc, totalMarginPosition, '', '', '', 'Margin & Handling', `INR ${quotation.totalMargin.toLocaleString()}`);

        doc.font('Helvetica-Bold');
        const grandTotalPosition = totalMarginPosition + 30;
        this.generateTableRow(doc, grandTotalPosition, '', '', '', 'Grand Total', `INR ${quotation.grandTotal.toLocaleString()}`);

        // Notes
        if (quotation.notes) {
            doc.moveDown(4);
            const notesPosition = doc.y > 600 ? doc.y : 550; // Ensure it doesn't overlap footer
            doc.fontSize(12).font('Helvetica-Bold').text('Important Notes:', 50, notesPosition);
            doc.fontSize(10).font('Helvetica').text(quotation.notes, 50, notesPosition + 20, { width: 450 });
        }

        // Footer
        const footerY = 730;
        this.generateHr(doc, footerY);
        doc.fontSize(8)
            .fillColor('#aaaaaa')
            .text('This is a computer-generated quotation and does not require a physical signature.', 50, footerY + 15, { align: 'center', width: 500 })
            .text('Thank you for choosing B2B Jewellery Sourcing Platform.', 50, footerY + 30, { align: 'center', width: 500 });

        doc.end();
    }

    generateTableRow(doc, y, item, category, qty, unitPrice, total) {
        doc.fontSize(10)
            .text(item, 50, y, { width: 200 })
            .text(category, 250, y, { width: 80 })
            .text(qty, 330, y, { width: 40, align: 'right' })
            .text(unitPrice, 380, y, { width: 90, align: 'right' })
            .text(total, 480, y, { width: 70, align: 'right' });
    }

    generateHr(doc, y) {
        doc.strokeColor('#eeeeee')
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();
    }
}

export default new PDFService();

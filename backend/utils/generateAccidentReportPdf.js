import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateAccidentReportPDF = async (accidentData, userData) => {
  return new Promise((resolve, reject) => {
    try {
      const reportId = `ACC-${Date.now()}`;
      const outputDir = "./reports";
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

      const outputPath = path.join(outputDir, `${reportId}.pdf`);
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      const professionalBlue = "#1976d2";
      const darkGray = "#424242";
      const lightGray = "#f5f5f5";

      const { prediction, repair_cost, imageUrl, location, timestamp } = accidentData;
      const { name, email, vehicleNumber, phone } = userData;

      doc.rect(0, 0, doc.page.width, 100)
        .fill(professionalBlue);

      doc.fillColor("white")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("AutoSureAI Accident Report", 50, 30);

      doc.fontSize(12)
        .text("Vehicle Damage Assessment & Analysis", 50, 65);

      doc.fontSize(8)
        .fillColor("white")
        .text(`Report ID: ${reportId}`, doc.page.width - 180, 75)
        .text(`Accident Date: ${new Date(timestamp).toLocaleString()}`, doc.page.width - 180, 90);

      doc.moveDown(2);
      doc.fillColor(darkGray).font("Helvetica-Bold").fontSize(16).text("ACCIDENT SUMMARY", 50, 120);
      doc.moveTo(50, 140).lineTo(doc.page.width - 50, 140).strokeColor(professionalBlue).lineWidth(2).stroke();

      const severityBoxY = 155;
      doc.rect(50, severityBoxY, doc.page.width - 100, 50)
        .fillColor(lightGray)
        .strokeColor(professionalBlue)
        .lineWidth(2)
        .fillAndStroke();

      doc.fillColor(darkGray)
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(`Damage Severity: ${prediction.severity.toUpperCase()}`, 65, severityBoxY + 15);

      doc.fontSize(10)
        .text(`AI Confidence: ${(prediction.confidence ).toFixed(1)}%`, 65, severityBoxY + 35)
        .text(`Assessment Time: ${new Date().toLocaleString()}`, doc.page.width / 2, severityBoxY + 35);

      const vehicleY = severityBoxY + 70;
      doc.fillColor(darkGray).font("Helvetica-Bold").fontSize(16).text("VEHICLE & OWNER DETAILS", 50, vehicleY);
      doc.moveTo(50, vehicleY + 20).lineTo(doc.page.width - 50, vehicleY + 20).strokeColor(professionalBlue).lineWidth(2).stroke();

      doc.rect(50, vehicleY + 30, doc.page.width - 100, 80)
        .fillColor(lightGray)
        .fill();

      doc.fillColor(darkGray)
        .font("Helvetica-Bold").fontSize(11)
        .text("Owner Information:", 65, vehicleY + 45);

      doc.font("Helvetica").fontSize(10)
        .fillColor("#000")
        .text(`Name: ${name}`, 65, vehicleY + 60)
        .text(`Email: ${email}`, 65, vehicleY + 75)
        .text(`Phone: ${phone || "Not provided"}`, 65, vehicleY + 90);

      doc.font("Helvetica-Bold").fontSize(11)
        .fillColor(darkGray)
        .text("Vehicle Information:", doc.page.width / 2, vehicleY + 45);

      doc.font("Helvetica").fontSize(10)
        .fillColor("#000")
        .text(`License Plate: ${vehicleNumber}`, doc.page.width / 2, vehicleY + 60)
        .text(`Report ID: ${reportId}`, doc.page.width / 2, vehicleY + 75)
        .text(`Status: ${accidentData.status || "Analyzed"}`, doc.page.width / 2, vehicleY + 90);

      const costY = vehicleY + 130;
      doc.fillColor(darkGray).font("Helvetica-Bold").fontSize(16).text("REPAIR COST ESTIMATE", 50, costY);
      doc.moveTo(50, costY + 20).lineTo(doc.page.width - 50, costY + 20).strokeColor(professionalBlue).lineWidth(2).stroke();

      const costBoxY = costY + 30;
      doc.rect(50, costBoxY, doc.page.width - 100, 70)
        .fillColor(lightGray)
        .strokeColor(professionalBlue)
        .lineWidth(2)
        .fillAndStroke();

      doc.fillColor(darkGray)
        .font("Helvetica-Bold").fontSize(16)
        .text(`$${repair_cost.estimated_cost}`, 65, costBoxY + 15);

      doc.fontSize(10)
        .text("Estimated Repair Cost", 65, costBoxY + 35);

      doc.font("Helvetica").fontSize(9)
        .fillColor("#000")
        .text(`Cost Range: $${repair_cost.min_cost} - $${repair_cost.max_cost}`, doc.page.width / 2, costBoxY + 20)
        .text(`Confidence: ${repair_cost.confidence ? (repair_cost.confidence).toFixed(1) + '%' : 'N/A'}`, doc.page.width / 2, costBoxY + 35)
        .text(`Currency: ${repair_cost.currency || 'USD'}`, doc.page.width / 2, costBoxY + 50);

      const locationY = costBoxY + 90;
      doc.fillColor(darkGray).font("Helvetica-Bold").fontSize(16).text("ACCIDENT LOCATION & EVIDENCE", 50, locationY);
      doc.moveTo(50, locationY + 20).lineTo(doc.page.width - 50, locationY + 20).strokeColor(professionalBlue).lineWidth(2).stroke();

      doc.font("Helvetica-Bold").fontSize(11)
        .fillColor(darkGray)
        .text("Accident Location:", 65, locationY + 40);

      doc.font("Helvetica").fontSize(10)
        .fillColor("#000")
        .text(`Address: ${location.address || 'Not specified'}`, 65, locationY + 55)
        .text(`Coordinates: ${location.lat}, ${location.lon}`, 65, locationY + 70);

      doc.font("Helvetica-Bold").fontSize(11)
        .fillColor(darkGray)
        .text("Damage Evidence:", 65, locationY + 90);

      doc.font("Helvetica").fontSize(9)
        .fillColor(professionalBlue)
        .text("View Damage Photos", 65, locationY + 105, { 
          link: imageUrl, 
          underline: true 
        })
        .text(imageUrl, 65, locationY + 120, { 
          link: imageUrl, 
          underline: false,
          width: doc.page.width - 100,
          opacity: 0.7 
        });

      if (prediction.class_probabilities) {
        const probY = locationY + 150;
        doc.fillColor(darkGray).font("Helvetica-Bold").fontSize(16).text("DAMAGE PROBABILITY BREAKDOWN", 50, probY);
        doc.moveTo(50, probY + 20).lineTo(doc.page.width - 50, probY + 20).strokeColor(professionalBlue).lineWidth(2).stroke();

        const { minor, moderate, severe } = prediction.class_probabilities;
        const probStartY = probY + 35;

        doc.font("Helvetica").fontSize(10)
          .fillColor("#000")
          .text(`Minor Damage: ${(minor).toFixed(1)}%`, 65, probStartY)
          .text(`Moderate Damage: ${(moderate).toFixed(1)}%`, 65, probStartY + 15)
          .text(`Severe Damage: ${(severe).toFixed(1)}%`, 65, probStartY + 30);
      }

      const footerY = doc.page.height - 60;
      doc.rect(0, footerY, doc.page.width, 60)
        .fill(lightGray);

      doc.fillColor(darkGray)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("EMERGENCY CONTACTS: 100, 112, 102, 108, 1073, 1033", 50, footerY + 15)
        .font("Helvetica")

      doc.fontSize(7)
        .fillColor("#666")
        .text("This report is automatically generated by AutoSureAI's AI-powered damage assessment system.", 50, footerY + 45, { align: "center" })
        .text(`Report generated on ${new Date().toLocaleString()} | Confidential - For insurance and repair purposes only`, 50, footerY + 55, { align: "center" });

      doc.end();

      writeStream.on("finish", () => {
        console.log(`✅ Accident report generated: ${outputPath}`);
        resolve({ path: outputPath, reportId });
      });
      writeStream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};
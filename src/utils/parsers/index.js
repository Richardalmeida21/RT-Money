import { parseOFX } from '../ofxParser';
import { parseExcel } from './excelParser';
import { parsePDF } from './pdfParser';

export const parseFile = async (file) => {
    const name = file.name.toLowerCase();

    if (name.endsWith('.ofx') || name.endsWith('.xml')) {
        return parseOFX(file);
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
        return parseExcel(file);
    } else if (name.endsWith('.pdf')) {
        return parsePDF(file);
    } else {
        throw new Error("Formato de arquivo não suportado.");
    }
};

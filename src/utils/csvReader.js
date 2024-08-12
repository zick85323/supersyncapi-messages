// src/utils/csvReader.js
import Papa from 'papaparse';

export const readCSV = (file, callback) => {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            callback(results.data);
        },
    });
};

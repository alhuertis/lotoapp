import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CSVRecord } from '../CSVRecord';


@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {


  public records: any[] = [];
  @ViewChild('csvReader', {static: false}) csvReader: any;

  constructor() { }

  ngOnInit() {
  }

  uploadListener($event: any): void {

    const text = [];
    const files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0])) {

      const input = $event.target;
      const reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        const csvData = reader.result;
        const csvRecordsArray = (csvData as string).split(/\r\n|\n/);

        const headersRow = this.getHeaderArray(csvRecordsArray);

        this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);

        this.sort();
      };

      reader.onerror = () => {
        console.log('error is occured while reading file!');
      };

    } else {
      alert('Please import valid .csv file.');
      this.fileReset();
    }
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    const csvArr = [];

    for ( const item of csvRecordsArray ) {
      const curruntRecord = (item as string).split(';');
      if (curruntRecord.length === headerLength) {
        const csvRecord: CSVRecord = new CSVRecord();
        csvRecord.numero = curruntRecord[0].trim();
        csvRecord.apariciones = curruntRecord[1].trim();
        csvArr.push(csvRecord);
      }
    }
    return csvArr;
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith('.csv');
  }

  getHeaderArray(csvRecordsArr: any) {
    const headers = (csvRecordsArr[0] as string).split(';');
    const headerArray = [];
    for (const item of headers) {
      headerArray.push(item);
    }
    return headerArray;
  }

  fileReset() {
    this.csvReader.nativeElement.value = '';
    this.records = [];
  }

  sort() {
    console.log('Ordenando');
    this.records.sort((a, b) => {
      return (a as CSVRecord).apariciones - (b as CSVRecord).apariciones;
    }).reverse();
  }

  descartarNumero(i: number){
    (this.records[i] as CSVRecord).descartado = ! (this.records[i] as CSVRecord).descartado;
  }




}

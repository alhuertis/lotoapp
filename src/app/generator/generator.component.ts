import { Apuesta } from './../Apuesta';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CSVRecord } from '../CSVRecord';



@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {


  public records: CSVRecord[] = [];
  @ViewChild('csvReader', {static: false}) csvReader: any;
  public rangeValues: number[] = [110, 190];
  public generar = false;
  public apuestas: Apuesta[] = [];

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
        this.generar = true;
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

  descartarNumero(i: number) {
    (this.records[i] as CSVRecord).descartado = ! (this.records[i] as CSVRecord).descartado;
  }


  generarNumeroApuetas(num: number) {
    for (let i = 0; i < num; i++) {
      this.generarApuesta();
    }
  }

  generarApuesta() {

    console.log('Rango seleccionado ' + this.rangeValues);
    let apuesta: Apuesta = this.crearCombinacion();

    // Valido si cumple los requisitos para ser válida
    while (!this.validarApuesta(apuesta)) {
      apuesta = this.crearCombinacion();
    }

    // La añado a la lista de apuestas
    this.apuestas.push(apuesta);

  }


  crearCombinacion(): Apuesta {
    const apuesta: Apuesta = new Apuesta();
    let rand = this.getRandomArbitrary(0, 7);

    while (this.records[rand].descartado) {
      rand = this.getRandomArbitrary(0, 6);
    }

    apuesta.n1 = this.records[rand].numero;
    apuesta.combinacion.push(this.records[rand].numero);
    // console.log('rand: ' + rand);
    // console.log('numero escogido:' + apuesta.n1);

    for (let i = 2; i < 6; i++) {
      rand = this.getRandomArbitrary(7, 43);
      while (this.records[rand].descartado) {
        rand = this.getRandomArbitrary(7, 43);
      }

      switch (i) {
        case 2: apuesta.n2 = this.records[rand].numero; apuesta.combinacion.push(this.records[rand].numero); break;
        case 3: apuesta.n3 = this.records[rand].numero; apuesta.combinacion.push(this.records[rand].numero); break;
        case 4: apuesta.n4 = this.records[rand].numero; apuesta.combinacion.push(this.records[rand].numero); break;
        case 5: apuesta.n5 = this.records[rand].numero; apuesta.combinacion.push(this.records[rand].numero); break;
      }
    } // fin for

    rand = this.getRandomArbitrary(43, 49);

    while (this.records[rand].descartado) {
      rand = this.getRandomArbitrary(43, 49);
    }
    apuesta.n6 = this.records[rand].numero;
    apuesta.combinacion.push(this.records[rand].numero);

    apuesta.combinacion.sort((a, b) => a - b);
    apuesta.printApuesta();

    return apuesta;
  }

  getRandomArbitrary(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }


  validarApuesta(apuesta: Apuesta): boolean {

    // Cumple el rango de suma?
    console.log('Suma: ' + apuesta.getSuma() + ' Rango: ' + this.rangeValues);
    if (apuesta.getSuma() < this.rangeValues[0] || apuesta.getSuma() > this.rangeValues[1]) {
      return false;
    }

    // Comprobar que no se repiten (esto igual puede ser mientras se va añadiendo el numero)

    // Comprobar que no sean todos pares o impares

    return true;
  }


}

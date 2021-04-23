import { Apuesta } from './../Apuesta';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CSVRecord } from '../CSVRecord';
import { NumerosLoto } from '../NumerosLoto';
import { ExcelService } from '../services/excel.service';



@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {


  public records: CSVRecord[] = [];
  @ViewChild('csvReader', {static: false}) csvReader: any;
  public rangeValues: number[] = [100, 200];
  public generar = false;
  public apuestas: Apuesta[] = [];
  public contadorNumeros: NumerosLoto[] = [];

  constructor(private excelService: ExcelService) { }

  ngOnInit() {

    this.resetContadorNumeros();
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

        this.sortByApariciones();
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

  sortByNumero() {
    console.log('Ordenando');
    this.records.sort((a, b) => {
      return (a as CSVRecord).numero - (b as CSVRecord).numero;
    });
  }

  sortByApariciones() {
    console.log('Ordenando');
    this.records.sort((a, b) => {
      //Ordeno por apariciones y a igualdad de apariciones ordeno por número de menor a mayor
      return (a as CSVRecord).apariciones - (b as CSVRecord).apariciones || (b as CSVRecord).numero - (a as CSVRecord).numero ;
    }).reverse();
  }

  sortByContador() {
    console.log('Ordenando');
    this.contadorNumeros.sort((a, b) => {
      return (a as NumerosLoto).contador - (b as NumerosLoto).contador;
    }).reverse();
  }

  descartarNumero(i: number) {
    (this.records[i] as CSVRecord).descartado = ! (this.records[i] as CSVRecord).descartado;
    (this.records[i] as CSVRecord).fijo = false;
  }

  fijarNumero(i: number){
    this.desmarcarFijo();

    (this.records[i] as CSVRecord).descartado = false;
    (this.records[i] as CSVRecord).fijo = true; 
  }

  desmarcarFijo(){
    this.records.forEach( item => {
      if (item.fijo) {
        item.fijo = false;
      }
    });
  }


  generarNumeroApuetas(num: number) {
    for (let i = 0; i < num; i++) {
      this.generarApuesta();
    }
  }

  generarApuesta() {

    this.sortByApariciones();
    console.log('Rango seleccionado ' + this.rangeValues);
    let apuesta: Apuesta = this.crearCombinacion();

    // Valido si cumple los requisitos para ser válida
    while (!this.validarApuesta(apuesta)) {
      apuesta = this.crearCombinacion();
    }

    // La añado a la lista de apuestas
    this.apuestas.unshift(apuesta);

    // Actualizamos el contador de apariciones por cada combinación que se añada
    this.actualizarContadores(apuesta);
    // Ordenamos el contador de apariciones de mayor a menos
    this.sortByContador();

  }

  actualizarContadores(apuesta: Apuesta) {
    apuesta.combinacion.forEach(element => {
      this.contadorNumeros.filter(n => n.numero === Number(element)).map((x, y) => { x.contador += 1; });
    });
  }


  crearCombinacion(): Apuesta {
    const apuesta: Apuesta = new Apuesta();
    let apareceFijo = false;
    let rand: number;

    for(let i = 0; i <= 7; i++){
      if(this.records[i].fijo){
        apuesta.n1 = this.records[i].numero;
        apareceFijo= true;
        break;
      }
    }

    if(!apareceFijo){
      rand = this.getRandomArbitrary(0, 7);

      while (this.records[rand].descartado) {
        rand = this.getRandomArbitrary(0, 6);
      }

      apuesta.n1 = this.records[rand].numero;
      apuesta.combinacion.push(this.records[rand].numero);
      // console.log('rand: ' + rand);
      // console.log('numero escogido:' + apuesta.n1);

    }

    

    for (let i = 2; i < 6; i++) {
      rand = this.getRandomArbitrary(7, 43);
      while (this.records[rand].descartado || apuesta.estaRepetido(this.records[rand].numero)) {
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

    // Comprobar que no sean todos pares o impares
    const impares = apuesta.combinacion.filter(n => n % 2);
    if (impares.length < 2 || impares.length > 4) { // Solo contemplamos pares/impares de la siguiente forma: 4/2, 3/3, 2/4.
      console.log('Descartamos por no cumplir pares/impares de la siguiente forma: 4/2, 3/3, 2/4');
      return false;
    }

    // Comprobar que la combinación no haya salido ya
    const repetidos = this.apuestas.filter(n => n.combinacion === apuesta.combinacion);
    if (repetidos.length > 0) {
      return false;
    }

    // Comprobar figura Bajos/Altos. Aceptados: 4/2, 3/3 y 2/4
    const bajos = apuesta.combinacion.filter(n => n <= 25);
    if (bajos.length  < 2 || bajos.length > 4) {
      console.log('Descartamos por no cumplir bajos/altos de la siguiente forma: 4/2, 3/3, 2/4');
      return false;
    }

    // Comprobamos las figuras de seguidos para aceptar: 2/1/1/1/1 y 1/1/1/1/1/1
    let cont = 0;
    for (let i = 1; i <= apuesta.combinacion.length; i++) {
      if (Number(apuesta.combinacion[i - 1]) + 1 === Number(apuesta.combinacion[i])) {
        cont++;
      }
    }
    if (cont > 1) {
      console.log('Descartamos por no cumplir figura de seguidos de la siguiente forma: 2/1/1/1/1 y 1/1/1/1/1/1');
      return false;
    }


    // Comprobamos que se cumpla la estadísta 'Terminaciones iguales' de la siguiente forma: 2/2/1/1, 2/1/1/1/1 ó 1/1/1/1/1/1
    // Para ello nos basamos en un sistema de contador por iteraciones, si se encuentra 3 repeticiones paramos, y si llega al final
    // y el contador es igual a 2 quiere decir que se cumple y como maximo encontró 2/2/1/1
    // pruebas -> apuesta.combinacion = ['2', '6', '14', '36', '32', '47'];
    cont = 0;
    let repSeguidas;
    for (let i = 0; i < 6; i++) {
      repSeguidas = 0;

      for (let x = i + 1; x < 6; x++) {
        if (Number(apuesta.combinacion[i] % 10) === Number(apuesta.combinacion[x] % 10)) {
          repSeguidas++;
          cont++;
        }
        if (repSeguidas > 1) {
          console.log('Descartamos por no cumplir Terminaciones iguales de la siguiente forma: 2/2/1/1, 2/1/1/1/1 ó 1/1/1/1/1/1');
          return false;
        }
      }
    }
    if (cont > 2) {
      console.log('Descartamos por no cumplir Terminaciones iguales de la siguiente forma: 2/2/1/1, 2/1/1/1/1 ó 1/1/1/1/1/1');
      return false;
    }


    return true;
  }

  marcarApuesta(num: number) {
    this.apuestas[num].marcada = !this.apuestas[num].marcada;
  }

  limpiar() {
    for (let i = 0; i < 49; i++) {
      this.contadorNumeros[i] = new NumerosLoto(i + 1);
    }
    this.apuestas = [];
  }

  exportAsXLSX(): void {
    if (this.apuestas.length > 0) {
      const datos: any[] = [];
      for (const item of this.apuestas) {
        datos.push(item.combinacion);
      }
      this.excelService.exportAsExcelFile(datos, 'Geloto');
    }
  }


  desmarcarNumeros() {
    this.records.forEach( item => {
      if (item.descartado) {
        item.descartado = false;
      }
    });
  }

  borrarApuesta(index: number) {
    this.apuestas.splice(index, 1);
    this.resetContadorNumeros();
    this.apuestas.forEach(item => {
      this.actualizarContadores(item);
    });
    this.sortByContador();
  }


  resetContadorNumeros() {
    for (let i = 0; i < 49; i++) {
      this.contadorNumeros[i] = new NumerosLoto(i + 1);
    }
  }


}

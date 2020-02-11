export class Apuesta {
  public n1: number;
  public n2: number;
  public n3: number;
  public n4: number;
  public n5: number;
  public n6: number;
  public marcada: boolean;

  public combinacion: any[] = [];

  printApuesta() {
    console.log('Apuesta: ' + this.n1 + ' ' + this.n2 + ' ' + this.n3 + ' ' + this.n4 + ' ' + this.n5 + ' ' + this.n6 );
    console.log(this.combinacion);
  }

  getSuma() {
    let suma = 0;
    for (const item of this.combinacion) {
      suma += Number(item);
    }
    return suma;
  }

  estaRepetido(num: number): boolean {
    return this.combinacion.includes(num);
  }


}

const precio = document.getElementById('precio');
const form = document.getElementById('form');
const outputElement = document.getElementById('output');
const cascada = document.getElementById('cascada');
const importar = document.getElementById('importar');
const precioImportacion = document.getElementById('importacion')
const paypal = document.getElementById('paypal');
const importbool = false;

class Tax{
    constructor(name, pct, etc){
        this.name = name
        this.pct = pct
        this.etc = etc
    }

    getPctString(){
        return this.pct + '%'
    }

    getValuePlusTaxesString(price){
        const value = sumPercentage(price, this.pct)
        return value
    }

    getTaxedValue(price){
        const value = getPercentage(price, this.pct)
        return value
    }

}

const PAIS = new Tax("PAIS", 35);
const PERCEPCION = new Tax("PERCEPCION AFIP RG 4815", 45, {
    masDe300USD: 25
})

PERCEPCION.getValuePlusTaxesString = (price) => {
    if(price > 300){
        return sumPercentage(price, PERCEPCION.pct + PERCEPCION.etc.masDe300USD) + '$ (+25% MAS DE 300 USD)'
    }
    return sumPercentage(price, PERCEPCION.pct)
}

PERCEPCION.getTaxedValue = (price) => {
    if(price > 300){
        return getPercentage(price, PERCEPCION.pct + PERCEPCION.etc.masDe300USD)
    }
    return getPercentage(price, PERCEPCION.pct)
}



form.addEventListener('submit', (e) => {
    e.preventDefault();
    let value = parseFloat(precio.value);
    const costoImportacion = parseFloat(precioImportacion.value) ? parseFloat(precioImportacion.value) : 0
    value += costoImportacion
    const usingPaypal = paypal.checked
    const paypalPercent = usingPaypal ? 10 : 0;
    if(usingPaypal) value += getPercentage(value, 10)
    const accumulatedTaxes = PAIS.getTaxedValue(value) + PERCEPCION.getTaxedValue(value) + getPercentage(value, paypalPercent);
    const showInCascade = cascada.checked
    const importarBool = importar.checked
    const internetPaid = value + accumulatedTaxes
    if(isNaN(value)) return



    if(!showInCascade){
    outputElement.innerHTML = `
    CON ${PAIS.name} (${PAIS.getPctString()}): ${PAIS.getValuePlusTaxesString(value)}$ (AFIP chorea: ${PAIS.getTaxedValue(value)}$)<br>
    CON ${PERCEPCION.name} (${PERCEPCION.getPctString()}): ${PERCEPCION.getValuePlusTaxesString(value)}$ (AFIP chorea: ${PERCEPCION.getTaxedValue(value)}$)<br>
    TOTAL APROXIMADO: ${internetPaid}$ (AFIP chorea: ${accumulatedTaxes}$)

    `
    }else{
        outputElement.innerHTML = `
        + ${PAIS.name} (${PAIS.getPctString()}): ${PAIS.getValuePlusTaxesString(value)}$<br>
        + ${PERCEPCION.name} (${value < 300 ? PERCEPCION.getPctString() : PERCEPCION.etc.masDe300USD + PERCEPCION.pct + '%'}): ${value + PERCEPCION.getTaxedValue(value) + PAIS.getTaxedValue(value)}$<br>
        TOTAL APROXIMADO: ${internetPaid}$

        `
    };



    if(importarBool){
        const productValue = value - costoImportacion
        const importingTax = getCustomsTaxes(productValue)
        const totalImporting = importingTax + internetPaid
        if(productValue <= 50){
            outputElement.innerHTML += `
        <br><br><br> Menor o igual a 50 USD no paga impuestos de aduana!
        `
    }
        else{
            if(!showInCascade){
                outputElement.innerHTML += `<br><br><br>
            
                CON DERECHO A LA IMPORTACIÓN (50% sobre el excedente de 50USD): ${productValue + importingTax}$ (AFIP chorea: ${importingTax}$)<br>
                TOTAL APROXIMADO IMPORTANDO: ${totalImporting}$ (AFIP chorea: ${accumulatedTaxes + importingTax}$)
                `
            }else{
                outputElement.innerHTML += `<br><br><br>
            
                + DERECHO A LA IMPORTACIÓN (50% sobre el excedente de 50USD): ${totalImporting}$<br>
                TOTAL APROXIMADO IMPORTANDO: ${totalImporting}$
                `
            }
        }
    }
})



function getCustomsTaxes(value){
    const customsDiscount = value - 50

    return customsDiscount - getPercentage(customsDiscount, 50)
}

function sumPercentage(value, percentage) {
    return (value * percentage) / 100 + value
 } 

function getPercentage(value, percentage){
    return (value * percentage) / 100
}
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
    const unalteredValue = value
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
    CON ${PAIS.name} (${PAIS.getPctString()}): ${PAIS.getValuePlusTaxesString(value)}$ (${PAIS.getTaxedValue(value)}$)<br>
    CON ${PERCEPCION.name} (${PERCEPCION.getPctString()}): ${PERCEPCION.getValuePlusTaxesString(value)}$ (${PERCEPCION.getTaxedValue(value)}$)<br><br>
    TOTAL APROXIMADO COMPRA ONLINE: ${internetPaid}$

    `
    }else{
        outputElement.innerHTML = `
        + ${PAIS.name} (${PAIS.getPctString()}): ${PAIS.getValuePlusTaxesString(value)}$<br>
        + ${PERCEPCION.name} (${value < 300 ? PERCEPCION.getPctString() : PERCEPCION.etc.masDe300USD + PERCEPCION.pct + '%'}): ${value + PERCEPCION.getTaxedValue(value) + PAIS.getTaxedValue(value)}$<br><br>
        TOTAL APROXIMADO COMPRA ONLINE: ${internetPaid}$

        `
    };

    if(importarBool){
        const importingTax = getCustomsTaxes(unalteredValue)
        const totalImporting = importingTax + internetPaid
        const totalTaxes = accumulatedTaxes + importingTax
        if(unalteredValue <= 50){
            return outputElement.innerHTML += `
        <br><br><br>Primeras 12 compras del año menor o igual a 50 USD no pagan impuestos de aduana!
        `
    }
        else{
            if(!showInCascade){
                outputElement.innerHTML += `<br><br><br>
            
                CON DERECHO A LA IMPORTACIÓN (50% sobre el excedente de 50USD): ${unalteredValue + importingTax}$ (${importingTax}$)<br><br>
                TOTAL APROXIMADO IMPORTANDO: ${totalImporting}$ (${totalTaxes}$)
                `
            }else{
                outputElement.innerHTML += `<br><br><br>
            
                + DERECHO A LA IMPORTACIÓN (50% sobre el excedente de 50USD): ${totalImporting}$<br><br>
                TOTAL APROXIMADO IMPORTANDO: ${totalImporting}$
                `
            }
            
        }

        const porcentajeAduanero = getPercentageNumber(unalteredValue, importingTax)

        outputElement.innerHTML += `<br><br>
        Total impuestos aduana: ${importingTax}$<br>
        Porcentaje de impuesto aduanero: ${porcentajeAduanero}%<br><br>
        TOTAL IMPUESTOS: ${totalTaxes}$<br><br><br>
        `

        if(accumulatedTaxes + importingTax > unalteredValue) outputElement.innerHTML += `
        ESTAS PAGANDO MAS IMPUESTOS QUE PRODUCTO
        `

    }else{
        outputElement.innerHTML += `<br><br>Total impuestos: ${accumulatedTaxes}$`
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

function getPercentageNumber(percentedValue, comparedValue){
    return (comparedValue * 100) / percentedValue
}
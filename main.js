const options = {method: 'GET'};

function conversorMoneda (){
    const moneda = document.getElementById("moneda").value;
    fetch(`https://exchange-rates.abstractapi.com/v1/live?api_key=15a0a5b95d3243d88a599ba0ffe67358&base=${moneda||"USD"}`, options)
    .then(response => response.json())
    .then(response => {
        if(response.error) {
            alert(JSON.stringify(response))
        }else{
            const container = document.getElementById("estado-monedas")
            container.innerHTML="";
            for (const rate in response.exchange_rates) {
                container.innerHTML += `<div>${rate} : ${response.exchange_rates[rate]}</div>`
            }
        }
    })
    .catch(err => {
        console.log(err)
    });
}
conversorMoneda()


function formatNumber(input) {
    // Función para formatear un número con puntos como separadores de miles
    let value = input.value.replace(/\D/g, ""); // Eliminar caracteres no numéricos
    input.value = Number(value).toLocaleString("es-ES"); // Formatear como número con separadores de miles
}

function getNumberValue(inputId) {
    return parseFloat(document.getElementById(inputId).value.replace(/\D/g, ""));
}

function estudioDeCredito(valorDelPrestamo, tiempo, ingresos) {
    const valorMaximoDelPrestamo = ingresos / 2;
    const cuotasMensuales = [];

    if (valorDelPrestamo > valorMaximoDelPrestamo || tiempo > 6) {
        return 'No es posible prestarte dinero';
    } else {
        let saldoPendiente = valorDelPrestamo;
        const tasaInteresInicial = 0.015;

        for (let mes = 1; mes <= tiempo; mes++) {
            const abono = Math.round(valorDelPrestamo / tiempo);
            const intereses = Math.round(saldoPendiente * tasaInteresInicial);
            cuotasMensuales.push({
                mes,
                abono,
                intereses,
                cuota: abono + intereses,
                deuda: saldoPendiente,
            });
            saldoPendiente -= abono;
        }
        /*    console.log(cuotasMensuales);
        console.table(cuotasMensuales); */
        return cuotasMensuales;
    }
}

function escribirResultado(resultado) {
    const resultadoDiv = document.getElementById("resultado");
    if (typeof resultado === "string") {
        resultadoDiv.innerHTML = resultado;
    } else {
        let cuotasHtml = '<h2>Detalles de las cuotas:</h2>';
        cuotasHtml += '<table>';
        cuotasHtml += '<tr><th>Mes</th><th>Cuota</th><th>Deuda restante</th></tr>';
        resultado.forEach(cuota => {
            cuotasHtml += `<tr><td>${cuota.mes}</td><td>${cuota.cuota}</td><td>${cuota.deuda}</td></tr>`;
        });
        cuotasHtml += '</table>';
        resultadoDiv.innerHTML = cuotasHtml;
    }
}

function calcularEstudioDeCredito() {
    const valorCredito = getNumberValue("valorCredito");
    const plazoMeses = parseInt(document.getElementById("plazoMeses").value);
    const ingresosMensuales = getNumberValue("ingresosMensuales");
    const resultado = estudioDeCredito(valorCredito, plazoMeses, ingresosMensuales);

    let historial = JSON.parse(localStorage.getItem("historialConsultas")) || [];
    historial.push({input:{ valorCredito, plazoMeses, ingresosMensuales }, output: resultado });
    localStorage.setItem("historialConsultas", JSON.stringify(historial));

    //clear values of inputs
    document.getElementById('valorCredito').value = '';
    document.getElementById('plazoMeses').value = '';
    document.getElementById('ingresosMensuales').value = '';
    escribirResultado(resultado)
    mostrarHistorial();
}

function eliminarConsulta(index) {
    const historial = JSON.parse(localStorage.getItem("historialConsultas")) || [];
    if (index >= 0 && index < historial.length) {
        historial.splice(index, 1);
        localStorage.setItem("historialConsultas", JSON.stringify(historial));
    }
}

function mostrarHistorial() {
    const historial = JSON.parse(localStorage.getItem("historialConsultas")) || [];
    const contenedorHistorial = document.getElementById('historialConsultas');
    contenedorHistorial.innerHTML = ''; // Limpiar contenido previo

    historial.forEach((consulta, index) => {
        const divConsulta = document.createElement('div');
        divConsulta.innerHTML = `
            <div key=${index + 1} class="get-consulta border border-gray-300 p-4 mb-4" data-index="${index}">
            <h3 class="text-lg font-semibold mb-2">Consulta ${index + 1}</h3>
            <p>Valor del crédito: ${consulta.input.valorCredito}</p>
            <p>Plazo en meses: ${consulta.input.plazoMeses}</p>
            <p>Ingresos mensuales: ${consulta.input.ingresosMensuales}</p>
                <button class="eliminar-consulta bg-red-500 text-white px-2 py-1 rounded-md mt-2" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                Eliminar
                </button>
            </div>
        `;

        // Agregar evento click al botón de eliminar
        const botonEliminar = divConsulta.querySelector('.eliminar-consulta');
        botonEliminar.addEventListener('click', () => {
            eliminarConsulta(index);
            mostrarHistorial(); // Actualizar la vista después de eliminar
        });

        // Agregar evento click al botón al seleccionar la consulta
        const getConsulta = divConsulta.querySelector('.get-consulta');
        getConsulta.addEventListener('click', () => {
            escribirResultado(consulta.output)

        });

        contenedorHistorial.appendChild(divConsulta);
    });
}

function limpiarHistorial() {
    localStorage.removeItem("historialConsultas");
    mostrarHistorial();
}

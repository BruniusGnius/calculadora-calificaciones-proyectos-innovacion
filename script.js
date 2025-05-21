document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("rubricaForm");
  const resetButton = document.getElementById("resetButton");
  const resultadosDiv = document.getElementById("resultados");
  const copyInputsButton = document.getElementById("copyInputsButton"); // Botón para copiar entradas

  // Referencias a spans de resultados detallados
  const brutoSpans = {
    innovacion: document.getElementById("bruto_innovacion"),
    tecnologia: document.getElementById("bruto_tecnologia"),
    impacto: document.getElementById("bruto_impacto"),
    colaboracion: document.getElementById("bruto_colaboracion"),
    presentacion: document.getElementById("bruto_presentacion"),
  };
  const ponderadoSpans = {
    innovacion: document.getElementById("ponderado_innovacion"),
    tecnologia: document.getElementById("ponderado_tecnologia"),
    impacto: document.getElementById("ponderado_impacto"),
    colaboracion: document.getElementById("ponderado_colaboracion"),
    presentacion: document.getElementById("ponderado_presentacion"),
  };

  // Referencias a resultados finales
  const calificacionFinalSpan = document.getElementById("calificacionFinal");
  const calificacionGniusSpan = document.getElementById("calificacionGnius");
  const descripcionGniusSpan = document.getElementById("descripcionGnius");
  const feedbackGniusDiv = document.getElementById("feedbackGnius");

  const criteriosConfig = {
    innovacion: {
      indicadores: [
        "innovacion_problema",
        "innovacion_nivel",
        "innovacion_metodologia",
        "innovacion_prototipo",
      ],
      puntajeMaxBruto: 12,
      puntosPonderados: 35,
    },
    tecnologia: {
      indicadores: ["tecnologia_aplicacion", "tecnologia_integracion"],
      puntajeMaxBruto: 6,
      puntosPonderados: 25,
    },
    impacto: {
      indicadores: ["impacto_alcance", "impacto_ods", "impacto_beneficio"],
      puntajeMaxBruto: 9,
      puntosPonderados: 20,
    },
    colaboracion: {
      indicadores: ["colaboracion_metodologias", "colaboracion_participacion"],
      puntajeMaxBruto: 6,
      puntosPonderados: 10,
    },
    presentacion: {
      indicadores: [
        "presentacion_claridad",
        "presentacion_argumentacion",
        "presentacion_comunicacion",
      ],
      puntajeMaxBruto: 9,
      puntosPonderados: 10,
    },
  };

  const escalaGnius = [
    {
      min: 95,
      max: 100,
      gnius: 10,
      descripcion: "¡Extraordinario!",
      termometro: "termometro-verde",
    },
    {
      min: 90,
      max: 94.99,
      gnius: 9,
      descripcion: "¡Excelente!",
      termometro: "termometro-verde",
    },
    {
      min: 80,
      max: 89.99,
      gnius: 8,
      descripcion: "¡Muy Bien!",
      termometro: "termometro-verde",
    },
    {
      min: 70,
      max: 79.99,
      gnius: 7,
      descripcion: "¡Bien Hecho!",
      termometro: "termometro-verde",
    },
    {
      min: 60,
      max: 69.99,
      gnius: 6,
      descripcion: "¡Aprobado!",
      termometro: "termometro-verde",
    },
    {
      min: 55,
      max: 59.99,
      gnius: 5,
      descripcion: "¡Estás Cerca!",
      termometro: "termometro-amarillo",
    },
    {
      min: 50,
      max: 54.99,
      gnius: 4,
      descripcion: "¡Casi!",
      termometro: "termometro-amarillo",
    },
    {
      min: 40,
      max: 49.99,
      gnius: 3,
      descripcion: "Un Poco Más",
      termometro: "termometro-rojo",
    },
    {
      min: 30,
      max: 39.99,
      gnius: 2,
      descripcion: "Sigue Intentando",
      termometro: "termometro-rojo",
    },
    {
      min: 0,
      max: 29.99,
      gnius: 1,
      descripcion: "Necesita Mejorar Mucho",
      termometro: "termometro-rojo",
    },
  ];

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    calcularResultados();
  });

  resetButton.addEventListener("click", function () {
    form.reset();
    resultadosDiv.classList.add("hidden");
    feedbackGniusDiv.classList.remove(
      "termometro-rojo",
      "termometro-amarillo",
      "termometro-verde"
    );

    for (const critKey in criteriosConfig) {
      const criterioDiv = document.getElementById(`resultado-${critKey}`);
      if (criterioDiv) {
        criterioDiv.classList.remove("border-rojo", "border-amarillo");
      }
    }
  });

  copyInputsButton.addEventListener("click", () => {
    const selectedValues = [];
    let allFieldsSelectedForCopy = true;

    // Asegurar el orden de los indicadores según el HTML (y la rúbrica original)
    const orderedIndicadorNames = [
      "innovacion_problema",
      "innovacion_nivel",
      "innovacion_metodologia",
      "innovacion_prototipo",
      "tecnologia_aplicacion",
      "tecnologia_integracion",
      "impacto_alcance",
      "impacto_ods",
      "impacto_beneficio",
      "colaboracion_metodologias",
      "colaboracion_participacion",
      "presentacion_claridad",
      "presentacion_argumentacion",
      "presentacion_comunicacion",
    ];

    orderedIndicadorNames.forEach((indicadorName) => {
      const radios = document.getElementsByName(indicadorName);
      let valorSeleccionado = ""; // Usar string vacío si no está seleccionado
      let algunoSeleccionado = false;
      for (const radio of radios) {
        if (radio.checked) {
          valorSeleccionado = radio.value;
          algunoSeleccionado = true;
          break;
        }
      }
      if (!algunoSeleccionado) {
        allFieldsSelectedForCopy = false;
      }
      selectedValues.push(valorSeleccionado);
    });

    if (!allFieldsSelectedForCopy) {
      alert(
        "Advertencia: No todos los indicadores han sido calificados. Se copiarán los valores disponibles (algunos podrían estar vacíos)."
      );
    }

    const stringToCopy = selectedValues.join("\t");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(stringToCopy)
        .then(() => {
          alert("¡Calificaciones ingresadas copiadas al portapapeles!");
        })
        .catch((err) => {
          console.error("Error al copiar al portapapeles: ", err);
          alert(
            "Error al intentar copiar las calificaciones. Revisa la consola para más detalles."
          );
        });
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = stringToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert(
          "¡Calificaciones ingresadas copiadas al portapapeles! (método alternativo)"
        );
      } catch (err) {
        console.error("Error al copiar con método alternativo: ", err);
        alert(
          "No se pudo copiar al portapapeles. Es posible que tu navegador no sea compatible o se requieran permisos."
        );
      }
    }
  });

  function calcularResultados() {
    let calificacionFinalTotal = 0;
    let todosLosCamposCompletos = true;

    for (const critKey in criteriosConfig) {
      const criterio = criteriosConfig[critKey];
      let puntajeBrutoObtenido = 0;
      let indicadoresCompletosEsteCriterio = true;

      criterio.indicadores.forEach((indicadorName) => {
        const radios = document.getElementsByName(indicadorName);
        let valorSeleccionado = 0;
        let algunoSeleccionado = false;
        for (const radio of radios) {
          if (radio.checked) {
            valorSeleccionado = parseInt(radio.value);
            algunoSeleccionado = true;
            break;
          }
        }
        if (!algunoSeleccionado) {
          indicadoresCompletosEsteCriterio = false;
        }
        puntajeBrutoObtenido += valorSeleccionado;
      });

      if (!indicadoresCompletosEsteCriterio) {
        todosLosCamposCompletos = false;
      }

      const puntajePonderado =
        (puntajeBrutoObtenido / criterio.puntajeMaxBruto) *
        criterio.puntosPonderados;
      calificacionFinalTotal += puntajePonderado;

      brutoSpans[critKey].textContent = puntajeBrutoObtenido;
      ponderadoSpans[critKey].textContent = puntajePonderado.toFixed(2);

      const criterioDiv = document.getElementById(`resultado-${critKey}`);
      if (criterioDiv) {
        criterioDiv.classList.remove("border-rojo", "border-amarillo");
        const numIndicadores = criterio.indicadores.length;
        if (numIndicadores > 0) {
          const promedioCriterio = puntajeBrutoObtenido / numIndicadores;
          if (promedioCriterio < 1.5) {
            criterioDiv.classList.add("border-rojo");
          } else if (promedioCriterio < 2.5) {
            criterioDiv.classList.add("border-amarillo");
          }
        }
      }
    }

    if (!todosLosCamposCompletos) {
      alert(
        "Por favor, complete todos los indicadores de la rúbrica para calcular la calificación."
      );
      resultadosDiv.classList.add("hidden");
      return;
    }

    calificacionFinalSpan.textContent = calificacionFinalTotal.toFixed(2);

    const feedback = obtenerFeedbackGnius(calificacionFinalTotal);
    calificacionGniusSpan.textContent = feedback.gnius;
    descripcionGniusSpan.textContent = feedback.descripcion;

    feedbackGniusDiv.className = "termometro-base";
    feedbackGniusDiv.classList.add(feedback.termometro);

    resultadosDiv.classList.remove("hidden");
  }

  function obtenerFeedbackGnius(calificacion) {
    for (const rango of escalaGnius) {
      if (calificacion >= rango.min && calificacion <= rango.max) {
        return rango;
      }
    }
    return {
      gnius: "N/A",
      descripcion: "Error en cálculo de escala",
      termometro: "",
    };
  }
});

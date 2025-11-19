// ============================================
// EDITOR DE IMÁGENES CON ÁLGEBRA MATRICIAL
// ============================================
// Nombre del estudiante: Juan José Zapata Buenfil
// Fecha: 18/11/2025
// Grupo: 1B

const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

// Importar funciones auxiliares (puedes usarlas)
const {
  crearMatrizVacia,
  validarMatriz,
  obtenerDimensiones,
  limitarValorColor,
  crearPixel,
  copiarMatriz,
  asegurarDirectorio
} = require('./utilidades');

// Importar operaciones matriciales (puedes usarlas)
const {
  sumarMatrices,
  restarMatrices,
  multiplicarPorEscalar,
  multiplicarMatrices,
  transponerMatriz
} = require('./matriz');

// ============================================
// SECCIÓN 1: FUNDAMENTOS (20 puntos)
// Conversión entre imágenes y matrices
// ============================================

/**
 * Ejercicio 1.1: Cargar imagen PNG y convertir a matriz de píxeles (5 puntos)
 * 
 * Una imagen es una matriz donde cada elemento es un pixel con valores RGBA.
 * Debes leer el archivo PNG y crear una matriz donde:
 * - Cada fila representa una fila de píxeles de la imagen
 * - Cada elemento es un objeto: {r: 0-255, g: 0-255, b: 0-255, a: 0-255}
 * 
 * @param {string} rutaImagen - Ruta del archivo PNG
 * @returns {Array<Array<Object>>} - Matriz de píxeles
 * 
 * Pistas:
 * - Usa PNG.sync.read() para leer la imagen
 * - png.width y png.height te dan las dimensiones
 * - png.data es un Buffer con formato [R,G,B,A, R,G,B,A, ...]
 * - El índice en el buffer para el pixel (x,y) es: idx = (width * y + x) * 4
 * 
 * @example
 * const matriz = imagenAMatriz('imagenes/entrada/test_pequeña.png');
 * // matriz[0][0] = {r: 0, g: 0, b: 128, a: 255}
 */
function imagenAMatriz(rutaImagen) {
  // Leer el archivo PNG
  const buffer = fs.readFileSync(rutaImagen); //Se lee el archivo PNG
  const png = PNG.sync.read(buffer); // Se usa para decoidficar el buffer del PNG
  
  // Crear la matriz vacía que contiene todas la filas
  const matriz = [];
  
  // Recorrer cada fila (y) y cada columna (x)
  for (let y = 0; y < png.height; y++) { // El bluce exterior itera sobre la altura (filas)
    const fila = [];
      for (let x = 0; x < png.width; x++) { // El bluce intrerior itera sobre la anchura (columnas)

  //  Calcular el índice en el buffer 'png.data' es plano
        const idx = (png.width * y + x) << 2; // equivalente a * 4

        const pixel = {// Extraer los valores RGBA y crear el objeto píxel
         r: png.data[idx], // rojo
        g: png.data[idx + 1], // verde
        b: png.data[idx + 2], // azul
        a: png.data[idx + 3] // alfa (transparencia)
      };  
      fila.push(pixel); // Añadimos el píxel (objeto) a la fila actual
    }
    matriz.push(fila); // Añadimos la fila completa (array de píxeles) a la matriz principal
  }
  return matriz; // Retornar matriz
}

/**
 * Ejercicio 1.2: Convertir matriz de píxeles a imagen PNG (5 puntos)
 * 
 * Proceso inverso: tomar una matriz de píxeles y guardarla como PNG.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles {r,g,b,a}
 * @param {string} rutaSalida - Ruta donde guardar el PNG
 * 
 * Pistas:
 * - Usa new PNG({width, height}) para crear la imagen
 * - Recorre la matriz y llena png.data con los valores
 * - Usa PNG.sync.write(png) para generar el buffer
 * - Usa fs.writeFileSync() para guardar el archivo
 * 
 * @example
 * const matriz = imagenAMatriz('entrada.png');
 * matrizAImagen(matriz, 'imagenes/salida/copia.png');
 */
function matrizAImagen(matriz, rutaSalida) {
  // Validar la matriz
  validarMatriz(matriz);
  
  // 2. Obtener dimensiones
  const dims = obtenerDimensiones(matriz); // la funcipon devuelve un objeto
  
  // Crear un objeto PNG vacío en la memoria
  const png = new PNG({
    width: dims.columnas,
    height: dims.filas
  });
  
  // Llenar png.data
  for (let y = 0; y < dims.filas; y++) { // recorrer las filas
    for (let x = 0; x < dims.columnas; x++) { // en cada fila, recorremos cada columna
      const idx = (dims.columnas * y + x) << 2; // (ancho * y + x) *4
      const pixel = matriz[y][x]; // se obtiene el objeto pixel de la matriz de entrada
      // Se asignan los valores de colores al array
      png.data[idx] = limitarValorColor(pixel.r); // rojo
      png.data[idx + 1] = limitarValorColor(pixel.g); // verde 
      png.data[idx + 2] = limitarValorColor(pixel.b); // azul
      png.data[idx + 3] = limitarValorColor(pixel.a); // alfa (transparencia)
    }
  }
  
  // Asegurar que existe el directorio de salida
  asegurarDirectorio(path.dirname(rutaSalida));
  
  // Guardar el archivo
  const buffer = PNG.sync.write(png); // convierte el objero PNG en memoria a un buffer
  fs.writeFileSync(rutaSalida, buffer); // escribe ese bufffer en un archivo en el disco duro
}

/**
 * Ejercicio 1.3: Obtener un canal específico de color (5 puntos)
 * 
 * Extrae solo un canal (R, G, o B) de la imagen y crea una imagen en escala de grises
 * donde ese canal es el valor de gris.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @param {string} canal - 'r', 'g', o 'b'
 * @returns {Array<Array<Object>>} - Matriz con solo ese canal
 * 
 * @example
 * const matriz = imagenAMatriz('imagen.png');
 * const soloRojo = obtenerCanal(matriz, 'r');
 * // Si un pixel era {r:200, g:100, b:50, a:255}
 * // Ahora será {r:200, g:200, b:200, a:255} (gris)
 */
function obtenerCanal(matriz, canal) {
  // Validar parámetros
  if (!['r', 'g', 'b'].includes(canal)) {
    throw new Error("El canal debe ser 'r', 'g', o 'b'");
  }
  
  // Crear matriz resultado
  const resultado = copiarMatriz(matriz);
  
  // Para cada pixel, usar solo el valor del canal seleccionado
  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      const valor = matriz[i][j][canal]; // son los valores del canal deseado
      resultado[i][j] = { // se crea un nuevo objeto pixel en escasas de grises
        r: valor,
        g: valor,
        b: valor,
        a: matriz[i][j].a
      };
    }
  }
  
  return resultado;
}

/**
 * Ejercicio 1.4: Obtener dimensiones de una imagen (5 puntos)
 * 
 * @param {string} rutaImagen - Ruta del archivo PNG
 * @returns {Object} - {ancho, alto, totalPixeles}
 * 
 * @example
 * const dims = obtenerDimensionesImagen('test.png');
 * // {ancho: 100, alto: 100, totalPixeles: 10000}
 */
function obtenerDimensionesImagen(rutaImagen) {
    const buffer = fs.readFileSync(rutaImagen);
    const png = PNG.sync.read(buffer);
    
    return { 
        ancho: png.width, 
        alto: png.height, 
        totalPixeles: png.width * png.height 
    };
}

// ============================================
// SECCIÓN 2: OPERACIONES BÁSICAS (25 puntos)
// Aplicar álgebra matricial a píxeles
// ============================================

/**
 * Ejercicio 2.1: Ajustar brillo (8 puntos)
 * 
 * El brillo se ajusta multiplicando cada canal RGB por un factor.
 * Esto es una MULTIPLICACIÓN ESCALAR aplicada a cada canal.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @param {number} factor - Factor de brillo (0.5 = más oscuro, 2.0 = más claro)
 * @returns {Array<Array<Object>>} - Matriz con brillo ajustado
 * 
 * Concepto matemático:
 * Si factor = 1.5, entonces:
 * R_nuevo = R_original * 1.5
 * G_nuevo = G_original * 1.5
 * B_nuevo = B_original * 1.5
 * 
 * @example
 * const brillante = ajustarBrillo(matriz, 1.5); // 50% más claro
 * const oscuro = ajustarBrillo(matriz, 0.5);    // 50% más oscuro
 */
function ajustarBrillo(matriz, factor) {
  // TODO: Implementar ajuste de brillo
  
  // 1. Crear matriz resultado
  const resultado = copiarMatriz(matriz);
  
  // 2. Para cada pixel, multiplicar R, G, B por el factor
  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      // Multiplicar cada canal por el factor y limitar al rango 0-255
      resultado[i][j].r = limitarValorColor(matriz[i][j].r * factor);
      resultado[i][j].g = limitarValorColor(matriz[i][j].g * factor);
      resultado[i][j].b = limitarValorColor(matriz[i][j].b * factor);
      // El canal alpha NO se modifica (mantiene transparencia original)
    }
  }
  return resultado; // REEMPLAZAR
}

/**
 * Ejercicio 2.2: Invertir colores (8 puntos)
 * 
 * Invierte los colores usando la operación: nuevo = 255 - original
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Matriz con colores invertidos
 * 
 * Concepto matemático:
 * R_nuevo = 255 - R_original
 * G_nuevo = 255 - G_original
 * B_nuevo = 255 - B_original
 * 
 * @example
 * const negativo = invertirColores(matriz);
 * // Blanco (255,255,255) → Negro (0,0,0)
 * // Rojo (255,0,0) → Cian (0,255,255)
 */
function invertirColores(matriz) {
    // 1. Crear matriz resultado
    const resultado = copiarMatriz(matriz);
    
    // 2. Para cada pixel, invertir canales R, G, B
    for (let i = 0; i < resultado.length; i++) {
        for (let j = 0; j < resultado[i].length; j++) {
            // Invertir cada canal: 255 - valor original
            resultado[i][j].r = 255 - matriz[i][j].r;
            resultado[i][j].g = 255 - matriz[i][j].g;
            resultado[i][j].b = 255 - matriz[i][j].b;
            // El canal alpha NO se modifica
        }
    }
    
    return resultado; 
}

/**
 * Ejercicio 2.3: Convertir a escala de grises (9 puntos)
 * 
 * Convierte la imagen a escala de grises usando el promedio ponderado:
 * Gris = 0.299*R + 0.587*G + 0.114*B
 * 
 * Estos pesos reflejan la sensibilidad del ojo humano a cada color.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Matriz en escala de grises
 * 
 * @example
 * const grises = convertirEscalaGrises(matriz);
 */
function convertirEscalaGrises(matriz) {
    // TODO: Implementar conversión a escala de grises
    
    // 1. Crear matriz resultado
    const resultado = copiarMatriz(matriz);
    
    // 2. Para cada pixel, calcular valor de gris
    for (let i = 0; i < resultado.length; i++) {
        for (let j = 0; j < resultado[i].length; j++) {
            // Calcular gris con promedio ponderado
            const gris = 0.299 * matriz[i][j].r + 0.587 * matriz[i][j].g + 0.114 * matriz[i][j].b;
            // Asignar mismo valor a los tres canales RGB
            resultado[i][j].r = gris;
            resultado[i][j].g = gris;
            resultado[i][j].b = gris;
            // El canal alpha NO se modifica
        }
    }
    
    return resultado; 
}

// ============================================
// SECCIÓN 3: TRANSFORMACIONES GEOMÉTRICAS (30 puntos)
// Aplicar operaciones matriciales para transformar
// ============================================

/**
 * Ejercicio 3.1: Voltear horizontal (espejo) (10 puntos)
 * 
 * Voltea la imagen horizontalmente (efecto espejo).
 * Cada fila se invierte: [1,2,3] → [3,2,1]
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Matriz volteada horizontalmente
 * 
 * Concepto matemático:
 * pixel[i][j] → pixel[i][ancho - 1 - j]
 * 
 * @example
 * const espejo = voltearHorizontal(matriz);
 */
function voltearHorizontal(matriz) {
    // TODO: Implementar volteo horizontal
    
    // 1. Crear matriz resultado
    const resultado = [];
    
    // 2. Para cada fila, invertir el orden de los píxeles
    for (let i = 0; i < matriz.length; i++) {
        // Invertir fila usando reverse() - efecto espejo
        const filaInvertida = [...matriz[i]].reverse();
        resultado.push(filaInvertida);
    }
    
    return resultado; 
}

/**
 * Ejercicio 3.2: Voltear vertical (10 puntos)
 * 
 * Voltea la imagen verticalmente (de arriba hacia abajo).
 * El orden de las filas se invierte.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Matriz volteada verticalmente
 * 
 * Concepto matemático:
 * pixel[i][j] → pixel[alto - 1 - i][j]
 * 
 * @example
 * const invertido = voltearVertical(matriz);
 */
function voltearVertical(matriz) {
    // TODO: Implementar volteo vertical
    
    // 1. Crear matriz resultado invirtiendo filas
    const resultado = [];
    
    // 2. Recorrer filas en orden inverso
    for (let i = matriz.length - 1; i >= 0; i--) {
        // Añadir filas desde el final hacia el inicio
        resultado.push(matriz[i]);
    }
    
    return resultado; 
}

/**
 * Ejercicio 3.3: Rotar 90 grados en sentido horario (10 puntos)
 * 
 * Rota la imagen 90° en sentido horario.
 * Esto se logra con: TRANSPONER + VOLTEAR HORIZONTAL
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Matriz rotada 90°
 * 
 * Concepto matemático:
 * 1. Transponer: pixel[i][j] → pixel[j][i]
 * 2. Voltear horizontal: invertir cada fila
 * 
 * Puedes usar transponerMatriz() de matriz.js (¡pero cuidado! trabaja con números, 
 * no con objetos pixel)
 * 
 * @example
 * const rotada = rotar90Grados(matriz);
 */
function rotar90Grados(matriz) {
    // TODO: Implementar rotación de 90 grados
    // 1. Obtener dimensiones originales
    const filas = matriz.length;
    const columnas = matriz[0].length;
    
    // 2. Crear matriz resultado con dimensiones invertidas
    const resultado = Array.from({length: columnas}, () => []);
    
    // 3. Llenar matriz rotada (transponer + voltear horizontal)
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            // Transponer y voltear: nueva posición [j][filas-1-i]
            resultado[j][filas - 1 - i] = matriz[i][j];
        }
    }
    return resultado; 
}

// ============================================
// SECCIÓN 4: FILTROS AVANZADOS (25 puntos)
// Operaciones más complejas
// ============================================

/**
 * Ejercicio 4.1: Mezclar dos imágenes (8 puntos)
 * 
 * Mezcla dos imágenes usando un factor de mezcla.
 * resultado = imagen1 * (1 - factor) + imagen2 * factor
 * 
 * Esto es una COMBINACIÓN LINEAL de matrices.
 * 
 * @param {Array<Array<Object>>} matriz1 - Primera imagen
 * @param {Array<Array<Object>>} matriz2 - Segunda imagen
 * @param {number} factor - Factor de mezcla (0.0 a 1.0)
 *                          0.0 = solo imagen1
 *                          0.5 = 50% de cada una
 *                          1.0 = solo imagen2
 * @returns {Array<Array<Object>>} - Imagen mezclada
 * 
 * @example
 * const mezcla = mezclarImagenes(imagen1, imagen2, 0.5); // 50/50
 */
function mezclarImagenes(matriz1, matriz2, factor) {
  // TODO: Implementar mezcla de imágenes
  
  // 1. Verificar que tengan las mismas dimensiones
  // const dims1 = obtenerDimensiones(matriz1);
  // const dims2 = obtenerDimensiones(matriz2);
  // if (dims1.filas !== dims2.filas || dims1.columnas !== dims2.columnas) {
  //   throw new Error('Las imágenes deben tener el mismo tamaño');
  // }
  
  // 2. Para cada pixel:
  // r = r1 * (1 - factor) + r2 * factor
  // g = g1 * (1 - factor) + g2 * factor
  // b = b1 * (1 - factor) + b2 * factor
  
  return []; // REEMPLAZAR
}

/**
 * Ejercicio 4.2: Filtro Sepia (9 puntos)
 * 
 * Aplica el efecto sepia (tono vintage/antiguo).
 * Usa la siguiente transformación matricial:
 * 
 * R_nuevo = 0.393*R + 0.769*G + 0.189*B
 * G_nuevo = 0.349*R + 0.686*G + 0.168*B
 * B_nuevo = 0.272*R + 0.534*G + 0.131*B
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Imagen con efecto sepia
 * 
 * @example
 * const vintage = aplicarSepia(matriz);
 */
function aplicarSepia(matriz) {
  // TODO: Implementar filtro sepia
  
  return []; // REEMPLAZAR
}

/**
 * Ejercicio 4.3: Detectar bordes (simplificado) (8 puntos)
 * 
 * Detecta bordes comparando cada pixel con sus vecinos.
 * Si la diferencia es grande, hay un borde.
 * 
 * Este es un operador Sobel simplificado.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @param {number} umbral - Umbral de detección (0-255), default: 50
 * @returns {Array<Array<Object>>} - Imagen de bordes (blanco y negro)
 * 
 * Algoritmo simplificado:
 * 1. Convertir a escala de grises
 * 2. Para cada pixel, calcular diferencia con vecinos
 * 3. Si diferencia > umbral, es borde (blanco), sino negro
 * 
 * @example
 * const bordes = detectarBordes(matriz, 50);
 */
function detectarBordes(matriz, umbral = 50) {
  // TODO: Implementar detección de bordes
  
  // 1. Convertir a escala de grises primero
  // const grises = convertirEscalaGrises(matriz);
  
  // 2. Para cada pixel (excepto bordes de la imagen):
  //    - Comparar con pixel derecho y pixel inferior
  //    - Si diferencia > umbral, marcar como borde
  
  return []; // REEMPLAZAR
}

// ============================================
// NO MODIFICAR - Exportación de funciones
// ============================================
module.exports = {
  // Sección 1: Fundamentos
  imagenAMatriz,
  matrizAImagen,
  obtenerCanal,
  obtenerDimensionesImagen,
  
  // Sección 2: Operaciones Básicas
  ajustarBrillo,
  invertirColores,
  convertirEscalaGrises,
  
  // Sección 3: Transformaciones
  voltearHorizontal,
  voltearVertical,
  rotar90Grados,
  
  // Sección 4: Filtros Avanzados
  mezclarImagenes,
  aplicarSepia,
  detectarBordes
};

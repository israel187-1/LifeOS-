import type { Lesson } from '../../domain/types';
import { MASTERY, choice, code, order, py, q } from '../helpers';

export const level3: Lesson[] = [
  {
    id: 'l3-pseint-python',
    levelId: 3,
    title: 'De PSeInt a Python: Leer y Escribir',
    objective: 'Traducir un algoritmo de PSeInt con Leer y Escribir a un programa en Python.',
    learn: ['Equivalencias PSeInt → Python', 'Leer datos con input()', 'Por qué input() devuelve texto y cuándo usar int()', 'Guardar valores con = (en PSeInt <-)'],
    concept: [
      'Lo que ya sabes de PSeInt sirve: la lógica es la misma, solo cambia cómo se escribe.',
      'Escribir → print(). Leer x → x = input(). Asignar x <- 5 → x = 5. Y / O / NO → and / or / not.',
      'En Python no hace falta "Definir x Como Entero" ni "Algoritmo / FinAlgoritmo".',
      'IMPORTANTE: input() siempre devuelve texto (str). Si vas a hacer cuentas, conviértelo: n = int(input()).',
      'print("Hola,", nombre) muestra varios valores separados por un espacio, como Escribir "Hola, ", nombre.',
    ],
    example: {
      title: 'Saludar a alguien',
      pseint: code(`
Algoritmo Saludar
    Definir nombre Como Caracter
    Escribir "¿Cómo te llamas?"
    Leer nombre
    Escribir "Hola, ", nombre
FinAlgoritmo`),
      python: code(`
print("¿Cómo te llamas?")
nombre = input()
print("Hola,", nombre)`),
      steps: [
        { lines: [1], text: 'Escribir "¿Cómo te llamas?" → print("¿Cómo te llamas?"). No necesitamos Algoritmo ni Definir.' },
        { lines: [2], text: 'Leer nombre → nombre = input(). input() espera a que el usuario escriba algo y lo guarda en nombre.' },
        { lines: [3], text: 'print("Hola,", nombre) muestra el texto y el valor de la variable separados por un espacio. Si escribes Ana, muestra: Hola, Ana' },
      ],
    },
    guided: py({
      id: 'l3-pseint-python-guided',
      title: 'Traduce: Eco',
      prompt: 'Traduce a Python:\n\nAlgoritmo Eco\n    Leer palabra\n    Escribir palabra\n    Escribir palabra\nFinAlgoritmo\n\nLa lectura ya está hecha; completa las dos salidas.',
      starterCode: 'palabra = input()\n# Escribe aquí las dos líneas de salida\n',
      solution: 'palabra = input()\nprint(palabra)\nprint(palabra)',
      usesInput: true,
      sampleInput: ['hola'],
      tests: [
        { name: 'Con "hola"', stdin: ['hola'], expectedStdout: 'hola\nhola' },
        { name: 'Con "python"', stdin: ['python'], expectedStdout: 'python\npython' },
      ],
      hints: ['Escribir palabra → print(palabra).', 'Sin comillas: queremos el valor de la variable, no el texto "palabra".', 'Agrega dos veces la línea print(palabra).'],
      explanation: 'Sin comillas, print muestra el contenido de la variable. Con comillas mostraría la palabra "palabra".',
    }),
    bugfix: py({
      id: 'l3-pseint-python-bugfix',
      title: 'El próximo año',
      prompt: 'El programa lee una edad y muestra la edad del próximo año, pero falla con un TypeError. Prueba con la entrada 18 y corrígelo.',
      starterCode: 'print("Escribe tu edad:")\nedad = input()\nprint("El próximo año tendrás", edad + 1, "años")',
      solution: 'print("Escribe tu edad:")\nedad = int(input())\nprint("El próximo año tendrás", edad + 1, "años")',
      usesInput: true,
      sampleInput: ['18'],
      tests: [
        { name: 'Con 18', stdin: ['18'], expectedStdout: 'Escribe tu edad:\nEl próximo año tendrás 19 años' },
        { name: 'Con 30', stdin: ['30'], expectedStdout: 'Escribe tu edad:\nEl próximo año tendrás 31 años' },
      ],
      hints: ['El error dice que no se puede sumar un str con un int. ¿Qué tipo devuelve input()?', 'input() devuelve texto: "18". Hay que convertirlo a número.', 'edad = int(input())'],
      explanation: 'input() devuelve texto. int() lo convierte a número entero para poder sumarle 1.',
    }),
    independent: py({
      id: 'l3-pseint-python-independent',
      title: 'Traduce: Doble y triple',
      prompt: 'Traduce a Python:\n\nAlgoritmo DobleYTriple\n    Definir n Como Entero\n    Leer n\n    Escribir n * 2\n    Escribir n * 3\nFinAlgoritmo',
      starterCode: '',
      solution: 'n = int(input())\nprint(n * 2)\nprint(n * 3)',
      usesInput: true,
      sampleInput: ['4'],
      tests: [
        { name: 'Con 4', stdin: ['4'], expectedStdout: '8\n12' },
        { name: 'Con 0', stdin: ['0'], expectedStdout: '0\n0' },
        { name: 'Con -5', stdin: ['-5'], expectedStdout: '-10\n-15' },
      ],
      hints: ['"Definir n Como Entero" + "Leer n" se traduce en una sola línea con int(input()).', 'Escribir n * 2 → print(n * 2).', 'n = int(input()), luego print(n * 2) y print(n * 3).'],
      explanation: 'Si olvidas int(), "4" * 2 da "44": Python repite el texto en lugar de multiplicar.',
    }),
    retrieval: [
      q('l3-pseint-python-q1', '¿Cuál es el equivalente en Python de "Leer x" para un número entero?', ['x = input()', 'x = int(input())', 'input(x)', 'Leer(x)'], 1, 'input() lee texto; int() lo convierte a entero.'),
      q('l3-pseint-python-q2', 'Si el usuario escribe 4, ¿qué muestra este código?', ['8', '44', 'Error', '4 4'], 1, 'Sin int(), n es el texto "4". Multiplicar un texto por 2 lo repite: "44".', 'n = input()\nprint(n * 2)'),
      q('l3-pseint-python-q3', '¿Cómo se escribe en Python la asignación de PSeInt: total <- 0?', ['total == 0', 'total = 0', 'total <- 0', 'Definir total = 0'], 1, 'En Python se asigna con un solo =.'),
    ],
    commonErrors: [
      { error: 'edad = input() y luego edad + 1', why: 'input() devuelve texto: no se puede sumar con un número.', fix: 'edad = int(input())' },
      { error: 'Escribir Algoritmo / FinAlgoritmo en Python', why: 'Python no usa esas palabras.', fix: 'Empieza directamente con las instrucciones.' },
      { error: 'Usar <- para asignar', why: 'En Python la asignación es =.', fix: 'x = 5' },
    ],
    challenge: py({
      id: 'l3-pseint-python-challenge',
      title: 'Mini-reto: área de un rectángulo',
      prompt: 'Traduce a Python (base y altura son enteros):\n\nAlgoritmo Area\n    Leer base\n    Leer altura\n    Escribir "Área:", base * altura\nFinAlgoritmo\n\nCon 3 y 4 debe mostrar: Área: 12',
      starterCode: '',
      solution: 'base = int(input())\naltura = int(input())\nprint("Área:", base * altura)',
      usesInput: true,
      sampleInput: ['3', '4'],
      tests: [
        { name: 'Con 3 y 4', stdin: ['3', '4'], expectedStdout: 'Área: 12' },
        { name: 'Con 10 y 2', stdin: ['10', '2'], expectedStdout: 'Área: 20' },
      ],
      hints: ['Dos Leer → dos input() convertidos con int().', 'print acepta varios valores separados por comas.', 'print("Área:", base * altura)'],
      explanation: 'Cada Leer se vuelve una línea con input(); el Escribir con varios valores se vuelve un print con comas.',
    }),
    feynman: {
      prompt: 'Explica cómo traducirías un algoritmo de PSeInt a Python y por qué a veces necesitas int() al leer datos.',
      keyIdeas: [
        { label: 'Escribir → print', keywords: ['print', 'escribir'] },
        { label: 'Leer → input', keywords: ['input', 'leer'] },
        { label: 'input da texto; int convierte', keywords: ['texto', 'int', 'convertir', 'convierte', 'número', 'numero', 'str'] },
      ],
    },
    mastery: MASTERY,
  },
  {
    id: 'l3-trazas',
    levelId: 3,
    title: 'Diagramas de flujo y pruebas de escritorio',
    objective: 'Seguir a mano la ejecución de un algoritmo y predecir su resultado.',
    learn: ['Símbolos básicos de un diagrama de flujo', 'Qué es una prueba de escritorio (traza)', 'Cómo cambia el valor de una variable línea por línea', 'Intercambiar dos valores con una variable auxiliar'],
    concept: [
      'Un diagrama de flujo dibuja un algoritmo: óvalo = inicio/fin, paralelogramo = entrada/salida, rectángulo = proceso, rombo = decisión.',
      'Una prueba de escritorio (o traza) es ejecutar el algoritmo "a mano", anotando en una tabla el valor de cada variable después de cada línea.',
      'Una variable guarda UN valor a la vez. Al asignarle algo nuevo, el valor anterior se pierde.',
      'Hacer trazas es la habilidad que te permite entender código sin copiarlo: predices qué pasará y luego lo compruebas.',
    ],
    example: {
      title: 'Traza de un programa',
      pseint: code(`
Algoritmo Traza
    a <- 3
    b <- 5
    a <- a + b
    b <- a - b
    Escribir a, " ", b
FinAlgoritmo`),
      python: code(`
a = 3
b = 5
a = a + b
b = a - b
print(a, b)`),
      steps: [
        { lines: [1], text: 'Tabla: a = 3, b = (sin valor).' },
        { lines: [2], text: 'a = 3, b = 5.' },
        { lines: [3], text: 'Se calcula a + b con los valores ACTUALES: 3 + 5 = 8. Ahora a = 8, b = 5.' },
        { lines: [4], text: 'b = a - b = 8 - 5 = 3. Ahora a = 8, b = 3.' },
        { lines: [5], text: 'Se muestra: 8 3. Si predijiste esto antes de ejecutar, hiciste una prueba de escritorio.' },
      ],
    },
    guided: choice({
      id: 'l3-trazas-guided',
      title: 'Predice la salida',
      prompt: 'Haz la traza y elige qué muestra el programa.',
      code: 'x = 2\nx = x * 3\nx = x - 1\nprint(x)',
      options: [
        { text: '2', feedback: 'x cambia en cada línea; 2 es solo el valor inicial.' },
        { text: '5', feedback: '¡Correcto! x: 2 → 6 → 5.' },
        { text: '6', feedback: 'Casi: falta aplicar la línea x = x - 1.' },
        { text: '1', feedback: 'Revisa: x - 1 usa el valor actual de x (6).' },
      ],
      correctIndex: 1,
      hints: ['Anota el valor de x después de cada línea.', 'Después de la línea 2, x vale 6.'],
      explanation: 'x = 2 → x = 2 * 3 = 6 → x = 6 - 1 = 5.',
    }),
    bugfix: py({
      id: 'l3-trazas-bugfix',
      title: 'El orden importa',
      prompt: 'Este programa debería mostrar el doble de 7 más 1, es decir 15 (7 × 2 + 1), pero muestra 16. Haz la traza y corrige el orden de las operaciones.',
      starterCode: 'n = 7\nresultado = n + 1\nresultado = resultado * 2\nprint(resultado)',
      solution: 'n = 7\nresultado = n * 2\nresultado = resultado + 1\nprint(resultado)',
      tests: [{ name: 'Muestra 15', expectedStdout: '15' }],
      hints: ['Traza: resultado = 8, luego 16. ¿Qué operación debía ir primero?', 'Primero hay que duplicar y después sumar 1.', 'resultado = n * 2 y después resultado = resultado + 1'],
      explanation: 'Las instrucciones se ejecutan en orden; cambiar el orden cambia el resultado.',
    }),
    independent: py({
      id: 'l3-trazas-independent',
      title: 'Intercambiar valores',
      prompt: 'Lee dos textos a y b (uno por línea), intercambia sus valores usando una variable auxiliar y muestra a y b separados por un espacio.\n\nCon "uno" y "dos" debe mostrar: dos uno',
      starterCode: 'a = input()\nb = input()\n# Intercambia los valores aquí\n\nprint(a, b)',
      solution: 'a = input()\nb = input()\naux = a\na = b\nb = aux\nprint(a, b)',
      usesInput: true,
      sampleInput: ['uno', 'dos'],
      tests: [
        { name: 'Con uno y dos', stdin: ['uno', 'dos'], expectedStdout: 'dos uno' },
        { name: 'Con 1 y 2', stdin: ['1', '2'], expectedStdout: '2 1' },
      ],
      hints: ['Si haces a = b directamente, pierdes el valor original de a.', 'Guarda primero a en otra variable: aux = a.', 'aux = a, luego a = b, luego b = aux.'],
      explanation: 'La variable auxiliar guarda el valor que de otro modo se perdería. Haz la traza: aux = uno, a = dos, b = uno.',
    }),
    retrieval: [
      q('l3-trazas-q1', '¿Qué símbolo representa una decisión en un diagrama de flujo?', ['Óvalo', 'Rectángulo', 'Rombo', 'Paralelogramo'], 2, 'El rombo tiene dos salidas: verdadero y falso.'),
      q('l3-trazas-q2', '¿Qué muestra este código?', ['10 20', '20 20', '20 10', '10 10'], 1, 'a = b copia 20 en a. Luego b = a copia 20 en b. El 10 se perdió.', 'a = 10\nb = 20\na = b\nb = a\nprint(a, b)'),
      q('l3-trazas-q3', '¿Para qué sirve una prueba de escritorio?', ['Para instalar Python', 'Para seguir a mano los valores de las variables y predecir el resultado', 'Para dibujar la interfaz', 'Para que el programa sea más rápido'], 1, 'Es la herramienta para entender código sin ejecutarlo.'),
    ],
    commonErrors: [
      { error: 'Pensar que a = b intercambia valores', why: 'Solo copia b en a; el valor de a se pierde.', fix: 'Usa una variable auxiliar.' },
      { error: 'Usar el valor viejo de una variable en la traza', why: 'Cada asignación reemplaza el valor anterior.', fix: 'Actualiza tu tabla después de cada línea.' },
      { error: 'No predecir antes de ejecutar', why: 'Ejecutar sin predecir no entrena tu razonamiento.', fix: 'Escribe tu predicción y luego comprueba.' },
    ],
    challenge: order({
      id: 'l3-trazas-challenge',
      title: 'Mini-reto: arma el diagrama',
      prompt: 'Ordena los bloques del diagrama de flujo para "pedir dos números y mostrar el mayor".',
      steps: ['Inicio', 'Leer a', 'Leer b', '¿a > b?', 'Verdadero: mostrar a / Falso: mostrar b', 'Fin'],
      hints: ['Siempre empieza en Inicio y termina en Fin.', 'Primero se leen los datos, luego se decide.'],
      explanation: 'Inicio → entradas → decisión (rombo) → salidas → Fin. En la lección de condicionales escribirás esto en Python.',
    }),
    feynman: {
      prompt: 'Explica qué es una prueba de escritorio y por qué para intercambiar dos variables necesitas una tercera.',
      keyIdeas: [
        { label: 'seguir valores a mano', keywords: ['mano', 'tabla', 'traza', 'valores', 'paso'] },
        { label: 'la asignación reemplaza', keywords: ['pierde', 'reemplaza', 'sobrescribe', 'borra'] },
        { label: 'variable auxiliar', keywords: ['auxiliar', 'aux', 'temporal', 'tercera'] },
      ],
    },
    mastery: MASTERY,
  },
];

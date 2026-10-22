import type { Lesson } from '../../domain/types';
import { MASTERY, choice, code, order, py, q } from '../helpers';

export const level2: Lesson[] = [
  {
    id: 'l2-descomponer',
    levelId: 2,
    title: 'Descomponer problemas: entrada, proceso y salida',
    objective: 'Dividir un problema en entrada, proceso y salida antes de escribir código.',
    learn: ['Qué es un algoritmo', 'El modelo entrada → proceso → salida', 'Descomponer un problema en pasos pequeños', 'Que un resultado incorrecto también es un error'],
    concept: [
      'Un algoritmo es una secuencia finita y ordenada de pasos precisos para resolver un problema.',
      'Casi todo programa sigue el modelo: ENTRADA (datos que recibe) → PROCESO (cálculos) → SALIDA (resultado que muestra).',
      'Antes de escribir código, responde: ¿qué datos tengo?, ¿qué debo calcular?, ¿qué debo mostrar?',
      'Un programa puede ejecutarse sin errores y aun así estar mal: si el resultado no es el esperado, también hay que depurarlo.',
    ],
    example: {
      title: 'Promedio de 3 calificaciones: 8, 9 y 7',
      pseint: code(`
Algoritmo Promedio
    // Entrada: 8, 9, 7
    // Proceso: sumar y dividir entre 3
    // Salida: el promedio
    Escribir (8 + 9 + 7) / 3
FinAlgoritmo`),
      python: code(`
# Entrada: 8, 9 y 7
# Proceso: sumar y dividir entre 3
# Salida: mostrar el promedio
print((8 + 9 + 7) / 3)`),
      steps: [
        { lines: [1], text: 'Entrada: identificamos los datos. Por ahora están fijos en el código.' },
        { lines: [2], text: 'Proceso: el promedio es la suma dividida entre la cantidad de datos.' },
        { lines: [4], text: 'Los paréntesis obligan a sumar primero. Sin ellos, Python dividiría 7 / 3 antes de sumar.' },
        { lines: [4], text: 'Salida: print muestra 8.0. La división con / siempre da un número decimal.' },
      ],
    },
    guided: order({
      id: 'l2-descomponer-guided',
      title: 'Ordena el algoritmo',
      prompt: 'Ordena los pasos para calcular el total a pagar de 3 productos con IVA del 16%.',
      steps: ['Identificar los datos: los precios de los 3 productos', 'Sumar los tres precios', 'Multiplicar la suma por 1.16', 'Mostrar el total'],
      hints: ['¿Qué necesitas tener antes de poder calcular algo?', 'El IVA se aplica sobre la suma, y mostrar siempre va al final.'],
      explanation: 'Entrada (precios) → proceso (sumar, aplicar IVA) → salida (mostrar).',
    }),
    bugfix: py({
      id: 'l2-descomponer-bugfix',
      title: 'Un resultado incorrecto',
      prompt: 'Este programa debería mostrar el promedio de 8, 9 y 7 (que es 8.0), pero muestra otra cosa. No hay error de Python: el error es de lógica. Corrígelo.',
      starterCode: 'print(8 + 9 + 7 / 3)',
      solution: 'print((8 + 9 + 7) / 3)',
      tests: [{ name: 'Muestra 8.0', expectedStdout: '8.0' }],
      hints: ['Ejecuta y compara el resultado con 8.0. ¿Qué operación hizo primero Python?', 'La división se hace antes que la suma, como en matemáticas.', 'Agrupa la suma con paréntesis: (8 + 9 + 7) / 3'],
      explanation: 'La división tiene prioridad sobre la suma. Los paréntesis cambian el orden de evaluación.',
    }),
    independent: py({
      id: 'l2-descomponer-independent',
      title: 'Minutos de práctica',
      prompt: 'Un estudiante programa 45 minutos diarios durante 6 días.\nMuestra en la primera línea el total de minutos y en la segunda el total en horas.\n\nSalida esperada:\n270\n4.5',
      starterCode: '# Entrada: 45 minutos, 6 días\n# Proceso: ?\n# Salida: ?\n',
      solution: 'print(45 * 6)\nprint(45 * 6 / 60)',
      tests: [{ name: 'Total en minutos y en horas', expectedStdout: '270\n4.5' }],
      hints: ['Total de minutos = minutos por día × número de días.', 'Una hora tiene 60 minutos: horas = minutos / 60.', 'print(45 * 6) y en otra línea print(45 * 6 / 60)'],
      explanation: 'Descomponer: primero el total en minutos, luego convertirlo. Cada paso es una operación sencilla.',
    }),
    retrieval: [
      q('l2-descomponer-q1', 'En un programa que convierte pesos a dólares, ¿qué es la ENTRADA?', ['El tipo de cambio y la cantidad de pesos', 'Multiplicar o dividir', 'Mostrar el resultado en dólares', 'El nombre del programa'], 0, 'La entrada son los datos que el programa necesita recibir.'),
      q('l2-descomponer-q2', '¿Qué muestra este código?', ['4.0', '4', '6.0', '5.0'], 0, 'Primero se resuelve el paréntesis (2 + 6 = 8) y luego 8 / 2 = 4.0. La división con / da decimal.', 'print((2 + 6) / 2)'),
      q('l2-descomponer-q3', 'Un programa no muestra errores pero el resultado está mal. ¿Qué tipo de error es?', ['De sintaxis', 'De lógica', 'De instalación', 'No es un error'], 1, 'El código es válido pero hace algo distinto a lo que querías: es un error de lógica.'),
    ],
    commonErrors: [
      { error: 'Empezar a escribir código sin entender el problema', why: 'Terminas probando al azar.', fix: 'Escribe primero en comentarios: entrada, proceso, salida.' },
      { error: 'Olvidar los paréntesis en operaciones', why: 'Multiplicación y división se hacen antes que suma y resta.', fix: 'Usa paréntesis para dejar claro el orden.' },
      { error: 'Creer que "sin errores" significa "correcto"', why: 'Los errores de lógica no generan mensajes.', fix: 'Compara siempre con un resultado que calculaste a mano.' },
    ],
    challenge: py({
      id: 'l2-descomponer-challenge',
      title: 'Mini-reto: calificación ponderada',
      prompt: 'Tres parciales con calificaciones 80, 90 y 70 valen 25%, 25% y 50% de la nota. Muestra la calificación final.\n\nSalida esperada:\n77.5',
      starterCode: '',
      solution: 'print(80 * 0.25 + 90 * 0.25 + 70 * 0.5)',
      tests: [{ name: 'Muestra la calificación final', expectedStdout: '77.5' }],
      hints: ['Cada calificación se multiplica por su peso en decimal (25% = 0.25).', 'Después se suman los tres productos.', 'print(80 * 0.25 + 90 * 0.25 + 70 * 0.5)'],
      explanation: 'Una nota ponderada es la suma de cada calificación por su peso. Es la misma idea que usarás para calcular tus promedios de la universidad.',
    }),
    feynman: {
      prompt: 'Explica qué es un algoritmo y cómo usarías entrada, proceso y salida para resolver un problema nuevo.',
      keyIdeas: [
        { label: 'pasos ordenados', keywords: ['pasos', 'orden', 'secuencia', 'instrucciones'] },
        { label: 'entrada / datos', keywords: ['entrada', 'datos'] },
        { label: 'proceso y salida', keywords: ['proceso', 'calcular', 'salida', 'resultado', 'mostrar'] },
      ],
    },
    mastery: MASTERY,
  },
  {
    id: 'l2-logica',
    levelId: 2,
    title: 'Lógica: verdadero, falso, and, or, not',
    objective: 'Evaluar expresiones lógicas con comparaciones, and, or y not.',
    learn: ['Los valores True y False', 'Comparaciones: > < >= <= == !=', 'Combinar condiciones con and, or y not', 'Traducir Y, O, NO de PSeInt'],
    concept: [
      'Una comparación produce un valor lógico: True (verdadero) o False (falso). Por ejemplo, 5 > 3 es True.',
      'Comparadores: > mayor, < menor, >= mayor o igual, <= menor o igual, == igual (dos signos), != distinto.',
      'and es True solo si AMBAS partes son True. or es True si AL MENOS UNA es True. not invierte el valor.',
      'En PSeInt se escriben Y, O, NO. En Python: and, or, not.',
    ],
    example: {
      title: 'Evaluar condiciones',
      pseint: code(`
Algoritmo Logica
    Escribir 5 > 3
    Escribir 5 > 3 Y 2 > 8
    Escribir 5 > 3 O 2 > 8
    Escribir NO (5 > 3)
FinAlgoritmo`),
      python: code(`
print(5 > 3)
print(10 == 7)
print(5 > 3 and 2 > 8)
print(5 > 3 or 2 > 8)
print(not (5 > 3))`),
      steps: [
        { lines: [1], text: '5 > 3 es verdadero: muestra True.' },
        { lines: [2], text: '== compara si son iguales. 10 y 7 no lo son: False. (Un solo = sirve para otra cosa: guardar valores.)' },
        { lines: [3], text: 'and: 5 > 3 es True pero 2 > 8 es False. Como no son ambas verdaderas: False.' },
        { lines: [4], text: 'or: basta con que una sea verdadera: True.' },
        { lines: [5], text: 'not invierte: 5 > 3 es True, así que not da False.' },
      ],
    },
    guided: choice({
      id: 'l2-logica-guided',
      title: 'and con datos reales',
      prompt: 'tengo_tarea es True y es_fin_de_semana es False. ¿Cuánto vale tengo_tarea and es_fin_de_semana?',
      options: [
        { text: 'True', feedback: 'and necesita que las DOS partes sean True. Una es False.' },
        { text: 'False', feedback: '¡Correcto! Con and, basta que una parte sea False para que todo sea False.' },
        { text: 'Error', feedback: 'Combinar dos valores lógicos con and es válido.' },
      ],
      correctIndex: 1,
      hints: ['and es como "y además": ¿se cumplen las dos cosas?', 'Una de las dos es False.'],
      explanation: 'True and False = False. Para and, ambas deben ser True.',
    }),
    bugfix: py({
      id: 'l2-logica-bugfix',
      title: '¿Está entre 1 y 10?',
      prompt: 'Queremos mostrar True si 7 está entre 1 y 10 (es mayor que 1 y menor que 10). El código muestra False. Corrige la condición.',
      starterCode: 'print(7 > 1 and 7 > 10)',
      solution: 'print(7 > 1 and 7 < 10)',
      tests: [{ name: 'Muestra True', expectedStdout: 'True' }],
      hints: ['Lee la condición en voz alta: "7 mayor que 1 y 7 mayor que 10". ¿Es lo que queremos?', 'Para estar entre 1 y 10, 7 debe ser MENOR que 10.', 'Cambia 7 > 10 por 7 < 10.'],
      explanation: 'Revisar cada comparación por separado ayuda a encontrar el error en condiciones compuestas.',
    }),
    independent: py({
      id: 'l2-logica-independent',
      title: 'Tres evaluaciones',
      prompt: 'Muestra, en tres líneas, el resultado de evaluar:\n1) si 15 es mayor o igual que 18\n2) si 15 es mayor o igual que 18 o 15 es igual a 15\n3) la negación de la expresión 1\n\nUsa comparaciones, no escribas True/False directamente.',
      starterCode: '',
      solution: 'print(15 >= 18)\nprint(15 >= 18 or 15 == 15)\nprint(not (15 >= 18))',
      tests: [
        { name: 'Resultados correctos', expectedStdout: 'False\nTrue\nTrue' },
      ],
      hints: ['"mayor o igual" se escribe >=, "igual a" se escribe ==.', 'Para la 2 combina dos comparaciones con or.', 'Para la 3: print(not (15 >= 18))'],
      explanation: 'Las comparaciones producen True/False, y and/or/not combinan esos valores.',
    }),
    retrieval: [
      q('l2-logica-q1', '¿Qué muestra este código?', ['True', 'False', 'Error', 'None'], 0, 'Dentro del paréntesis: True and False = False. not False = True.', 'print(not (3 > 2 and 2 > 3))'),
      q('l2-logica-q2', '¿Qué operador compara si dos valores son iguales?', ['=', '==', '!=', '=>'], 1, '== compara; un solo = guarda un valor en una variable.'),
      q('l2-logica-q3', '¿Cuándo es True una expresión con or?', ['Solo si ambas partes son True', 'Si al menos una parte es True', 'Nunca', 'Solo si ambas son False'], 1, 'or necesita que al menos una de las partes sea verdadera.'),
    ],
    commonErrors: [
      { error: 'Usar = para comparar', why: '= guarda valores; == compara.', fix: 'En condiciones usa ==.' },
      { error: 'Escribir true o false en minúsculas', why: 'En Python se escriben True y False.', fix: 'Primera letra en mayúscula.' },
      { error: 'Confundir and con or', why: 'and exige ambas; or acepta cualquiera.', fix: 'Léelo como "y además" (and) u "o bien" (or).' },
    ],
    challenge: choice({
      id: 'l2-logica-challenge',
      title: 'Mini-reto: condición de acceso',
      prompt: 'Para entrar a un laboratorio necesitas credencial Y (estar inscrito O tener permiso). Tienes credencial, no estás inscrito y sí tienes permiso. ¿Puedes entrar?',
      code: 'credencial = True\ninscrito = False\npermiso = True\nprint(credencial and (inscrito or permiso))',
      options: [
        { text: 'True: puedes entrar', feedback: '¡Bien! (False or True) = True, y True and True = True.' },
        { text: 'False: no puedes entrar', feedback: 'Evalúa primero el paréntesis: inscrito or permiso.' },
        { text: 'Error', feedback: 'El código es válido.' },
      ],
      correctIndex: 0,
      hints: ['Resuelve primero lo que está entre paréntesis.', 'False or True = True.'],
      explanation: 'Los paréntesis definen qué se evalúa primero, igual que en aritmética.',
    }),
    feynman: {
      prompt: 'Explica con un ejemplo de tu vida diaria la diferencia entre and y or, y qué hace not.',
      keyIdeas: [
        { label: 'and: ambas', keywords: ['ambas', 'las dos', 'los dos', 'ambos', 'and'] },
        { label: 'or: al menos una', keywords: ['al menos', 'una de', 'cualquiera', 'or'] },
        { label: 'not invierte', keywords: ['invierte', 'contrario', 'niega', 'negación', 'negacion', 'not'] },
      ],
    },
    mastery: MASTERY,
  },
];

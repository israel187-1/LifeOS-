import type { Lesson } from '../../domain/types';
import { MASTERY, choice, code, order, py, q } from '../helpers';

export const level1: Lesson[] = [
  {
    id: 'l1-print',
    levelId: 1,
    title: 'Tu primer programa: print()',
    objective: 'Escribir y ejecutar un programa que muestre mensajes en pantalla.',
    learn: ['Qué es un programa y qué significa ejecutarlo', 'Mostrar texto y números con print()', 'Por qué el texto va entre comillas', 'Escribir comentarios con #'],
    concept: [
      'Un programa es una lista de instrucciones que la computadora ejecuta en orden, de arriba hacia abajo.',
      'print() muestra algo en pantalla. Lo que pones dentro de los paréntesis es lo que se muestra.',
      'El texto (llamado "cadena" o str) va entre comillas: "Hola". Los números van sin comillas y Python puede calcular con ellos: print(2 + 3) muestra 5.',
      'Una línea que empieza con # es un comentario: Python la ignora. Sirve para explicarte a ti mismo qué hace el código.',
    ],
    example: {
      title: 'Presentarse con un programa',
      pseint: code(`
Algoritmo Presentacion
    Escribir "Hola, soy Israel"
    Escribir "Estudio Sistemas"
    Escribir 2 + 3
FinAlgoritmo`),
      python: code(`
# Mi primer programa
print("Hola, soy Israel")
print("Estudio Sistemas")
print(2 + 3)`),
      steps: [
        { lines: [1], text: 'La línea 1 es un comentario. Python la salta; es solo para personas.' },
        { lines: [2], text: 'print("Hola, soy Israel") muestra exactamente el texto que está entre comillas.' },
        { lines: [3], text: 'Cada print() escribe en una línea nueva. Es como "Escribir" en PSeInt.' },
        { lines: [4], text: 'Sin comillas, 2 + 3 es una operación: Python calcula y muestra 5. Con comillas ("2 + 3") mostraría el texto tal cual.' },
      ],
    },
    guided: py({
      id: 'l1-print-guided',
      title: 'Hola, mundo',
      prompt: 'Cambia los guiones bajos para que el programa muestre exactamente: Hola, mundo',
      starterCode: 'print("___")',
      solution: 'print("Hola, mundo")',
      tests: [{ name: 'Muestra "Hola, mundo"', expectedStdout: 'Hola, mundo' }],
      hints: ['Solo tienes que reemplazar ___ por el texto que quieres mostrar.', 'Respeta la coma y las mayúsculas: Hola, mundo', 'Debe quedar: print("Hola, mundo")'],
      explanation: 'print() muestra el texto que pones entre comillas, carácter por carácter.',
    }),
    bugfix: py({
      id: 'l1-print-bugfix',
      title: 'Corrige el error',
      prompt: 'Este programa debería mostrar: Me gusta programar. Ejecútalo, lee el error y corrígelo.',
      starterCode: 'print("Me gusta programar)',
      solution: 'print("Me gusta programar")',
      tests: [{ name: 'Muestra el mensaje', expectedStdout: 'Me gusta programar' }],
      hints: ['El error dice que algo no se cerró. ¿Qué abre y qué cierra en esta línea?', 'Cuenta las comillas: abre una antes de Me… ¿dónde se cierra?', 'Falta la comilla de cierre antes del paréntesis: ...programar")'],
      explanation: 'Cada comilla que abre un texto necesita otra que lo cierre. Python avisa con un SyntaxError cuando falta.',
    }),
    independent: py({
      id: 'l1-print-independent',
      title: 'Tres líneas',
      prompt: 'Escribe un programa que muestre estas tres líneas, exactamente así:\n\nBienvenido a LifeOS\nHoy aprendo Python\nPaso a paso',
      starterCode: '# Escribe tu programa aquí\n',
      solution: 'print("Bienvenido a LifeOS")\nprint("Hoy aprendo Python")\nprint("Paso a paso")',
      tests: [{ name: 'Muestra las tres líneas en orden', expectedStdout: 'Bienvenido a LifeOS\nHoy aprendo Python\nPaso a paso' }],
      hints: ['Necesitas un print() por cada línea.', 'Cada texto va entre comillas dentro de print().', 'La primera línea es print("Bienvenido a LifeOS"). Haz lo mismo con las otras dos.'],
      explanation: 'Tres print() en orden producen tres líneas en orden: el programa se ejecuta de arriba hacia abajo.',
    }),
    retrieval: [
      q('l1-print-q1', '¿Qué muestra este código?', ['2 + 3', '5', '"2 + 3"', 'Un error'], 1, 'Sin comillas, Python calcula la operación y muestra 5.', 'print(2 + 3)'),
      q('l1-print-q2', '¿Qué muestra este código?', ['5', '2 + 3', 'Un error', '23'], 1, 'Con comillas es texto: se muestra literalmente "2 + 3" (sin las comillas).', 'print("2 + 3")'),
      q('l1-print-q3', '¿Para qué sirve una línea que empieza con #?', ['Para mostrar texto en pantalla', 'Para escribir un comentario que Python ignora', 'Para crear una variable', 'Para terminar el programa'], 1, 'Los comentarios ayudan a las personas a entender el código; Python no los ejecuta.'),
    ],
    commonErrors: [
      { error: 'Print("Hola")', why: 'Python distingue mayúsculas: Print no existe.', fix: 'Escribe print en minúsculas.' },
      { error: 'print("Hola)', why: 'El texto no se cerró con comillas.', fix: 'Cierra el texto: print("Hola")' },
      { error: 'print(Hola)', why: 'Sin comillas, Python cree que Hola es una variable que no existe (NameError).', fix: 'Si es texto, ponlo entre comillas.' },
    ],
    challenge: py({
      id: 'l1-print-challenge',
      title: 'Mini-reto: un cuadro',
      prompt: 'Muestra este cuadro exactamente (3 líneas):\n\n+------+\n| Hola |\n+------+',
      starterCode: '',
      solution: 'print("+------+")\nprint("| Hola |")\nprint("+------+")',
      tests: [{ name: 'Dibuja el cuadro', expectedStdout: '+------+\n| Hola |\n+------+' }],
      hints: ['Cada línea del cuadro es un print() con un texto.', 'La primera y la última línea son iguales: "+------+" (6 guiones).', 'La línea del medio es "| Hola |" con un espacio a cada lado de Hola.'],
      explanation: 'Los símbolos dentro de las comillas son texto como cualquier otro: print los muestra tal cual.',
    }),
    feynman: {
      prompt: 'Explica, como si se lo contaras a un compañero que nunca ha programado, qué hace print() y por qué a veces usamos comillas y a veces no.',
      keyIdeas: [
        { label: 'print muestra en pantalla', keywords: ['muestra', 'pantalla', 'imprime', 'salida', 'escribe'] },
        { label: 'las comillas indican texto', keywords: ['comilla', 'texto', 'cadena', 'string', 'str'] },
        { label: 'sin comillas se calcula', keywords: ['número', 'numero', 'calcula', 'operación', 'operacion', 'suma'] },
      ],
    },
    mastery: MASTERY,
  },
  {
    id: 'l1-errores',
    levelId: 1,
    title: 'Leer errores sin miedo',
    objective: 'Leer un mensaje de error de Python y usarlo para corregir tu programa.',
    learn: ['Que un error es información, no un fracaso', 'Las 3 partes de un mensaje de error: línea, tipo y mensaje', 'Diferenciar SyntaxError y NameError', 'Un método para corregir: cambiar una cosa y volver a ejecutar'],
    concept: [
      'Todos los programadores ven errores todo el tiempo. Un error es Python diciéndote exactamente qué no entendió.',
      'Un mensaje de error tiene 3 partes útiles: la línea donde ocurrió, el tipo de error (por ejemplo NameError) y una descripción.',
      'SyntaxError: el código está mal escrito (falta una comilla, un paréntesis…). Python ni siquiera empieza a ejecutar.',
      'NameError: usaste un nombre que Python no conoce, por ejemplo Print en vez de print, o un texto sin comillas. El programa se ejecuta hasta esa línea y se detiene.',
      'Método: lee la línea indicada, piensa una hipótesis, cambia UNA sola cosa y vuelve a ejecutar.',
    ],
    example: {
      title: 'Un programa que se detiene a la mitad',
      python: code(`
print("Inicio")
print(mensaje)
print("Fin")`),
      steps: [
        { lines: [1], text: 'La línea 1 funciona: se muestra "Inicio".' },
        { lines: [2], text: 'En la línea 2 Python busca algo llamado mensaje. No existe, así que lanza: NameError: name \'mensaje\' is not defined (línea 2).' },
        { lines: [3], text: 'Cuando ocurre un error, el programa se detiene: "Fin" nunca se muestra.' },
        { lines: [2], text: 'Hipótesis: queríamos mostrar el texto "mensaje". Solución: print("mensaje"). Cambiamos solo eso y volvemos a ejecutar.' },
      ],
    },
    guided: choice({
      id: 'l1-errores-guided',
      title: 'Interpreta el error',
      prompt: 'Ejecutas print(hola) y aparece:\nNameError: name \'hola\' is not defined\n¿Qué significa?',
      options: [
        { text: 'Python no está instalado correctamente.', feedback: 'No: Python funcionó y te está avisando de algo concreto en tu código.' },
        { text: 'hola no tiene comillas, así que Python lo busca como variable y no la encuentra.', feedback: '¡Exacto! Sin comillas, hola se interpreta como un nombre de variable.' },
        { text: 'print está mal escrito.', feedback: 'print está bien escrito. Fíjate en qué nombre menciona el mensaje.' },
        { text: 'Falta un paréntesis.', feedback: 'Eso sería un SyntaxError. Este es un NameError.' },
      ],
      correctIndex: 1,
      hints: ['Fíjate en el tipo de error: NameError. Habla de un "nombre".', '¿Qué nombre menciona el mensaje? ¿Por qué Python lo trataría como un nombre y no como texto?'],
      explanation: 'NameError significa que usaste un nombre que no existe. Si querías texto, faltan las comillas.',
    }),
    bugfix: py({
      id: 'l1-errores-bugfix',
      title: 'Dos errores, uno a la vez',
      prompt: 'Este programa debería mostrar Paso 1, Paso 2 y Paso 3 en tres líneas. Tiene dos errores. Ejecuta, corrige uno, vuelve a ejecutar y corrige el otro.',
      starterCode: 'print("Paso 1")\nPrint("Paso 2")\nprint("Paso 3"',
      solution: 'print("Paso 1")\nprint("Paso 2")\nprint("Paso 3")',
      tests: [{ name: 'Muestra los tres pasos', expectedStdout: 'Paso 1\nPaso 2\nPaso 3' }],
      hints: ['Ejecuta primero: Python te dirá el primer error que encuentre y su línea.', 'Un error es de sintaxis (falta cerrar algo). El otro es de mayúsculas.', 'Línea 2: print en minúsculas. Línea 3: falta el paréntesis de cierre.'],
      explanation: 'Python reporta los errores de sintaxis primero. Corregir uno a la vez y volver a ejecutar es más rápido que adivinar todo de golpe.',
    }),
    independent: py({
      id: 'l1-errores-independent',
      title: 'La lista de compras',
      prompt: 'Este programa tiene 3 errores distintos. Corrígelos para que muestre:\n\nLista de compras:\n- pan\n- leche\n- huevos',
      starterCode: 'print("Lista de compras:")\nprint("- pan)\nprint(- leche")\nprin("- huevos")',
      solution: 'print("Lista de compras:")\nprint("- pan")\nprint("- leche")\nprint("- huevos")',
      tests: [{ name: 'Muestra la lista completa', expectedStdout: 'Lista de compras:\n- pan\n- leche\n- huevos' }],
      hints: ['Ejecuta y mira qué línea indica el error.', 'Revisa en cada línea: ¿las comillas abren y cierran? ¿print está bien escrito?', 'Línea 2: falta la comilla final. Línea 3: falta la comilla inicial. Línea 4: prin → print.'],
      explanation: 'Leer la línea indicada y revisar comillas, paréntesis y nombres resuelve la mayoría de los errores de principiante.',
    }),
    retrieval: [
      q('l1-errores-q1', '¿Qué tipo de error produce este código?', ['NameError', 'SyntaxError', 'TypeError', 'Ninguno'], 1, 'Falta cerrar el paréntesis: el código está mal escrito, así que es un SyntaxError.', 'print("Hola"'),
      q('l1-errores-q2', 'Si un programa tiene un error en la línea 3 de 5, ¿qué pasa con las líneas 4 y 5?', ['Se ejecutan normalmente', 'No se ejecutan: el programa se detiene', 'Se ejecutan dos veces', 'Se convierten en comentarios'], 1, 'Al ocurrir un error en ejecución, el programa se detiene en esa línea.'),
      q('l1-errores-q3', '¿Cuál es la mejor estrategia ante un error?', ['Borrar todo y empezar de nuevo', 'Cambiar muchas cosas a la vez', 'Leer la línea indicada, cambiar una cosa y volver a ejecutar', 'Copiar otra solución sin leer'], 2, 'Cambiar una sola cosa te permite saber qué arregló (o empeoró) el problema.'),
    ],
    commonErrors: [
      { error: 'Ignorar el número de línea', why: 'El mensaje casi siempre señala la línea exacta (o la anterior).', fix: 'Ve directo a esa línea antes de revisar todo.' },
      { error: 'Cambiar muchas cosas a la vez', why: 'No sabrás cuál cambio resolvió o creó un problema.', fix: 'Un cambio, una ejecución.' },
      { error: 'Pensar que un error significa "no sirvo para esto"', why: 'Los errores son parte normal de programar, incluso para expertos.', fix: 'Trátalo como una pista, no como un juicio.' },
    ],
    challenge: order({
      id: 'l1-errores-challenge',
      title: 'Mini-reto: el método para depurar',
      prompt: 'Ordena los pasos para corregir un error de forma eficiente.',
      steps: ['Leer el tipo de error y el mensaje', 'Ir a la línea que indica el error', 'Pensar una hipótesis de qué está mal', 'Cambiar una sola cosa', 'Volver a ejecutar y comprobar'],
      hints: ['Primero se obtiene información, después se actúa.', 'El último paso siempre es comprobar si funcionó.'],
      explanation: 'Leer → ubicar → hipótesis → un cambio → comprobar. Es el ciclo básico de depuración que usarás siempre.',
    }),
    feynman: {
      prompt: 'Explica con tus palabras qué información te da un mensaje de error y qué harías paso a paso para corregirlo.',
      keyIdeas: [
        { label: 'la línea del error', keywords: ['línea', 'linea'] },
        { label: 'el tipo de error', keywords: ['tipo', 'nameerror', 'syntaxerror', 'sintaxis'] },
        { label: 'cambiar una cosa y probar', keywords: ['cambiar', 'una cosa', 'probar', 'ejecutar', 'comprobar'] },
      ],
    },
    mastery: MASTERY,
  },
];

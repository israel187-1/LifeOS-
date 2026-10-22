import type { Lesson } from '../../domain/types';
import { MASTERY, code, py, q } from '../helpers';

export const level7: Lesson[] = [
  {
    id: 'l7-while',
    levelId: 7,
    title: 'Repetir con while',
    objective: 'Repetir instrucciones mientras se cumpla una condición, sin crear bucles infinitos.',
    learn: ['Sintaxis de while', 'Contadores y acumuladores', 'Cómo evitar bucles infinitos', 'Equivalencia con Mientras de PSeInt'],
    concept: [
      'while repite su bloque MIENTRAS la condición sea True. Antes de cada vuelta, vuelve a revisarla.',
      'Algo dentro del bucle debe cambiar para que la condición llegue a ser False. Si no, el bucle es infinito.',
      'Contador: variable que aumenta de uno en uno (i = i + 1). Acumulador: variable que va sumando valores (total = total + x).',
      'while es ideal cuando no sabes cuántas veces se repetirá (por ejemplo, "hasta que el usuario escriba 0").',
    ],
    example: {
      title: 'Contar del 1 al 5',
      pseint: code(`
Algoritmo Contar
    contador <- 1
    Mientras contador <= 5 Hacer
        Escribir contador
        contador <- contador + 1
    FinMientras
    Escribir "Listo"
FinAlgoritmo`),
      python: code(`
contador = 1
while contador <= 5:
    print(contador)
    contador = contador + 1
print("Listo")`),
      steps: [
        { lines: [1], text: 'Iniciamos el contador en 1.' },
        { lines: [2], text: '¿1 <= 5? True: entra al bloque.' },
        { lines: [3, 4], text: 'Muestra 1 y aumenta el contador a 2. Vuelve a la línea 2.' },
        { lines: [2], text: 'Se repite con 2, 3, 4, 5. Cuando contador vale 6, 6 <= 5 es False y el bucle termina.' },
        { lines: [5], text: 'Sin sangría: se ejecuta una vez, al final. Sin la línea 4, el bucle nunca terminaría.' },
      ],
    },
    guided: py({
      id: 'l7-while-guided',
      title: 'Cuenta regresiva',
      prompt: 'Completa la condición: el programa lee n y cuenta hacia atrás hasta 1, luego muestra ¡Despegue!',
      starterCode: 'n = int(input())\nwhile n ___ 0:\n    print(n)\n    n = n - 1\nprint("¡Despegue!")',
      solution: 'n = int(input())\nwhile n > 0:\n    print(n)\n    n = n - 1\nprint("¡Despegue!")',
      usesInput: true,
      sampleInput: ['3'],
      tests: [
        { name: 'Con 3', stdin: ['3'], expectedStdout: '3\n2\n1\n¡Despegue!' },
        { name: 'Con 1', stdin: ['1'], expectedStdout: '1\n¡Despegue!' },
        { name: 'Con 0', stdin: ['0'], expectedStdout: '¡Despegue!' },
      ],
      hints: ['El bucle debe seguir mientras n sea positivo.', '¿Debe mostrarse el 0? No.', 'while n > 0:'],
      explanation: 'n > 0 deja de cumplirse justo cuando n llega a 0.',
    }),
    bugfix: py({
      id: 'l7-while-bugfix',
      title: 'Bucle infinito',
      prompt: 'Este programa nunca termina. Debería mostrar Repaso 1, Repaso 2, Repaso 3 y Fin. Encuentra qué falta.',
      starterCode: 'i = 1\nwhile i <= 3:\n    print("Repaso", i)\nprint("Fin")',
      solution: 'i = 1\nwhile i <= 3:\n    print("Repaso", i)\n    i = i + 1\nprint("Fin")',
      tests: [{ name: 'Termina y muestra 3 repasos', expectedStdout: 'Repaso 1\nRepaso 2\nRepaso 3\nFin' }],
      hints: ['Haz la traza: ¿cambia i en algún momento?', 'Si i siempre vale 1, i <= 3 siempre es True.', 'Agrega i = i + 1 dentro del bucle (con sangría).'],
      explanation: 'Todo while necesita que algo dentro del bloque acerque la condición a False.',
    }),
    independent: py({
      id: 'l7-while-independent',
      title: 'Sumar hasta el 0',
      prompt: 'Lee números enteros uno por uno hasta que llegue un 0. Al final muestra la suma de todos los números leídos.\n\nEntrada: 5, 3, 2, 0 → 10',
      starterCode: '',
      solution: 'suma = 0\nn = int(input())\nwhile n != 0:\n    suma = suma + n\n    n = int(input())\nprint(suma)',
      usesInput: true,
      sampleInput: ['5', '3', '2', '0'],
      tests: [
        { name: '5, 3, 2, 0', stdin: ['5', '3', '2', '0'], expectedStdout: '10' },
        { name: 'Solo 0', stdin: ['0'], expectedStdout: '0' },
        { name: 'Con negativos', stdin: ['-1', '1', '7', '0'], expectedStdout: '7' },
      ],
      hints: ['Necesitas un acumulador que empiece en 0.', 'Lee un primer número antes del bucle; dentro, suma y lee el siguiente.', 'while n != 0: suma = suma + n y n = int(input())'],
      explanation: 'Patrón "leer antes del bucle y al final de cada vuelta": muy común cuando no sabes cuántos datos vendrán.',
    }),
    retrieval: [
      q('l7-while-q1', '¿Cuántas veces se muestra "Hola"?', ['2', '3', '4', 'Infinitas'], 1, 'i toma 0, 1 y 2 (tres vueltas). Con 3, 3 < 3 es False.', 'i = 0\nwhile i < 3:\n    print("Hola")\n    i = i + 1'),
      q('l7-while-q2', '¿Qué causa un bucle infinito?', ['Usar print dentro del bucle', 'Que la condición nunca llegue a ser False', 'Usar números negativos', 'No tener else'], 1, 'Si nada cambia la condición, el bucle no termina.'),
      q('l7-while-q3', '¿Qué es un acumulador?', ['Una variable que cuenta de 1 en 1', 'Una variable que va sumando valores', 'Un tipo de dato', 'Un error'], 1, 'total = total + valor acumula; i = i + 1 cuenta.'),
    ],
    commonErrors: [
      { error: 'No actualizar la variable de control', why: 'La condición nunca cambia: bucle infinito.', fix: 'Modifica la variable dentro del bloque.' },
      { error: 'Iniciar el acumulador dentro del bucle', why: 'Se reinicia en cada vuelta.', fix: 'Inícialo antes del while.' },
      { error: 'Condición de parada con el signo equivocado', why: '< vs <= cambia una vuelta.', fix: 'Haz la traza con el último valor.' },
    ],
    challenge: py({
      id: 'l7-while-challenge',
      title: 'Mini-reto: adivina el número',
      prompt: 'El número secreto es 7. Lee intentos hasta acertar. Si el intento es menor, muestra "Más alto"; si es mayor, "Más bajo". Al acertar muestra "¡Correcto! Intentos: N".',
      starterCode: 'secreto = 7\n',
      solution: 'secreto = 7\nintentos = 0\nadivinado = False\nwhile not adivinado:\n    n = int(input())\n    intentos = intentos + 1\n    if n < secreto:\n        print("Más alto")\n    elif n > secreto:\n        print("Más bajo")\n    else:\n        adivinado = True\nprint(f"¡Correcto! Intentos: {intentos}")',
      usesInput: true,
      sampleInput: ['3', '9', '7'],
      tests: [
        { name: '3, 9, 7', stdin: ['3', '9', '7'], expectedStdout: 'Más alto\nMás bajo\n¡Correcto! Intentos: 3' },
        { name: 'A la primera', stdin: ['7'], expectedStdout: '¡Correcto! Intentos: 1' },
      ],
      hints: ['Necesitas un contador de intentos y una condición de parada.', 'Puedes usar una variable booleana adivinado = False.', 'Dentro del bucle: leer, contar, comparar con if/elif/else.'],
      explanation: 'Combinas while + if/elif + contador: es la estructura de muchos juegos y menús.',
    }),
    feynman: {
      prompt: 'Explica cómo funciona un while y qué debes revisar para que no se vuelva infinito.',
      keyIdeas: [
        { label: 'repite mientras sea verdadero', keywords: ['repite', 'mientras', 'vuelta', 'true', 'verdadera'] },
        { label: 'algo debe cambiar', keywords: ['cambiar', 'cambia', 'actualizar', 'aumentar', 'incrementa'] },
        { label: 'condición falsa termina', keywords: ['falsa', 'false', 'termina', 'para', 'detiene'] },
      ],
    },
    mastery: MASTERY,
  },
  {
    id: 'l7-for',
    levelId: 7,
    title: 'Repetir con for y range()',
    objective: 'Recorrer secuencias de números y de caracteres con for.',
    learn: ['Sintaxis de for con range()', 'range(n), range(a, b) y range(a, b, paso)', 'Recorrer los caracteres de un texto', 'Cuándo usar for y cuándo while'],
    concept: [
      'for repite su bloque una vez por cada elemento de una secuencia. La variable toma cada valor en orden.',
      'range(5) genera 0, 1, 2, 3, 4 (¡no incluye el 5!). range(1, 6) genera 1 a 5. range(0, 10, 2) va de 2 en 2.',
      'También puedes recorrer un texto letra por letra: for letra in "hola":.',
      'Usa for cuando sabes cuántas veces repetir o qué recorrer. Usa while cuando dependes de una condición.',
      'PSeInt: Para i <- 1 Hasta 5 Con Paso 1 Hacer ... FinPara → for i in range(1, 6):',
    ],
    example: {
      title: 'Tabla del 3',
      pseint: code(`
Algoritmo Tabla
    Para i <- 1 Hasta 5 Con Paso 1 Hacer
        Escribir i, " x 3 = ", i * 3
    FinPara
FinAlgoritmo`),
      python: code(`
for i in range(1, 6):
    print(i, "x 3 =", i * 3)
total = 0
for i in range(1, 6):
    total = total + i
print("Suma:", total)`),
      steps: [
        { lines: [1], text: 'range(1, 6) produce 1, 2, 3, 4, 5. El 6 NO se incluye.' },
        { lines: [2], text: 'En cada vuelta i tiene un valor distinto: 1 x 3 = 3, 2 x 3 = 6, … 5 x 3 = 15.' },
        { lines: [3, 4, 5], text: 'Acumulador con for: total suma 1 + 2 + 3 + 4 + 5.' },
        { lines: [6], text: 'Muestra Suma: 15. No hubo que actualizar i a mano: for lo hace solo.' },
      ],
    },
    guided: py({
      id: 'l7-for-guided',
      title: 'Del 1 al n',
      prompt: 'Completa range() para que el programa muestre los números del 1 al n (incluido).',
      starterCode: 'n = int(input())\nfor i in range(___, ___):\n    print(i)',
      solution: 'n = int(input())\nfor i in range(1, n + 1):\n    print(i)',
      usesInput: true,
      sampleInput: ['3'],
      tests: [
        { name: 'Con 3', stdin: ['3'], expectedStdout: '1\n2\n3' },
        { name: 'Con 1', stdin: ['1'], expectedStdout: '1' },
        { name: 'Con 5', stdin: ['5'], expectedStdout: '1\n2\n3\n4\n5' },
      ],
      hints: ['range(a, b) empieza en a y termina en b - 1.', 'Para incluir n, el final debe ser n + 1.', 'range(1, n + 1)'],
      explanation: 'El límite superior de range no se incluye; por eso se usa n + 1.',
    }),
    bugfix: py({
      id: 'l7-for-bugfix',
      title: 'Falta uno',
      prompt: 'El programa debería sumar del 1 al n. Con 5 debería mostrar 15, pero muestra 10. Corrígelo.',
      starterCode: 'n = int(input())\nsuma = 0\nfor i in range(1, n):\n    suma = suma + i\nprint(suma)',
      solution: 'n = int(input())\nsuma = 0\nfor i in range(1, n + 1):\n    suma = suma + i\nprint(suma)',
      usesInput: true,
      sampleInput: ['5'],
      tests: [
        { name: 'Con 5', stdin: ['5'], expectedStdout: '15' },
        { name: 'Con 1', stdin: ['1'], expectedStdout: '1' },
        { name: 'Con 10', stdin: ['10'], expectedStdout: '55' },
      ],
      hints: ['15 - 10 = 5: ¿qué número no se está sumando?', 'range(1, n) no incluye n.', 'range(1, n + 1)'],
      explanation: 'Es el famoso error "por uno" (off-by-one). Revisa siempre el primer y el último valor.',
    }),
    independent: py({
      id: 'l7-for-independent',
      title: 'Tabla de multiplicar',
      prompt: 'Lee un número n y muestra su tabla del 1 al 10 con este formato:\n\n7 x 1 = 7\n7 x 2 = 14\n...\n7 x 10 = 70',
      starterCode: '',
      solution: 'n = int(input())\nfor i in range(1, 11):\n    print(f"{n} x {i} = {n * i}")',
      usesInput: true,
      sampleInput: ['7'],
      tests: [
        { name: 'Tabla del 7', stdin: ['7'], expectedStdout: Array.from({ length: 10 }, (_, i) => `7 x ${i + 1} = ${7 * (i + 1)}`).join('\n') },
        { name: 'Tabla del 1', stdin: ['1'], expectedStdout: Array.from({ length: 10 }, (_, i) => `1 x ${i + 1} = ${i + 1}`).join('\n') },
      ],
      hints: ['Necesitas que i vaya del 1 al 10.', 'range(1, 11)', 'print(f"{n} x {i} = {n * i}")'],
      explanation: 'for + range + f-string: un patrón que usarás constantemente.',
    }),
    retrieval: [
      q('l7-for-q1', '¿Qué números genera range(3)?', ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '3'], 1, 'range(n) empieza en 0 y termina en n - 1.'),
      q('l7-for-q2', '¿Qué muestra este código?', ['0 2 4 6', '2 4 6', '0 2 4', '0 1 2 3 4 5'], 2, 'range(0, 6, 2) da 0, 2, 4 (el 6 no se incluye).', 'for i in range(0, 6, 2):\n    print(i, end=" ")'),
      q('l7-for-q3', '¿Cuándo es preferible while en lugar de for?', ['Cuando sabes exactamente cuántas vueltas', 'Cuando repites hasta que ocurra algo y no sabes cuántas vueltas', 'Nunca', 'Para recorrer un texto'], 1, 'while depende de una condición; for recorre algo conocido.'),
    ],
    commonErrors: [
      { error: 'Esperar que range incluya el final', why: 'range(1, 5) termina en 4.', fix: 'Usa range(1, n + 1).' },
      { error: 'Modificar i dentro del for esperando cambiar las vueltas', why: 'for asigna el siguiente valor de todos modos.', fix: 'Si necesitas controlar el avance, usa while.' },
      { error: 'Olvidar los dos puntos o la sangría', why: 'Igual que if y while.', fix: 'for i in range(5):' },
    ],
    challenge: py({
      id: 'l7-for-challenge',
      title: 'Mini-reto: contar vocales',
      prompt: 'Lee una palabra y muestra cuántas vocales tiene (sin acentos, mayúsculas o minúsculas).\n\nprogramacion → 5',
      starterCode: '',
      solution: 'palabra = input()\ncuenta = 0\nfor letra in palabra:\n    if letra in "aeiouAEIOU":\n        cuenta = cuenta + 1\nprint(cuenta)',
      usesInput: true,
      sampleInput: ['programacion'],
      tests: [
        { name: 'programacion', stdin: ['programacion'], expectedStdout: '5' },
        { name: 'xyz', stdin: ['xyz'], expectedStdout: '0' },
        { name: 'Aeropuerto', stdin: ['Aeropuerto'], expectedStdout: '6' },
      ],
      hints: ['for letra in palabra: recorre letra por letra.', 'letra in "aeiouAEIOU" es True si la letra es vocal.', 'Usa un contador que empiece en 0.'],
      explanation: 'for sobre texto + if + contador. "in" revisa si un carácter está dentro de otro texto.',
    }),
    feynman: {
      prompt: 'Explica cómo funciona for con range() y en qué se diferencia de while.',
      keyIdeas: [
        { label: 'recorre una secuencia', keywords: ['recorre', 'cada', 'secuencia', 'elemento', 'valor'] },
        { label: 'range no incluye el final', keywords: ['incluye', 'menos uno', 'n + 1', 'n+1', 'último', 'ultimo'] },
        { label: 'diferencia con while', keywords: ['while', 'condición', 'condicion', 'cuántas', 'cuantas', 'veces'] },
      ],
    },
    mastery: MASTERY,
  },
];

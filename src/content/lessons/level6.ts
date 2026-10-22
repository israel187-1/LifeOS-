import type { Lesson } from '../../domain/types';
import { MASTERY, code, py, q } from '../helpers';

export const level6: Lesson[] = [
  {
    id: 'l6-if-else',
    levelId: 6,
    title: 'Decisiones con if / else',
    objective: 'Hacer que un programa elija entre dos caminos según una condición.',
    learn: ['Sintaxis de if / else', 'Los dos puntos y la sangría', 'Usar comparaciones como condición', 'Equivalencia con Si...Entonces...SiNo de PSeInt'],
    concept: [
      'if ejecuta un bloque SOLO si la condición es True. else ejecuta otro bloque si es False.',
      'La línea del if termina con dos puntos (:). Las instrucciones del bloque llevan sangría de 4 espacios.',
      'La sangría no es decoración: indica qué líneas pertenecen al if. Lo que ya no tiene sangría se ejecuta siempre.',
      'PSeInt: Si cond Entonces ... SiNo ... FinSi. En Python no hay FinSi: el bloque termina cuando termina la sangría.',
    ],
    example: {
      title: '¿Aprobado o no? (en este ejemplo se aprueba con 70)',
      pseint: code(`
Algoritmo Aprobado
    Leer calificacion
    Si calificacion >= 70 Entonces
        Escribir "Aprobado"
    SiNo
        Escribir "Reprobado"
    FinSi
    Escribir "Fin"
FinAlgoritmo`),
      python: code(`
calificacion = int(input())
if calificacion >= 70:
    print("Aprobado")
else:
    print("Reprobado")
print("Fin")`),
      steps: [
        { lines: [1], text: 'Leemos y convertimos a entero para poder comparar con 70.' },
        { lines: [2], text: 'La condición calificacion >= 70 da True o False. Termina con dos puntos.' },
        { lines: [3], text: 'Con sangría: solo se ejecuta si la condición es True.' },
        { lines: [4, 5], text: 'else: (sin condición) cubre el caso contrario.' },
        { lines: [6], text: 'Sin sangría: se ejecuta siempre, pase lo que pase.' },
      ],
    },
    guided: py({
      id: 'l6-if-else-guided',
      title: 'Par o impar',
      prompt: 'Completa la condición para que el programa diga si el número es Par o Impar.',
      starterCode: 'n = int(input())\nif n % 2 == ___:\n    print("Par")\nelse:\n    print("Impar")',
      solution: 'n = int(input())\nif n % 2 == 0:\n    print("Par")\nelse:\n    print("Impar")',
      usesInput: true,
      sampleInput: ['4'],
      tests: [
        { name: 'Con 4', stdin: ['4'], expectedStdout: 'Par' },
        { name: 'Con 7', stdin: ['7'], expectedStdout: 'Impar' },
        { name: 'Con 0', stdin: ['0'], expectedStdout: 'Par' },
      ],
      hints: ['¿Cuál es el residuo de dividir un número par entre 2?', 'Un número par tiene residuo 0.', 'if n % 2 == 0:'],
      explanation: 'n % 2 == 0 es la prueba clásica de número par.',
    }),
    bugfix: py({
      id: 'l6-if-else-bugfix',
      title: 'Mayor de edad',
      prompt: 'El programa tiene dos errores de estructura. Corrígelos para que muestre "Mayor de edad" o "Menor de edad".',
      starterCode: 'edad = int(input())\nif edad >= 18\nprint("Mayor de edad")\nelse:\n    print("Menor de edad")',
      solution: 'edad = int(input())\nif edad >= 18:\n    print("Mayor de edad")\nelse:\n    print("Menor de edad")',
      usesInput: true,
      sampleInput: ['20'],
      tests: [
        { name: 'Con 20', stdin: ['20'], expectedStdout: 'Mayor de edad' },
        { name: 'Con 18', stdin: ['18'], expectedStdout: 'Mayor de edad' },
        { name: 'Con 15', stdin: ['15'], expectedStdout: 'Menor de edad' },
      ],
      hints: ['Ejecuta y lee el primer error.', 'La línea del if necesita algo al final; el print de abajo necesita algo al inicio.', 'Agrega ":" al final del if y 4 espacios antes del primer print.'],
      explanation: 'Los dos puntos abren el bloque y la sangría indica qué contiene.',
    }),
    independent: py({
      id: 'l6-if-else-independent',
      title: 'Descuento',
      prompt: 'Lee el total de una compra (decimal). Si es mayor o igual a 500, aplica 10% de descuento. Muestra el total final con 2 decimales:\n\nTotal: 540.00\n\n(con 600 como entrada)',
      starterCode: '',
      solution: 'total = float(input())\nif total >= 500:\n    total = total * 0.9\nprint(f"Total: {total:.2f}")',
      usesInput: true,
      sampleInput: ['600'],
      tests: [
        { name: 'Con 600', stdin: ['600'], expectedStdout: 'Total: 540.00' },
        { name: 'Con 500', stdin: ['500'], expectedStdout: 'Total: 450.00' },
        { name: 'Con 100', stdin: ['100'], expectedStdout: 'Total: 100.00' },
      ],
      hints: ['No siempre necesitas else: si no hay descuento, el total no cambia.', 'Aplicar 10% de descuento = multiplicar por 0.9.', 'El print va sin sangría para que se ejecute siempre.'],
      explanation: 'Un if sin else modifica el valor solo cuando aplica; la salida común va fuera del bloque.',
    }),
    retrieval: [
      q('l6-if-else-q1', 'Si x vale 3, ¿qué muestra este código?', ['A y C', 'B y C', 'Solo C', 'A, B y C'], 1, '3 > 5 es False, se ejecuta el else (B). C no tiene sangría: se ejecuta siempre.', 'x = 3\nif x > 5:\n    print("A")\nelse:\n    print("B")\nprint("C")'),
      q('l6-if-else-q2', '¿Qué indica qué líneas pertenecen a un if?', ['Las llaves {}', 'La sangría', 'La palabra FinSi', 'El punto y coma'], 1, 'En Python, la sangría define los bloques.'),
      q('l6-if-else-q3', '¿Qué falta en "if edad > 18" para que sea válido?', ['Paréntesis', 'Dos puntos al final', 'La palabra then', 'Nada'], 1, 'if, else, elif, while, for y def terminan con ":".'),
    ],
    commonErrors: [
      { error: 'Olvidar los dos puntos', why: 'Python no sabe dónde empieza el bloque.', fix: 'if condicion:' },
      { error: 'Sangría incorrecta', why: 'Las líneas del bloque deben tener la misma sangría.', fix: 'Usa 4 espacios.' },
      { error: 'Comparar texto con número', why: 'input() da str; "20" >= 18 falla.', fix: 'int(input())' },
    ],
    challenge: py({
      id: 'l6-if-else-challenge',
      title: 'Mini-reto: el mayor',
      prompt: 'Lee dos números enteros y muestra el mayor. Si son iguales, muestra "Iguales".',
      starterCode: '',
      solution: 'a = int(input())\nb = int(input())\nif a == b:\n    print("Iguales")\nelse:\n    if a > b:\n        print(a)\n    else:\n        print(b)',
      usesInput: true,
      sampleInput: ['3', '9'],
      tests: [
        { name: 'Con 3 y 9', stdin: ['3', '9'], expectedStdout: '9' },
        { name: 'Con 9 y 3', stdin: ['9', '3'], expectedStdout: '9' },
        { name: 'Con 5 y 5', stdin: ['5', '5'], expectedStdout: 'Iguales' },
      ],
      hints: ['Hay tres casos posibles.', 'Revisa primero si son iguales.', 'Puedes poner un if dentro del else (con más sangría).'],
      explanation: 'Un if dentro de otro (anidado) permite manejar más de dos casos. En la siguiente lección verás elif, que lo simplifica.',
    }),
    feynman: {
      prompt: 'Explica cómo funciona if / else y por qué la sangría es importante en Python.',
      keyIdeas: [
        { label: 'condición True/False', keywords: ['condición', 'condicion', 'true', 'verdadero', 'falso', 'cumple'] },
        { label: 'else = caso contrario', keywords: ['else', 'contrario', 'si no', 'otro caso'] },
        { label: 'sangría define el bloque', keywords: ['sangría', 'sangria', 'espacios', 'bloque', 'indent'] },
      ],
    },
    mastery: MASTERY,
  },
  {
    id: 'l6-elif',
    levelId: 6,
    title: 'Varias opciones: elif y condiciones compuestas',
    objective: 'Elegir entre más de dos caminos con elif y combinar condiciones.',
    learn: ['Usar elif para varios casos', 'Por qué importa el orden de las condiciones', 'Combinar condiciones con and / or dentro de un if', 'Manejar casos no válidos con else'],
    concept: [
      'elif ("si no, si") revisa otra condición cuando las anteriores fueron False.',
      'Python revisa de arriba hacia abajo y ejecuta SOLO el primer bloque cuya condición sea True. Los demás se saltan.',
      'Por eso el orden importa: pon las condiciones más específicas o exigentes primero.',
      'Puedes combinar condiciones: if a > 0 and b > 0:. El else final atrapa cualquier caso no previsto.',
    ],
    example: {
      title: 'Clasificar una calificación',
      pseint: code(`
Algoritmo Clasificar
    Leer nota
    Si nota >= 90 Entonces
        Escribir "Excelente"
    SiNo
        Si nota >= 80 Entonces
            Escribir "Muy bien"
        SiNo
            Escribir "Sigue practicando"
        FinSi
    FinSi
FinAlgoritmo`),
      python: code(`
nota = int(input())
if nota >= 90:
    print("Excelente")
elif nota >= 80:
    print("Muy bien")
elif nota >= 70:
    print("Suficiente")
else:
    print("Necesita refuerzo")`),
      steps: [
        { lines: [2, 3], text: 'Si la nota es 95, la primera condición es True: muestra Excelente y salta todo lo demás.' },
        { lines: [4, 5], text: 'Si es 85: la primera es False, se revisa elif nota >= 80 → True: Muy bien.' },
        { lines: [6, 7], text: 'Gracias al orden, aquí ya sabemos que la nota es menor que 80.' },
        { lines: [8, 9], text: 'else atrapa todo lo que no cumplió ninguna condición.' },
        { text: 'En PSeInt necesitas Si anidados; elif evita tanta sangría.' },
      ],
    },
    guided: py({
      id: 'l6-elif-guided',
      title: 'Semáforo',
      prompt: 'Completa las condiciones: verde → Avanza, amarillo → Precaución, rojo → Alto. Cualquier otro → Color no válido.',
      starterCode: 'color = input()\nif color == "verde":\n    print("Avanza")\nelif color == ___:\n    print("Precaución")\nelif ___:\n    print("Alto")\nelse:\n    print("Color no válido")',
      solution: 'color = input()\nif color == "verde":\n    print("Avanza")\nelif color == "amarillo":\n    print("Precaución")\nelif color == "rojo":\n    print("Alto")\nelse:\n    print("Color no válido")',
      usesInput: true,
      sampleInput: ['amarillo'],
      tests: [
        { name: 'verde', stdin: ['verde'], expectedStdout: 'Avanza' },
        { name: 'amarillo', stdin: ['amarillo'], expectedStdout: 'Precaución' },
        { name: 'rojo', stdin: ['rojo'], expectedStdout: 'Alto' },
        { name: 'azul', stdin: ['azul'], expectedStdout: 'Color no válido' },
      ],
      hints: ['Compara texto con == y el texto entre comillas.', 'elif color == "amarillo":', 'La tercera: elif color == "rojo":'],
      explanation: 'Cada elif compara con un valor distinto; else cubre las entradas inesperadas.',
    }),
    bugfix: py({
      id: 'l6-elif-bugfix',
      title: 'El orden de las condiciones',
      prompt: 'Con 95 debería mostrar "Excelente", pero muestra "Suficiente". Corrige el orden.',
      starterCode: 'nota = int(input())\nif nota >= 70:\n    print("Suficiente")\nelif nota >= 90:\n    print("Excelente")\nelse:\n    print("Necesita refuerzo")',
      solution: 'nota = int(input())\nif nota >= 90:\n    print("Excelente")\nelif nota >= 70:\n    print("Suficiente")\nelse:\n    print("Necesita refuerzo")',
      usesInput: true,
      sampleInput: ['95'],
      tests: [
        { name: 'Con 95', stdin: ['95'], expectedStdout: 'Excelente' },
        { name: 'Con 75', stdin: ['75'], expectedStdout: 'Suficiente' },
        { name: 'Con 50', stdin: ['50'], expectedStdout: 'Necesita refuerzo' },
      ],
      hints: ['Haz la traza con 95: ¿cuál es la primera condición True?', '95 >= 70 ya es True, así que nunca llega a revisar >= 90.', 'Revisa primero nota >= 90.'],
      explanation: 'Solo se ejecuta el primer bloque verdadero: la condición más exigente debe ir primero.',
    }),
    independent: py({
      id: 'l6-elif-independent',
      title: 'Año bisiesto',
      prompt: 'Lee un año y muestra "Bisiesto" o "No bisiesto".\nUn año es bisiesto si es divisible entre 4 pero no entre 100, o si es divisible entre 400.',
      starterCode: '',
      solution: 'anio = int(input())\nif (anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0:\n    print("Bisiesto")\nelse:\n    print("No bisiesto")',
      usesInput: true,
      sampleInput: ['2024'],
      tests: [
        { name: '2024', stdin: ['2024'], expectedStdout: 'Bisiesto' },
        { name: '1900', stdin: ['1900'], expectedStdout: 'No bisiesto' },
        { name: '2000', stdin: ['2000'], expectedStdout: 'Bisiesto' },
        { name: '2023', stdin: ['2023'], expectedStdout: 'No bisiesto' },
      ],
      hints: ['"Divisible entre 4" = anio % 4 == 0. "No divisible entre 100" = anio % 100 != 0.', 'Combina: (divisible entre 4 and no entre 100) or divisible entre 400.', 'if (anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0:'],
      explanation: 'Traducir una regla en español a una condición compuesta es una habilidad clave.',
    }),
    retrieval: [
      q('l6-elif-q1', 'Con x = 15, ¿qué muestra?', ['A', 'B', 'A y B', 'C'], 0, 'La primera condición (15 > 10) es True: muestra A y salta el resto.', 'x = 15\nif x > 10:\n    print("A")\nelif x > 5:\n    print("B")\nelse:\n    print("C")'),
      q('l6-elif-q2', '¿Cuántos bloques de una cadena if/elif/else se ejecutan como máximo?', ['Todos los verdaderos', 'Uno', 'Dos', 'Ninguno'], 1, 'Solo el primero cuya condición sea True (o el else).'),
      q('l6-elif-q3', '¿Cómo se escribe "n es distinto de 0"?', ['n <> 0', 'n != 0', 'n =! 0', 'not n = 0'], 1, '!= significa "distinto de".'),
    ],
    commonErrors: [
      { error: 'Condiciones en orden incorrecto', why: 'Una condición general primero "atrapa" casos que debían ir más abajo.', fix: 'De la más exigente a la menos exigente.' },
      { error: 'Usar varios if en lugar de elif', why: 'Con varios if se pueden ejecutar varios bloques.', fix: 'Usa elif cuando los casos son excluyentes.' },
      { error: 'Escribir else con condición', why: 'else no lleva condición.', fix: 'Usa elif condicion: si necesitas una.' },
    ],
    challenge: py({
      id: 'l6-elif-challenge',
      title: 'Mini-reto: calculadora',
      prompt: 'Lee un número entero, un operador (+, -, *, /) y otro número entero, cada uno en una línea. Muestra el resultado.\nSi se divide entre 0, muestra "No se puede dividir entre 0". Si el operador no es válido, muestra "Operador no válido".',
      starterCode: 'a = int(input())\nop = input()\nb = int(input())\n',
      solution: 'a = int(input())\nop = input()\nb = int(input())\nif op == "+":\n    print(a + b)\nelif op == "-":\n    print(a - b)\nelif op == "*":\n    print(a * b)\nelif op == "/":\n    if b == 0:\n        print("No se puede dividir entre 0")\n    else:\n        print(a / b)\nelse:\n    print("Operador no válido")',
      usesInput: true,
      sampleInput: ['6', '+', '3'],
      tests: [
        { name: '6 + 3', stdin: ['6', '+', '3'], expectedStdout: '9' },
        { name: '5 - 8', stdin: ['5', '-', '8'], expectedStdout: '-3' },
        { name: '4 * 2', stdin: ['4', '*', '2'], expectedStdout: '8' },
        { name: '6 / 3', stdin: ['6', '/', '3'], expectedStdout: '2.0' },
        { name: '6 / 0', stdin: ['6', '/', '0'], expectedStdout: 'No se puede dividir entre 0' },
        { name: 'Operador x', stdin: ['2', 'x', '3'], expectedStdout: 'Operador no válido' },
      ],
      hints: ['Un if/elif por cada operador, comparando op con "+", "-", etc.', 'Dentro del caso "/" revisa si b == 0 antes de dividir.', 'El else final cubre operadores no válidos.'],
      explanation: '¡Este es el núcleo del proyecto Calculadora! Ya puedes construir su primera versión.',
    }),
    feynman: {
      prompt: 'Explica qué hace elif y por qué el orden de las condiciones puede cambiar el resultado.',
      keyIdeas: [
        { label: 'revisa otra condición', keywords: ['elif', 'otra condición', 'otra condicion', 'si no'] },
        { label: 'solo el primero verdadero', keywords: ['primero', 'primera', 'solo uno', 'salta'] },
        { label: 'el orden importa', keywords: ['orden', 'arriba', 'antes'] },
      ],
    },
    mastery: MASTERY,
  },
];

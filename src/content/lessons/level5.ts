import type { Lesson } from '../../domain/types';
import { MASTERY, code, py, q } from '../helpers';

export const level5: Lesson[] = [
  {
    id: 'l5-variables',
    levelId: 5,
    title: 'Variables y tipos de datos',
    objective: 'Guardar datos en variables, reconocer su tipo y convertir entre tipos.',
    learn: ['Qué es una variable y cómo nombrarla', 'Tipos int, float, str y bool', 'type() para ver el tipo', 'Convertir con int(), float() y str()'],
    concept: [
      'Una variable es un nombre que guarda un valor: edad = 19. Puedes cambiar su valor después.',
      'Tipos básicos: int (enteros: 19), float (decimales: 8.7), str (texto: "Hola"), bool (True/False).',
      'type(x) te dice el tipo de x. Útil cuando algo falla y no sabes por qué.',
      'Convertir: int("19") → 19, float("8.5") → 8.5, str(19) → "19". input() siempre da str.',
      'Nombres: minúsculas y guion bajo (snake_case): horas_estudio. No pueden empezar con número ni tener espacios.',
    ],
    example: {
      title: 'Datos de un estudiante',
      pseint: code(`
Algoritmo Datos
    Definir nombre Como Caracter
    Definir edad Como Entero
    nombre <- "Israel"
    edad <- 19
    edad <- edad + 1
    Escribir nombre, " tendrá ", edad
FinAlgoritmo`),
      python: code(`
nombre = "Israel"
edad = 19
promedio = 8.7
estudia = True
print(type(edad))
edad = edad + 1
print(nombre, "tendrá", edad)`),
      steps: [
        { lines: [1, 2, 3, 4], text: 'Cuatro variables, cuatro tipos: str, int, float y bool. Python deduce el tipo solo; no hace falta "Definir".' },
        { lines: [5], text: "type(edad) muestra <class 'int'>." },
        { lines: [6], text: 'Se calcula edad + 1 con el valor actual (19) y se guarda: ahora edad = 20.' },
        { lines: [7], text: 'Muestra: Israel tendrá 20' },
      ],
    },
    guided: py({
      id: 'l5-variables-guided',
      title: 'Variables de una materia',
      prompt: 'Completa: guarda "Cálculo II" en materia y el entero 8 en creditos, para que se muestre:\n\nCálculo II tiene 8 créditos',
      starterCode: 'materia = ___\ncreditos = ___\nprint(materia, "tiene", creditos, "créditos")',
      solution: 'materia = "Cálculo II"\ncreditos = 8\nprint(materia, "tiene", creditos, "créditos")',
      tests: [
        { name: 'Muestra la frase', expectedStdout: 'Cálculo II tiene 8 créditos' },
        { name: 'creditos es un entero', assert: 'assert isinstance(creditos, int), "creditos debe ser un número entero (sin comillas)"' },
      ],
      hints: ['El texto va entre comillas; el número no.', 'materia = "Cálculo II"', 'creditos = 8 (sin comillas para que sea int).'],
      explanation: 'Con comillas es str; sin comillas, 8 es int. El tipo importa para poder hacer cuentas después.',
    }),
    bugfix: py({
      id: 'l5-variables-bugfix',
      title: 'Total de una compra',
      prompt: 'Lee el precio y la cantidad (ambos enteros) y muestra el total. Con 12 y 3 debería mostrar 36, pero falla. Corrígelo usando int().',
      starterCode: 'precio = input()\ncantidad = input()\nprint(precio * cantidad)',
      solution: 'precio = int(input())\ncantidad = int(input())\nprint(precio * cantidad)',
      usesInput: true,
      sampleInput: ['12', '3'],
      tests: [
        { name: 'Con 12 y 3', stdin: ['12', '3'], expectedStdout: '36' },
        { name: 'Con 5 y 0', stdin: ['5', '0'], expectedStdout: '0' },
      ],
      hints: ['¿Qué tipo tienen precio y cantidad? Prueba print(type(precio)).', 'No se pueden multiplicar dos textos.', 'Convierte ambos: int(input()).'],
      explanation: 'Dos str no se pueden multiplicar. Convertirlos a int resuelve el TypeError.',
    }),
    independent: py({
      id: 'l5-variables-independent',
      title: 'Edad en 2030',
      prompt: 'Lee un nombre y un año de nacimiento (entero). Muestra en dos líneas:\n\nHola Ana\nEn 2030 tendrás 25 años\n\n(con Ana y 2005 como entrada)',
      starterCode: '',
      solution: 'nombre = input()\nanio = int(input())\nprint("Hola", nombre)\nprint("En 2030 tendrás", 2030 - anio, "años")',
      usesInput: true,
      sampleInput: ['Ana', '2005'],
      tests: [
        { name: 'Con Ana y 2005', stdin: ['Ana', '2005'], expectedStdout: 'Hola Ana\nEn 2030 tendrás 25 años' },
        { name: 'Con Luis y 2010', stdin: ['Luis', '2010'], expectedStdout: 'Hola Luis\nEn 2030 tendrás 20 años' },
      ],
      hints: ['El nombre es texto (no necesita int); el año sí.', 'La edad es 2030 - año de nacimiento.', 'print("En 2030 tendrás", 2030 - anio, "años")'],
      explanation: 'Solo se convierte lo que se usará en cálculos. El nombre se queda como str.',
    }),
    retrieval: [
      q('l5-variables-q1', '¿De qué tipo es 3.0?', ['int', 'float', 'str', 'bool'], 1, 'Tiene punto decimal: es float, aunque valga lo mismo que 3.'),
      q('l5-variables-q2', '¿Qué muestra este código?', ['15', '"105"', '105', 'Error'], 3, 'No se puede sumar str ("10") con int (5): TypeError.', 'x = "10"\nprint(x + 5)'),
      q('l5-variables-q3', '¿Cuál es un nombre de variable válido en Python?', ['2nota', 'nota final', 'nota_final', 'nota-final'], 2, 'snake_case: letras, números y guion bajo, sin empezar con número.'),
    ],
    commonErrors: [
      { error: 'Olvidar convertir input()', why: 'input() siempre da texto.', fix: 'int(input()) o float(input()) para números.' },
      { error: 'Poner comillas a un número', why: '"8" es texto, no se puede usar en cálculos.', fix: 'Escribe 8 sin comillas.' },
      { error: 'Usar espacios o guiones en nombres', why: 'Python no lo permite.', fix: 'Usa guion bajo: horas_estudio.' },
    ],
    challenge: py({
      id: 'l5-variables-challenge',
      title: 'Mini-reto: Celsius a Fahrenheit',
      prompt: 'Lee una temperatura en grados Celsius (puede tener decimales) y muestra su equivalente en Fahrenheit: F = C × 9 / 5 + 32.\n\n100 → 212.0',
      starterCode: '',
      solution: 'c = float(input())\nprint(c * 9 / 5 + 32)',
      usesInput: true,
      sampleInput: ['100'],
      tests: [
        { name: 'Con 100', stdin: ['100'], expectedStdout: '212.0' },
        { name: 'Con 0', stdin: ['0'], expectedStdout: '32.0' },
        { name: 'Con -40', stdin: ['-40'], expectedStdout: '-40.0' },
      ],
      hints: ['La entrada puede tener decimales: ¿int o float?', 'float(input())', 'print(c * 9 / 5 + 32)'],
      explanation: 'float() acepta decimales; int() fallaría con "36.5".',
    }),
    feynman: {
      prompt: 'Explica qué es una variable, qué tipos de datos conoces y por qué hay que convertir lo que devuelve input().',
      keyIdeas: [
        { label: 'variable guarda un valor', keywords: ['guarda', 'almacena', 'nombre', 'valor'] },
        { label: 'tipos de datos', keywords: ['int', 'float', 'str', 'bool', 'entero', 'decimal', 'texto'] },
        { label: 'input da texto', keywords: ['input', 'texto', 'convertir', 'convierte'] },
      ],
    },
    mastery: MASTERY,
  },
  {
    id: 'l5-salida',
    levelId: 5,
    title: 'Salida con formato: f-strings y round()',
    objective: 'Mostrar resultados claros combinando texto y variables con f-strings.',
    learn: ['Crear f-strings: f"Hola {nombre}"', 'Mostrar decimales fijos con :.2f', 'Redondear con round()', 'Cuándo usar f-strings y cuándo comas en print'],
    concept: [
      'Una f-string es un texto con f antes de las comillas. Lo que pongas entre llaves {} se reemplaza por su valor: f"Tengo {edad} años".',
      'Dentro de las llaves puedes poner expresiones: f"Total: {precio * cantidad}".',
      'Para fijar decimales: f"{promedio:.2f}" muestra 2 decimales (8.666 → 8.67).',
      'round(x, 1) devuelve el número redondeado a 1 decimal, por si lo necesitas para seguir calculando.',
      'Ventaja frente a las comas: controlas exactamente los espacios y la puntuación.',
    ],
    example: {
      title: 'Un reporte de estudio',
      python: code(`
nombre = "Israel"
horas = 3
promedio = 8.666
print(f"{nombre} estudió {horas} horas")
print(f"Promedio: {promedio:.2f}")
print(round(promedio, 1))
print(f"En minutos: {horas * 60}")`),
      steps: [
        { lines: [4], text: 'La f antes de las comillas activa el reemplazo: Israel estudió 3 horas.' },
        { lines: [5], text: ':.2f indica "float con 2 decimales": Promedio: 8.67.' },
        { lines: [6], text: 'round(8.666, 1) = 8.7. Es un número, no texto.' },
        { lines: [7], text: 'Dentro de {} puede ir una operación: En minutos: 180.' },
      ],
    },
    guided: py({
      id: 'l5-salida-guided',
      title: 'Tu primera f-string',
      prompt: 'Completa la f-string para mostrar la materia y la calificación con 1 decimal:\n\nFísica II: 9.3',
      starterCode: 'materia = "Física II"\ncalificacion = 9.27\nprint(f"{materia}: {___}")',
      solution: 'materia = "Física II"\ncalificacion = 9.27\nprint(f"{materia}: {calificacion:.1f}")',
      tests: [{ name: 'Muestra Física II: 9.3', expectedStdout: 'Física II: 9.3' }],
      hints: ['Dentro de las llaves va la variable calificacion.', 'Para 1 decimal se agrega :.1f después del nombre.', '{calificacion:.1f}'],
      explanation: ':.1f redondea al mostrar, sin cambiar el valor guardado en la variable.',
    }),
    bugfix: py({
      id: 'l5-salida-bugfix',
      title: 'Las llaves no se reemplazan',
      prompt: 'Debería mostrar "Total: 150", pero muestra literalmente "Total: {total}". Corrígelo.',
      starterCode: 'total = 150\nprint("Total: {total}")',
      solution: 'total = 150\nprint(f"Total: {total}")',
      tests: [{ name: 'Muestra Total: 150', expectedStdout: 'Total: 150' }],
      hints: ['No hay error de Python: el texto se muestra tal cual.', '¿Qué letra activa el reemplazo de las llaves?', 'Agrega f antes de las comillas: f"Total: {total}"'],
      explanation: 'Sin la f, las llaves son caracteres normales.',
    }),
    independent: py({
      id: 'l5-salida-independent',
      title: 'Ticket de compra',
      prompt: 'Lee un producto (texto), su precio (decimal) y la cantidad (entero). Muestra:\n\n3 x Cuaderno = 76.50 pesos\n\n(con Cuaderno, 25.5 y 3). El total siempre con 2 decimales.',
      starterCode: '',
      solution: 'producto = input()\nprecio = float(input())\ncantidad = int(input())\ntotal = precio * cantidad\nprint(f"{cantidad} x {producto} = {total:.2f} pesos")',
      usesInput: true,
      sampleInput: ['Cuaderno', '25.5', '3'],
      tests: [
        { name: 'Cuaderno', stdin: ['Cuaderno', '25.5', '3'], expectedStdout: '3 x Cuaderno = 76.50 pesos' },
        { name: 'Pluma', stdin: ['Pluma', '12', '1'], expectedStdout: '1 x Pluma = 12.00 pesos' },
      ],
      hints: ['Tres input(): el primero queda como texto, el segundo float, el tercero int.', 'Calcula total = precio * cantidad.', 'print(f"{cantidad} x {producto} = {total:.2f} pesos")'],
      explanation: 'Leer → convertir → calcular → mostrar con formato. :.2f garantiza siempre dos decimales.',
    }),
    retrieval: [
      q('l5-salida-q1', '¿Qué muestra este código?', ['Hola {n}', 'Hola Ana', 'Hola n', 'Error'], 0, 'Sin la f, las llaves no se reemplazan.', 'n = "Ana"\nprint("Hola {n}")'),
      q('l5-salida-q2', '¿Qué muestra f"{2/3:.2f}"?', ['0.6', '0.66', '0.67', '0.666'], 2, ':.2f redondea a 2 decimales: 0.67.'),
      q('l5-salida-q3', '¿Qué muestra este código?', ['8', '10', '2 * 5', '{x * 2}'], 1, 'Dentro de las llaves se evalúa la expresión: 5 * 2 = 10.', 'x = 5\nprint(f"{x * 2}")'),
    ],
    commonErrors: [
      { error: 'Olvidar la f', why: 'Las llaves se muestran literalmente.', fix: 'f"..."' },
      { error: 'Usar :.2f con texto', why: 'El formato .2f es solo para números.', fix: 'Convierte a float antes.' },
      { error: 'Confundir round() con :.2f', why: 'round cambia el número; :.2f solo cambia cómo se muestra.', fix: 'Para mostrar, prefiere :.2f.' },
    ],
    challenge: py({
      id: 'l5-salida-challenge',
      title: 'Mini-reto: promedio de 3 calificaciones',
      prompt: 'Lee 3 calificaciones (pueden tener decimales) y muestra su promedio con 2 decimales:\n\nPromedio: 8.67\n\n(con 8, 9 y 9)',
      starterCode: '',
      solution: 'a = float(input())\nb = float(input())\nc = float(input())\nprint(f"Promedio: {(a + b + c) / 3:.2f}")',
      usesInput: true,
      sampleInput: ['8', '9', '9'],
      tests: [
        { name: 'Con 8, 9 y 9', stdin: ['8', '9', '9'], expectedStdout: 'Promedio: 8.67' },
        { name: 'Con 10, 10 y 10', stdin: ['10', '10', '10'], expectedStdout: 'Promedio: 10.00' },
      ],
      hints: ['Lee y convierte cada calificación con float().', 'Promedio = suma / 3. Recuerda los paréntesis.', 'f"Promedio: {(a + b + c) / 3:.2f}"'],
      explanation: 'Juntas las tres habilidades: leer y convertir, calcular con paréntesis y mostrar con formato.',
    }),
    feynman: {
      prompt: 'Explica qué es una f-string, para qué sirven las llaves y qué hace :.2f.',
      keyIdeas: [
        { label: 'f antes de las comillas', keywords: ['f antes', 'letra f', 'f-string', 'fstring', 'f"'] },
        { label: 'llaves reemplazan valores', keywords: ['llaves', '{}', 'reemplaza', 'valor', 'variable'] },
        { label: 'decimales', keywords: ['decimal', 'decimales', '.2f'] },
      ],
    },
    mastery: MASTERY,
  },
];

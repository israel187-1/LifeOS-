import type { Lesson } from '../../domain/types';
import { MASTERY, code, py, q } from '../helpers';

export const level4: Lesson[] = [
  {
    id: 'l4-operadores',
    levelId: 4,
    title: 'Operadores aritméticos y expresiones',
    objective: 'Usar + - * / // % ** y predecir el resultado de una expresión.',
    learn: ['Los 7 operadores aritméticos de Python', 'Diferencia entre / y //', 'El residuo con % y para qué sirve', 'Orden de evaluación (precedencia)'],
    concept: [
      '+ suma, - resta, * multiplica, / divide (siempre da decimal: 6 / 2 = 3.0).',
      '// es división entera: descarta los decimales (7 // 2 = 3). % es el residuo (7 % 2 = 1). ** es potencia (2 ** 3 = 8).',
      '% sirve para mucho: saber si un número es par (n % 2 == 0), obtener el último dígito (n % 10) o convertir minutos a horas y minutos.',
      'Orden: primero paréntesis, luego **, luego * / // %, y al final + -. Ante la duda, usa paréntesis.',
      'Cuidado si vienes de PSeInt: allá ^ es potencia; en Python ^ es otra cosa. Usa **.',
    ],
    example: {
      title: 'Todos los operadores',
      pseint: code(`
Algoritmo Operadores
    Escribir 7 / 2
    Escribir trunc(7 / 2)
    Escribir 7 MOD 2
    Escribir 2 ^ 3
FinAlgoritmo`),
      python: code(`
print(7 + 2)
print(7 / 2)
print(7 // 2)
print(7 % 2)
print(2 ** 3)
print(2 + 3 * 4)
print((2 + 3) * 4)`),
      steps: [
        { lines: [1], text: 'Suma normal: 9.' },
        { lines: [2], text: '/ siempre da decimal: 3.5.' },
        { lines: [3], text: '// división entera: cuántas veces cabe 2 en 7 → 3. (En PSeInt: trunc(7/2)).' },
        { lines: [4], text: '% residuo: 7 = 2·3 + 1 → 1. (En PSeInt: MOD).' },
        { lines: [5], text: '** potencia: 2 × 2 × 2 = 8. (En PSeInt: ^).' },
        { lines: [6, 7], text: 'Precedencia: 3 * 4 se hace primero → 14. Con paréntesis, la suma va primero → 20.' },
      ],
    },
    guided: py({
      id: 'l4-operadores-guided',
      title: 'División entera y residuo',
      prompt: 'Completa los operadores para mostrar primero la división entera de 17 entre 5 y después el residuo.\n\nSalida esperada:\n3\n2',
      starterCode: 'print(17 ___ 5)\nprint(17 ___ 5)',
      solution: 'print(17 // 5)\nprint(17 % 5)',
      tests: [{ name: 'Muestra 3 y 2', expectedStdout: '3\n2' }],
      hints: ['17 = 5 × 3 + 2. El 3 es la división entera y el 2 el residuo.', 'División entera: //. Residuo: %.', 'print(17 // 5) y print(17 % 5)'],
      explanation: '// da cuántas veces cabe, % da lo que sobra.',
    }),
    bugfix: py({
      id: 'l4-operadores-bugfix',
      title: 'La potencia de PSeInt',
      prompt: 'Queremos mostrar 2 elevado a la 10 (1024), pero este programa muestra 8. Corrígelo.',
      starterCode: 'print(2 ^ 10)',
      solution: 'print(2 ** 10)',
      tests: [{ name: 'Muestra 1024', expectedStdout: '1024' }],
      hints: ['No hay error de Python: ^ existe, pero no es potencia.', 'En Python la potencia se escribe con dos asteriscos.', 'print(2 ** 10)'],
      explanation: 'En Python ^ es una operación con bits (XOR). La potencia es **.',
    }),
    independent: py({
      id: 'l4-operadores-independent',
      title: 'Minutos a horas',
      prompt: 'Lee una cantidad de minutos (entero) y muestra cuántas horas completas y minutos sobrantes son, con este formato:\n\n125 → 2 h 5 min',
      starterCode: 'minutos = int(input())\n',
      solution: 'minutos = int(input())\nprint(minutos // 60, "h", minutos % 60, "min")',
      usesInput: true,
      sampleInput: ['125'],
      tests: [
        { name: 'Con 125', stdin: ['125'], expectedStdout: '2 h 5 min' },
        { name: 'Con 60', stdin: ['60'], expectedStdout: '1 h 0 min' },
        { name: 'Con 59', stdin: ['59'], expectedStdout: '0 h 59 min' },
        { name: 'Con 0', stdin: ['0'], expectedStdout: '0 h 0 min' },
      ],
      hints: ['Una hora = 60 minutos. ¿Cuántas veces cabe 60 en los minutos?', 'Las horas son minutos // 60 y lo que sobra es minutos % 60.', 'print(minutos // 60, "h", minutos % 60, "min")'],
      explanation: '// y % juntos descomponen una cantidad en unidades grandes y sobrantes.',
    }),
    retrieval: [
      q('l4-operadores-q1', '¿Qué muestra print(10 / 2)?', ['5', '5.0', '2', 'Error'], 1, '/ siempre devuelve un número decimal (float).'),
      q('l4-operadores-q2', '¿Qué muestra este código?', ['2', '3', '1', '0'], 2, '10 = 3·3 + 1. El residuo es 1.', 'print(10 % 3)'),
      q('l4-operadores-q3', '¿Cómo sabes si un número n es par?', ['n / 2 == 0', 'n % 2 == 0', 'n // 2 == 1', 'n ** 2 == 0'], 1, 'Un número es par si al dividirlo entre 2 el residuo es 0.'),
    ],
    commonErrors: [
      { error: 'Usar ^ para potencia', why: 'En Python ^ no es potencia.', fix: 'Usa **.' },
      { error: 'Esperar un entero de /', why: '/ siempre da float.', fix: 'Usa // si necesitas división entera.' },
      { error: 'Olvidar la precedencia', why: '* y / van antes que + y -.', fix: 'Usa paréntesis.' },
    ],
    challenge: py({
      id: 'l4-operadores-challenge',
      title: 'Mini-reto: suma de dígitos',
      prompt: 'Lee un número entero de 3 dígitos y muestra la suma de sus dígitos. Ejemplo: 472 → 13.\nPista: usa // y %, no conviertas a texto.',
      starterCode: 'n = int(input())\n',
      solution: 'n = int(input())\ncentenas = n // 100\ndecenas = n // 10 % 10\nunidades = n % 10\nprint(centenas + decenas + unidades)',
      usesInput: true,
      sampleInput: ['472'],
      tests: [
        { name: 'Con 472', stdin: ['472'], expectedStdout: '13' },
        { name: 'Con 100', stdin: ['100'], expectedStdout: '1' },
        { name: 'Con 999', stdin: ['999'], expectedStdout: '27' },
      ],
      hints: ['n % 10 da el último dígito.', 'n // 100 da el primer dígito.', 'El dígito del medio: n // 10 % 10.'],
      explanation: '% 10 extrae el último dígito y // 10 lo elimina. Combinándolos se obtiene cualquier dígito.',
    }),
    feynman: {
      prompt: 'Explica la diferencia entre /, // y %, con un ejemplo de la vida real (por ejemplo, repartir objetos).',
      keyIdeas: [
        { label: '/ da decimal', keywords: ['decimal', 'float', 'exacta'] },
        { label: '// cuántas veces cabe', keywords: ['entera', 'cabe', 'completas', 'sin decimales'] },
        { label: '% lo que sobra', keywords: ['residuo', 'sobra', 'resto', 'sobrante'] },
      ],
    },
    mastery: MASTERY,
  },
];

import type { PyError } from './harness';

export interface ErrorExplanation {
  title: string;
  explanation: string;
  tip: string;
}

/** Translates Python errors into short, beginner-friendly Spanish explanations. */
export function explainError(err: PyError): ErrorExplanation {
  const m = err.message;
  const at = err.line ? ` (línea ${err.line})` : '';
  switch (err.type) {
    case 'Timeout':
    case 'TimeoutError':
      return {
        title: 'El programa no terminó',
        explanation: `${m}. Lo más común es un bucle que nunca se detiene.`,
        tip: 'Revisa que la condición del while llegue a ser falsa: ¿cambias la variable dentro del bucle?',
      };
    case 'SyntaxError':
      if (/was never closed|unexpected EOF|'\(' was never closed/.test(m))
        return { title: `Falta cerrar algo${at}`, explanation: 'Abriste un paréntesis, corchete o comilla y no lo cerraste.', tip: 'Cuenta: cada ( necesita su ) y cada comilla su pareja.' };
      if (/unterminated string|EOL while scanning/.test(m))
        return { title: `Texto sin cerrar${at}`, explanation: 'Un texto empezó con comillas pero no terminó con la misma comilla.', tip: 'Usa "..." o \'...\' pero no las mezcles en el mismo texto.' };
      if (/expected ':'/.test(m))
        return { title: `Faltan los dos puntos${at}`, explanation: 'Las líneas con if, elif, else, while, for y def terminan con ":".', tip: 'Agrega ":" al final de esa línea.' };
      if (/Missing parentheses in call to 'print'/.test(m))
        return { title: `print necesita paréntesis${at}`, explanation: 'En Python 3, print es una función: print("hola").', tip: 'Escribe print(...) con paréntesis.' };
      if (/'=' .*maybe you meant '=='|cannot assign to/.test(m))
        return { title: `¿Querías comparar?${at}`, explanation: '"=" guarda un valor; "==" compara dos valores.', tip: 'Dentro de un if o while usa "==" para comparar.' };
      return { title: `Error de sintaxis${at}`, explanation: `Python no entiende cómo está escrita esa línea (${m}).`, tip: 'Revisa paréntesis, comillas, dos puntos y operadores en esa línea y la anterior.' };
    case 'IndentationError':
    case 'TabError':
      if (/expected an indented block/.test(m))
        return { title: `Falta sangría${at}`, explanation: 'Después de una línea que termina en ":" el bloque debe ir con sangría (4 espacios).', tip: 'Agrega 4 espacios al inicio de las líneas que pertenecen al bloque.' };
      if (/unexpected indent/.test(m))
        return { title: `Sangría inesperada${at}`, explanation: 'Esta línea tiene espacios al inicio, pero no pertenece a ningún bloque.', tip: 'Quita los espacios del inicio de esa línea.' };
      return { title: `Sangría inconsistente${at}`, explanation: 'Las líneas de un mismo bloque deben tener exactamente la misma sangría.', tip: 'Usa siempre 4 espacios por nivel.' };
    case 'NameError': {
      const name = /name '(.+?)' is not defined/.exec(m)?.[1] ?? '';
      const lower = name.toLowerCase();
      if (name !== lower && ['print', 'input', 'int', 'float', 'str', 'len', 'range', 'true', 'false', 'none'].includes(lower))
        return { title: `Mayúsculas y minúsculas${at}`, explanation: `Python distingue mayúsculas: "${name}" no es lo mismo que "${lower}".`, tip: lower === 'true' || lower === 'false' ? 'Los booleanos se escriben True y False.' : `Escribe "${lower}".` };
      return { title: `"${name}" no existe${at}`, explanation: `Usaste "${name}" pero Python no lo conoce: no es una variable creada antes ni una función de Python.`, tip: '¿Olvidaste las comillas si era texto? ¿Lo escribiste distinto al crearlo? ¿Lo creaste antes de usarlo?' };
    }
    case 'TypeError':
      if (/can only concatenate str|unsupported operand type\(s\) for \+: 'int' and 'str'|must be str, not int/.test(m))
        return { title: `Mezclaste texto y número${at}`, explanation: 'No se puede sumar un texto (str) con un número (int) directamente.', tip: 'Convierte: int(texto) para hacer cuentas, o str(numero) / f-strings para mostrar.' };
      if (/not supported between instances of 'str' and 'int'|'int' and 'str'/.test(m))
        return { title: `Comparaste texto con número${at}`, explanation: 'input() siempre devuelve texto. Para comparar con números conviértelo primero.', tip: 'Usa int(input()) o float(input()).' };
      if (/missing \d+ required positional argument|takes \d+ positional argument/.test(m))
        return { title: `Número de argumentos incorrecto${at}`, explanation: m, tip: 'Revisa cuántos valores recibe la función y cuántos le pasas.' };
      if (/object is not callable/.test(m))
        return { title: `Eso no es una función${at}`, explanation: m, tip: '¿Usaste como variable un nombre de función (por ejemplo print = ...)? ¿Sobran paréntesis?' };
      return { title: `Tipo de dato incorrecto${at}`, explanation: m, tip: 'Usa type(variable) para ver qué tipo tiene cada valor.' };
    case 'ValueError':
      if (/invalid literal for int\(\)|could not convert string to float/.test(m))
        return { title: `No se pudo convertir a número${at}`, explanation: `El texto recibido no es un número válido (${m}).`, tip: 'Revisa el dato de entrada. Recuerda: int("3.5") falla; usa float para decimales.' };
      return { title: `Valor no válido${at}`, explanation: m, tip: 'El tipo es correcto pero el valor no tiene sentido para esa operación.' };
    case 'ZeroDivisionError':
      return { title: `División entre cero${at}`, explanation: 'Ningún número se puede dividir entre 0.', tip: 'Antes de dividir, verifica con un if que el divisor no sea 0.' };
    case 'EOFError':
      return { title: `Faltan datos de entrada${at}`, explanation: 'Tu programa llamó a input() más veces de las esperadas.', tip: 'Revisa cuántos input() usas. En "Ejecutar" escribe un dato por línea en la caja de entrada.' };
    case 'IndexError':
      return { title: `Posición fuera de rango${at}`, explanation: m, tip: 'Las posiciones empiezan en 0; la última es len(lista) - 1.' };
    case 'KeyError':
      return { title: `Clave inexistente${at}`, explanation: `La clave ${m} no está en el diccionario.`, tip: 'Usa "clave in dic" o dic.get(clave) para revisar antes.' };
    case 'AttributeError':
      return { title: `Método o atributo inexistente${at}`, explanation: m, tip: 'Revisa el nombre del método y el tipo del objeto.' };
    case 'RecursionError':
      return { title: `Recursión infinita${at}`, explanation: 'Una función se llama a sí misma sin parar.', tip: 'Asegúrate de tener un caso base que termine.' };
    case 'AssertionError':
      if (err.inTest)
        return { title: 'Una prueba no pasó', explanation: m || 'El resultado de tu función no es el esperado.', tip: 'Prueba tu función con ese caso y compara con lo esperado.' };
      return { title: `Falló un assert${at}`, explanation: m, tip: 'La condición del assert resultó falsa.' };
    case 'RuntimeError':
      return { title: `Error durante la ejecución${at}`, explanation: m, tip: 'Revisa si hay un bucle que imprime sin parar.' };
    default:
      return { title: `${err.type}${at}`, explanation: m, tip: 'Lee el mensaje con calma e identifica la línea indicada.' };
  }
}

import type { Level } from '../domain/types';

export const LEVELS: Level[] = [
  { id: 1, title: 'Manejo básico del entorno', description: 'Escribir, ejecutar y leer la salida y los errores de un programa.', topics: ['print()', 'ejecutar código', 'leer errores'] },
  { id: 2, title: 'Pensamiento computacional y lógica', description: 'Descomponer problemas y razonar con verdadero/falso.', topics: ['entrada-proceso-salida', 'algoritmos', 'and / or / not'] },
  { id: 3, title: 'Algoritmos, pseudocódigo y diagramas', description: 'Usar PSeInt como puente hacia Python y hacer pruebas de escritorio.', topics: ['PSeInt → Python', 'diagramas de flujo', 'pruebas de escritorio'] },
  { id: 4, title: 'Fundamentos de Python', description: 'Operadores y expresiones.', topics: ['+ - * /', '// y %', 'precedencia'] },
  { id: 5, title: 'Variables, tipos, entrada y salida', description: 'Guardar datos, convertir tipos y mostrar resultados con formato.', topics: ['int, float, str, bool', 'input()', 'f-strings'] },
  { id: 6, title: 'Condicionales', description: 'Tomar decisiones en el código.', topics: ['if / else', 'elif', 'condiciones compuestas'] },
  { id: 7, title: 'Bucles', description: 'Repetir instrucciones de forma controlada.', topics: ['while', 'for y range()', 'contadores y acumuladores'] },
  { id: 8, title: 'Funciones y modularización', description: 'Dividir programas en piezas reutilizables.', topics: ['def', 'parámetros', 'return'] },
  { id: 9, title: 'Listas, diccionarios y estructuras básicas', description: 'Guardar y recorrer colecciones de datos.', topics: ['listas', 'diccionarios', 'tuplas'] },
  { id: 10, title: 'Resolución de problemas y depuración', description: 'Estrategias para problemas nuevos y para encontrar errores.', topics: ['casos de prueba', 'depuración con print', 'descomposición'] },
  { id: 11, title: 'Programación orientada a objetos', description: 'Clases, objetos y métodos.', topics: ['class', 'atributos', 'métodos'] },
  { id: 12, title: 'Archivos, módulos y manejo de errores', description: 'Leer y escribir archivos y controlar errores.', topics: ['open()', 'import', 'try / except'] },
  { id: 13, title: 'Git y GitHub', description: 'Control de versiones y publicación de proyectos.', topics: ['commit', 'branch', 'pull request'] },
  { id: 14, title: 'SQL y bases de datos', description: 'Guardar y consultar datos de forma estructurada.', topics: ['SELECT', 'tablas', 'SQLite'] },
  { id: 15, title: 'Desarrollo backend y APIs', description: 'Crear servicios que otras aplicaciones puedan usar.', topics: ['HTTP', 'JSON', 'APIs REST'] },
  { id: 16, title: 'Proyectos de portafolio', description: 'Proyectos completos para mostrar tus habilidades.', topics: ['planificación', 'pruebas', 'documentación'] },
];

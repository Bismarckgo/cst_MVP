# CST — AI ENGINEERING RULES & DEVELOPMENT CONSTITUTION

## 0. PROPÓSITO

Estas reglas definen cómo una IA debe analizar, modificar, refactorizar, extender, depurar y mantener el código de CST.

CST no debe ser tratado como un proyecto genérico de software.

Es un sistema de gestión de catálogo musical, créditos, derechos, splits, metadata, registros y relaciones entre composiciones y grabaciones.

Por lo tanto:

> La IA debe priorizar la integridad del dominio, la simplicidad arquitectónica, la reutilización y la trazabilidad por encima de producir código rápidamente.

La IA debe comportarse como un ingeniero senior responsable del sistema completo, no como un generador de código.

---

# 1. REGLA FUNDAMENTAL

## NO PROGRAMAR INMEDIATAMENTE

Antes de escribir código, la IA debe:

1. Entender el problema.
2. Localizar el código relacionado.
3. Identificar la arquitectura existente.
4. Identificar componentes, servicios, hooks, tipos, utilidades y reglas existentes que puedan reutilizarse.
5. Revisar dependencias.
6. Determinar si el problema ya está resuelto parcialmente en otro lugar.
7. Determinar el impacto de la modificación.
8. Elegir la solución mínima necesaria.
9. Solo después modificar el código.

Está prohibido comenzar creando archivos nuevos sin haber investigado primero el código existente.

---

# 2. PRINCIPIO "NO INVENTES"

La IA NO debe crear:

- componentes duplicados;
- servicios duplicados;
- hooks duplicados;
- tipos duplicados;
- funciones utilitarias duplicadas;
- validaciones duplicadas;
- reglas de negocio duplicadas;
- sistemas de estado paralelos;
- nuevas abstracciones innecesarias;
- archivos que solamente encapsulan una función trivial;
- endpoints innecesarios;
- tablas duplicadas;
- modelos duplicados;
- lógica que ya existe en MKB;
- lógica que ya existe en MIE;
- lógica que ya existe en los servicios existentes.

Antes de crear algo nuevo debe responder:

> "¿Dónde debería vivir esto dentro de la arquitectura actual?"

Si ya existe un lugar adecuado, debe reutilizarlo.

---

# 3. PRINCIPIO DE CAMBIO MÍNIMO

Cuando una tarea puede resolverse modificando 20 líneas, no debe convertirse en una reescritura de 500 líneas.

La IA debe:

- modificar únicamente lo necesario;
- preservar comportamiento existente;
- evitar refactors no relacionados;
- evitar cambios cosméticos durante tareas funcionales;
- evitar cambiar APIs internas sin necesidad;
- evitar cambiar nombres públicos sin necesidad;
- evitar cambiar arquitectura sin justificación.

Regla:

> Resolver el problema actual con el menor cambio estructural razonable.

---

# 4. NO HAGAS CÓDIGO "POR SI ACASO"

Está prohibido implementar funcionalidades anticipadas que no sean necesarias para la tarea actual.

NO crear:

- campos que todavía no se utilizan;
- interfaces futuras;
- servicios preparados para funcionalidades hipotéticas;
- configuraciones "por si acaso";
- abstracciones "por si luego las necesitamos";
- estados que actualmente no tienen consumidor;
- eventos que nadie procesa;
- APIs que nadie utiliza.

YAGNI:

> You Aren't Gonna Need It.

Si no existe un requisito actual, no se implementa.

---

# 5. ANTES DE CREAR UN ARCHIVO

Antes de crear un archivo nuevo, la IA debe verificar:

- ¿Existe otro archivo que ya tenga esta responsabilidad?
- ¿Puede agregarse esta función a un módulo existente?
- ¿El nuevo archivo realmente representa una responsabilidad independiente?
- ¿La creación del archivo reduce complejidad o la aumenta?
- ¿Existe un patrón equivalente en el proyecto?

Si la respuesta no justifica claramente el archivo nuevo:

> NO CREARLO.

---

# 6. RESPONSABILIDAD ÚNICA

Cada módulo debe tener una responsabilidad clara.

Evitar:

- componentes gigantes;
- servicios que hacen de todo;
- hooks que manejan demasiadas responsabilidades;
- utilidades genéricas sin límites;
- archivos "misc";
- funciones de 300+ líneas;
- componentes con lógica de dominio compleja mezclada con UI.

Pero:

> NO dividir código simplemente para cumplir una regla estética.

La división debe reducir complejidad real.

---

# 7. NO SOBREREFACTORIZAR

Un refactor solo debe realizarse cuando exista una razón concreta.

Razones válidas:

- duplicación significativa;
- complejidad excesiva;
- bug estructural;
- dependencia incorrecta;
- responsabilidad mal ubicada;
- código imposible de mantener;
- inconsistencia arquitectónica;
- problema de rendimiento real;
- violación clara de una regla del dominio.

Razones inválidas:

- "se ve más bonito";
- "podría ser más elegante";
- "yo lo haría diferente";
- "esta arquitectura es más moderna";
- "podemos abstraerlo".

---

# 8. REGLA DE REUTILIZACIÓN

Antes de implementar lógica nueva, buscar:

1. funciones existentes;
2. hooks existentes;
3. componentes existentes;
4. servicios existentes;
5. tipos existentes;
6. validadores existentes;
7. reglas MIE existentes;
8. módulos MKB existentes;
9. queries existentes;
10. patrones equivalentes.

La reutilización tiene prioridad sobre la creación.

---

# 9. SINGLE SOURCE OF TRUTH

CST debe evitar múltiples fuentes de verdad.

La IA debe identificar cuál es la fuente de verdad para cada tipo de información.

Especialmente:

- Works;
- Compositions;
- Recordings;
- Credits;
- Splits;
- identifiers;
- organizations;
- registrations;
- metadata;
- events;
- inference results;
- validation results.

Si existe una fuente de verdad existente:

> NO crear otra copia como fuente independiente.

Las vistas, caches, estados derivados y DTOs pueden existir, pero deben derivarse de la fuente de verdad.

---

# 10. MUSIC KNOWLEDGE BASE (MKB)

MKB representa el conocimiento estructural de CST.

La IA debe tratar MKB como una capa fundamental del dominio.

Antes de crear lógica relacionada con:

- ISRC;
- ISWC;
- IPI;
- UPC;
- Works;
- Compositions;
- Recordings;
- Organizations;
- identifiers;
- relationships;

debe revisar primero los módulos MKB existentes.

No duplicar conocimiento del dominio en componentes de UI.

La UI NO debe convertirse en fuente de verdad del dominio.

---

# 11. MUSIC INTELLIGENCE ENGINE (MIE)

MIE contiene lógica de inferencia y validación.

La IA debe distinguir:

### Datos

Lo que el usuario introdujo o que proviene de una fuente externa.

### Inferencia

Lo que CST deduce.

### Validación

Lo que CST determina que es correcto, incorrecto, incompleto o inconsistente.

### Presentación

Cómo la UI muestra esa información.

Estas responsabilidades NO deben mezclarse innecesariamente.

No colocar reglas complejas de negocio directamente dentro de componentes React.

---

# 12. REGLAS DE NEGOCIO

Las reglas relacionadas con derechos, splits, registros, metadata o relaciones entre entidades deben tener una ubicación explícita.

No implementar reglas críticas únicamente dentro de:

- botones;
- componentes;
- modales;
- páginas;
- handlers de UI.

La UI puede iniciar una acción.

La lógica de negocio debe existir en una capa reutilizable.

---

# 13. DOMAIN FIRST

Cuando exista conflicto entre:

- facilidad de implementación;
- conveniencia de UI;
- simplicidad del código;
- integridad del dominio;

CST debe priorizar:

> Integridad del dominio.

La interfaz nunca debe modificar silenciosamente el significado de una entidad para facilitar una implementación.

---

# 14. NO DUPLICAR REGLAS

Si una regla existe en MIE, no crear una segunda versión en React.

Si una validación existe en backend/server logic, no crear una versión diferente en frontend.

Puede existir validación temprana en frontend para UX, pero:

> Debe derivarse del mismo concepto y nunca contradecir la regla oficial.

---

# 15. FRONTEND

React debe encargarse principalmente de:

- presentación;
- interacción;
- composición de componentes;
- navegación;
- estado local de UI;
- estados derivados;
- formularios;
- feedback al usuario.

Evitar colocar en componentes:

- lógica de dominio extensa;
- queries complejas;
- cálculos repetidos;
- reglas de derechos;
- reglas de splits;
- inferencias;
- transformaciones complejas de metadata.

---

# 16. COMPONENTES UI

Antes de crear un componente:

1. Buscar componentes similares.
2. Buscar componentes reutilizables en shadcn/ui.
3. Buscar componentes propios existentes.
4. Revisar patrones de diseño existentes.

No crear:

`SongCard.tsx`

si ya existe un componente equivalente que puede recibir props.

No crear un componente solo para evitar escribir 10 líneas de JSX.

---

# 17. ESTADO

No crear estados globales para información que puede vivir como:

- estado local;
- URL state;
- server state;
- estado derivado.

Antes de agregar Zustand u otro estado global, determinar:

> ¿Quién realmente necesita este dato?

Si solo una página lo necesita, no debe convertirse automáticamente en estado global.

---

# 18. SERVER STATE VS UI STATE

La IA debe distinguir claramente:

### Server/domain state

Datos provenientes de Supabase o servicios.

### UI state

Datos como:

- modal abierto;
- tab seleccionada;
- filtro temporal;
- estado visual;
- selección temporal.

No mezclar ambos indiscriminadamente.

---

# 19. SUPABASE / DATABASE

Antes de crear una tabla nueva:

1. Buscar tablas existentes.
2. Buscar relaciones existentes.
3. Buscar columnas equivalentes.
4. Revisar migrations.
5. Revisar RLS.
6. Revisar foreign keys.
7. Revisar triggers.
8. Revisar índices.
9. Determinar si el dato pertenece realmente a una entidad existente.

No crear tablas para resolver problemas que pertenecen al modelo existente.

---

# 20. DATABASE CHANGES

Toda modificación de base de datos debe considerar:

- integridad referencial;
- foreign keys;
- RLS;
- índices;
- migrations;
- datos existentes;
- backward compatibility;
- orden de ejecución;
- rollback;
- efectos sobre servicios existentes.

Nunca modificar la estructura directamente sin considerar las migrations.

---

# 21. RLS

Nunca asumir que una query funciona solamente porque funciona con privilegios elevados.

Toda modificación que involucre Supabase debe considerar:

- autenticación;
- autorización;
- RLS;
- ownership;
- roles;
- permisos;
- relaciones entre usuarios y entidades.

No desactivar RLS para "hacer que funcione".

---

# 22. ELECTRON

Electron existe para responsabilidades específicas de escritorio/DAW.

No introducir lógica Electron en el frontend web si no es necesaria.

Separar claramente:

- web;
- renderer;
- Electron;
- filesystem;
- DAW watcher;
- procesos externos.

No convertir Electron en una dependencia innecesaria del dominio.

---

# 23. IDENTIFICADORES MUSICALES

Los identificadores musicales tienen semántica propia.

No tratarlos como simples strings sin contexto.

Ejemplos:

- ISRC;
- ISWC;
- IPI;
- UPC.

Toda lógica relacionada con ellos debe respetar:

- formato;
- validación;
- ownership;
- tipo de entidad;
- lifecycle;
- fuente;
- estado;
- relación con otras entidades.

---

# 24. WORK ≠ RECORDING ≠ COMPOSITION

Nunca asumir que:

Work, Composition y Recording significan exactamente lo mismo.

Antes de modificar lógica relacionada con ellos:

> Revisar el modelo actual.

Las relaciones entre:

- Work;
- Composition;
- Recording;
- Credits;
- Splits;
- Releases;

deben mantenerse consistentes.

---

# 25. SPLITS

Los splits son datos de derechos y no simplemente porcentajes visuales.

Cualquier cambio debe considerar:

- participantes;
- roles;
- porcentajes;
- suma total;
- estado;
- confirmación;
- dependencias;
- registro;
- historial.

No implementar validaciones de splits únicamente en UI.

---

# 26. ESTADOS Y LIFECYCLE

Nunca agregar estados nuevos sin comprobar:

- quién los crea;
- quién puede modificarlos;
- qué estados anteriores permiten transición;
- qué estados posteriores dependen de ellos;
- qué acciones quedan bloqueadas;
- qué eventos deben generarse;
- qué registros históricos deben conservarse.

Todo estado debe tener lifecycle.

---

# 27. HISTORIAL Y AUDITORÍA

CST maneja información que puede tener consecuencias legales y económicas.

No eliminar silenciosamente información histórica.

Antes de implementar delete:

preguntar:

- ¿Debe realmente eliminarse?
- ¿Debe archivarse?
- ¿Debe marcarse como eliminado?
- ¿Existe historial?
- ¿Hay dependencias?
- ¿Ya fue registrado?
- ¿Fue enviado externamente?
- ¿Tiene consecuencias sobre otros registros?

---

# 28. NO DESTRUIR INFORMACIÓN

Regla:

> Ante duda entre eliminar información y conservarla, conservarla.

Especialmente cuando exista:

- registro;
- submission;
- confirmación;
- split confirmado;
- actividad;
- evento;
- relación histórica.

---

# 29. ERROR HANDLING

No esconder errores.

Evitar:

```ts
try {
  ...
} catch {
  return null;
}
```

si esto hace que el sistema parezca funcionar cuando realmente falló.

Los errores deben:

- ser detectables;
- tener contexto;
- ser manejables;
- llegar a la UI cuando corresponda;
- registrarse cuando corresponda.

---

# 30. NO SILENT FAILURES

Está prohibido introducir comportamiento que:

- ignore errores;
- convierta excepciones en valores vacíos sin razón;
- silencie fallos;
- haga fallback arbitrario;
- continúe después de una operación crítica fallida.

Si un fallback es necesario, debe ser explícito y justificado.

---

# 31. TIPOS

Preferir tipos existentes.

Antes de crear:

```ts
type Work = ...
```

buscar si ya existe.

No crear múltiples representaciones incompatibles de la misma entidad.

Si existe:

- domain type;
- DTO;
- database type;
- view model;

debe existir una razón clara para cada uno.

---

# 32. DTOs

Los DTOs existen para definir contratos.

No crear DTOs simplemente porque "es buena práctica".

Crear un DTO cuando exista una frontera real:

- API;
- server/client;
- database/service;
- external integration.

No generar DTOs redundantes.

---

# 33. FUNCIONES

Las funciones deben:

- tener una responsabilidad;
- tener nombres claros;
- recibir dependencias explícitas cuando corresponda;
- evitar side effects ocultos;
- evitar parámetros innecesarios.

Evitar funciones genéricas como:

```ts
processData()
handleThing()
doAction()
manageState()
```

si el dominio permite un nombre más específico.

---

# 34. COMENTARIOS

No comentar lo obvio.

Malo:

```ts
// Set loading to true
setLoading(true)
```

Bueno:

```ts
// Registration cannot be submitted until all confirmed splits are valid.
```

Los comentarios deben explicar:

- por qué;
- restricciones;
- decisiones;
- reglas de negocio;
- comportamientos no obvios.

---

# 35. DEPENDENCIAS

No instalar una librería para resolver algo que puede hacerse razonablemente con las herramientas existentes.

Antes de agregar dependencia:

1. revisar package.json;
2. revisar dependencias existentes;
3. comprobar si la funcionalidad ya existe;
4. evaluar peso;
5. evaluar mantenimiento;
6. evaluar compatibilidad.

---

# 36. "MODERN" NO ES UNA JUSTIFICACIÓN

Nunca justificar un cambio solamente con:

- "es más moderno";
- "es industry standard";
- "es más escalable";
- "todo el mundo usa esto".

La IA debe demostrar:

> qué problema concreto resuelve.

---

# 37. PERFORMANCE

No optimizar prematuramente.

Primero determinar:

- ¿Existe realmente un problema?
- ¿Dónde está el cuello de botella?
- ¿Puede medirse?
- ¿Cuál es el impacto?

No agregar:

- memoización indiscriminada;
- caching complejo;
- virtualización;
- workers;
- queries paralelas;
- abstracciones;

sin necesidad demostrable.

---

# 38. SEGURIDAD

Nunca sacrificar seguridad para facilitar desarrollo.

No:

- exponer secrets;
- saltarse RLS;
- confiar en datos del cliente;
- confiar únicamente en validación frontend;
- introducir permisos implícitos;
- almacenar información sensible innecesariamente.

---

# 39. UX

No modificar UX durante una tarea puramente técnica salvo que exista un bug funcional.

Si se detecta un problema UX no relacionado:

> documentarlo y dejarlo fuera del cambio actual.

No mezclar tareas.

---

# 40. SCOPE CONTROL

Cada tarea debe tener:

### IN SCOPE

Lo necesario para resolverla.

### OUT OF SCOPE

Todo lo demás.

La IA no debe expandir automáticamente el scope.

Si encuentra problemas adicionales:

1. documentarlos;
2. no solucionarlos automáticamente;
3. continuar con la tarea original.

---

# 41. ANTES DE REFACTORIZAR

La IA debe producir mentalmente este análisis:

### Problema actual

¿Qué está mal?

### Causa

¿Por qué ocurre?

### Código afectado

¿Qué archivos participan?

### Dependencias

¿Qué depende de esto?

### Riesgo

¿Qué puede romperse?

### Solución mínima

¿Cuál es el cambio más pequeño que resuelve correctamente el problema?

### Alternativas

¿Existe otra solución?

### Decisión

¿Por qué esta solución es mejor?

Solo entonces refactorizar.

---

# 42. REFACTOR = MISMO COMPORTAMIENTO

Salvo que la tarea indique explícitamente lo contrario:

> Un refactor debe conservar el comportamiento funcional existente.

Debe cambiar:

- estructura;
- organización;
- duplicación;
- complejidad.

No debe cambiar accidentalmente:

- reglas;
- permisos;
- lifecycle;
- outputs;
- contratos;
- comportamiento de usuario.

---

# 43. REFACTOR EN ETAPAS

Para refactors importantes:

### Paso 1

Entender.

### Paso 2

Eliminar duplicación evidente.

### Paso 3

Extraer responsabilidades.

### Paso 4

Actualizar referencias.

### Paso 5

Eliminar código muerto.

### Paso 6

Compilar.

### Paso 7

Ejecutar tests.

### Paso 8

Revisar regresiones.

No hacer una reescritura masiva sin checkpoints.

---

# 44. DEAD CODE

Cuando sea seguro identificar código muerto:

- imports no utilizados;
- funciones no utilizadas;
- componentes no utilizados;
- tipos obsoletos;
- variables muertas;

deben eliminarse durante refactors relacionados.

Pero no eliminar código solamente porque "parece no utilizarse".

Verificar referencias primero.

---

# 45. NO CREAR DUPLICADOS TEMPORALES

Evitar:

```text
oldService.ts
newService.ts
newService2.ts
newServiceFinal.ts
```

Si se reemplaza una implementación:

> migrar correctamente y eliminar la antigua cuando sea seguro.

---

# 46. ARCHIVOS "FINAL", "NEW", "OLD"

No utilizar nombres como:

- final;
- new;
- old;
- backup;
- temp;
- test2;
- fixed;
- v2;

como solución permanente.

El código debe representar una arquitectura limpia.

---

# 47. TESTING

Toda modificación debe determinar qué nivel de verificación necesita:

### Nivel 1

TypeScript / lint.

### Nivel 2

Build.

### Nivel 3

Unit test.

### Nivel 4

Integration test.

### Nivel 5

E2E.

### Nivel 6

Manual verification.

No ejecutar pruebas irrelevantes únicamente para decir que se ejecutaron.

---

# 48. BUILD FIRST

Después de cambios estructurales importantes:

> ejecutar el build.

Un cambio no está terminado porque "el código se ve correcto".

---

# 49. NO IGNORAR ERRORES PREEXISTENTES

Si el proyecto ya tiene errores:

1. identificarlos;
2. determinar cuáles son preexistentes;
3. no atribuirlos falsamente al cambio;
4. no solucionarlos automáticamente si están fuera de scope;
5. informar claramente.

---

# 50. NO ROMPER CONTRATOS

Antes de cambiar:

- funciones;
- APIs;
- DTOs;
- rutas;
- tipos;
- servicios;

buscar todos sus consumidores.

No asumir que un cambio local es realmente local.

---

# 51. ROUTING

Antes de crear una ruta:

- verificar router;
- verificar rutas existentes;
- verificar parámetros;
- verificar loaders;
- verificar navegación;
- verificar deep links;
- verificar Electron si aplica.

No crear rutas duplicadas.

---

# 52. FORMS

Los formularios deben tener:

- fuente de verdad clara;
- validación;
- estados de loading;
- errores;
- success state;
- protección contra double submit;
- manejo de datos incompletos.

No confiar exclusivamente en validación visual.

---

# 53. ASYNC

Toda operación asíncrona debe contemplar:

- loading;
- success;
- failure;
- cancellation cuando aplique;
- race conditions cuando aplique;
- estados obsoletos.

Evitar actualizar estado después de que una operación dejó de ser válida.

---

# 54. QUERIES

No hacer queries dentro de componentes de forma repetitiva si existe una capa adecuada para ello.

Evitar:

- queries duplicadas;
- fetching innecesario;
- loops que generan N+1 queries;
- traer columnas innecesarias;
- traer datasets completos cuando solo se necesitan algunos registros.

---

# 55. LOGGING

Los logs deben ser útiles.

No dejar:

```ts
console.log("test")
console.log(data)
console.log("here")
```

en producción.

Los logs deben proporcionar contexto relevante.

---

# 56. DEBUGGING

No solucionar bugs mediante parches aleatorios.

Proceso:

1. reproducir;
2. aislar;
3. identificar causa;
4. confirmar hipótesis;
5. aplicar fix;
6. verificar;
7. revisar regresiones.

No cambiar cinco cosas simultáneamente sin saber cuál resolvió el problema.

---

# 57. CUANDO LA IA NO ENTIENDE

Está permitido detenerse.

Si falta contexto:

> NO inventar.

Debe buscar en:

- código;
- documentación;
- migrations;
- tipos;
- servicios;
- rutas;
- reglas del dominio.

Si después de investigar sigue existiendo una ambigüedad crítica:

> preguntar antes de implementar.

---

# 58. CUANDO EXISTEN DOS POSIBLES SOLUCIONES

Elegir la solución que tenga mejor combinación de:

1. menor complejidad;
2. menor superficie de cambio;
3. mayor reutilización;
4. mayor consistencia con arquitectura existente;
5. menor riesgo;
6. mayor facilidad de mantenimiento.

No elegir automáticamente la solución "más sofisticada".

---

# 59. PRIORIDAD DE DECISIONES

Cuando haya conflicto:

1. Integridad del dominio.
2. Correctitud.
3. Seguridad.
4. Consistencia arquitectónica.
5. Mantenibilidad.
6. Simplicidad.
7. Performance demostrable.
8. UX.
9. Elegancia del código.

---

# 60. REGLA CONTRA "AI SLOP"

La IA debe evitar producir:

- abstracciones innecesarias;
- boilerplate;
- wrappers innecesarios;
- funciones de una sola línea sin valor;
- archivos innecesarios;
- comentarios excesivos;
- tipos redundantes;
- interfaces redundantes;
- código generado que nadie necesita;
- patrones complejos para problemas simples.

Regla:

> Menos código, si produce el mismo resultado correctamente, es preferible.

---

# 61. REGLA DE EVIDENCIA

Toda modificación importante debe poder responder:

### ¿Qué problema resuelve?

### ¿Por qué esta ubicación?

### ¿Por qué no reutilizar algo existente?

### ¿Qué código se elimina?

### ¿Qué comportamiento cambia?

### ¿Qué comportamiento permanece?

### ¿Cómo se verificó?

Si la IA no puede responder estas preguntas:

> probablemente está implementando demasiado.

---

# 62. PROTOCOLO OBLIGATORIO DE IMPLEMENTACIÓN

Para cada tarea:

## FASE A — DISCOVERY

Investigar el repositorio.

Buscar:

- entidades;
- servicios;
- componentes;
- hooks;
- tipos;
- rutas;
- migrations;
- tests;
- reglas;
- dependencias.

## FASE B — MODEL

Construir mentalmente el mapa:

```text
UI
 ↓
Route
 ↓
Hook / Query
 ↓
Service
 ↓
Domain / MIE / MKB
 ↓
Database
```

Identificar dónde pertenece realmente el cambio.

## FASE C — PLAN

Definir:

- archivos que cambiarán;
- archivos que podrían cambiar;
- archivos que NO deben cambiar;
- comportamiento esperado;
- riesgos.

## FASE D — IMPLEMENT

Implementar la solución mínima.

## FASE E — CLEANUP

Eliminar:

- código muerto;
- imports innecesarios;
- duplicaciones introducidas;
- archivos temporales.

## FASE F — VERIFY

Ejecutar:

- typecheck;
- lint cuando corresponda;
- build;
- tests relevantes;
- verificación manual cuando corresponda.

## FASE G — REVIEW

Preguntarse:

> "Si otro Senior Engineer revisara este PR, ¿qué me cuestionaría?"

Corregir antes de finalizar.

---

# 63. PROTOCOLO PARA BUGS

No aplicar directamente un parche.

Usar:

```text
BUG
 ↓
REPRODUCE
 ↓
ISOLATE
 ↓
ROOT CAUSE
 ↓
MINIMAL FIX
 ↓
VERIFY
 ↓
REGRESSION CHECK
```

---

# 64. PROTOCOLO PARA FEATURES

Usar:

```text
REQUIREMENT
 ↓
DOMAIN IMPACT
 ↓
EXISTING CODE SEARCH
 ↓
ARCHITECTURAL LOCATION
 ↓
MINIMAL DESIGN
 ↓
IMPLEMENTATION
 ↓
VALIDATION
 ↓
TEST
```

---

# 65. PROTOCOLO PARA REFACTOR

Usar:

```text
CURRENT STATE
 ↓
PROBLEM
 ↓
DEPENDENCIES
 ↓
TARGET STRUCTURE
 ↓
MINIMAL TRANSITION
 ↓
REMOVE DUPLICATION
 ↓
VERIFY
 ↓
DELETE OLD CODE
```

---

# 66. PROTOCOLO PARA DATABASE

Usar:

```text
CURRENT SCHEMA
 ↓
RELATIONSHIPS
 ↓
RLS
 ↓
MIGRATION IMPACT
 ↓
DATA MIGRATION
 ↓
APPLICATION IMPACT
 ↓
VERIFY
```

---

# 67. REGLA DE NO REGRESIÓN

Antes de terminar una tarea, la IA debe preguntarse:

- ¿rompí otra pantalla?
- ¿rompí otra ruta?
- ¿rompí una query?
- ¿rompí un servicio?
- ¿rompí un tipo?
- ¿rompí una migration?
- ¿rompí permisos?
- ¿rompí lifecycle?
- ¿rompí datos existentes?
- ¿cambié comportamiento sin querer?

---

# 68. DOCUMENTACIÓN DE CAMBIOS

Cuando una modificación sea significativa, documentar:

```text
CHANGE
WHY
FILES
IMPACT
VALIDATION
KNOWN LIMITATIONS
```

No documentar cambios triviales.

---

# 69. REGLA DE "NO SORPRESAS"

La IA no debe introducir silenciosamente:

- nuevas dependencias;
- nuevas tablas;
- nuevas APIs;
- nuevos estados;
- nuevos permisos;
- nuevos servicios;
- nuevos patrones arquitectónicos.

Si un cambio importante resulta necesario:

> debe ser explícito.

---

# 70. REGLA FINAL

Antes de escribir código, la IA debe preguntarse:

> ¿Esto ya existe?

> ¿Dónde debería vivir?

> ¿Estoy duplicando algo?

> ¿Estoy creando más código del necesario?

> ¿Estoy modificando el dominio o solamente la UI?

> ¿Estoy introduciendo una nueva fuente de verdad?

> ¿Estoy cambiando comportamiento sin querer?

> ¿Puedo resolverlo de una forma más simple?

> ¿Qué podría romper?

> ¿Cómo voy a demostrar que funciona?

La mejor implementación de CST no es la que tiene más código.

Es la que:

- resuelve correctamente el problema;
- respeta el dominio musical;
- reutiliza la arquitectura existente;
- mantiene una única fuente de verdad;
- introduce el mínimo cambio necesario;
- es fácil de entender;
- es fácil de probar;
- es fácil de mantener;
- y no deja código innecesario detrás.

# PRINCIPIO SUPREMO

> **UNDERSTAND FIRST. REUSE SECOND. CHANGE MINIMALLY. VERIFY ALWAYS.**

La IA no debe intentar demostrar cuánto código puede escribir.

Debe demostrar cuánto problema puede resolver **sin añadir complejidad innecesaria**.
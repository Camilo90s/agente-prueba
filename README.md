# UX-EduTutor

Agente tutor inteligente para la aplicación de criterios de experiencia de usuario en productos digitales educativos desarrollados por estudiantes de la Licenciatura en Informática de la Universidad de Córdoba.

Usa el **sistema de diseño de Orbita 3D** (`css/orbita.css`, tipografía Nunito e íconos, copiados sin cambios de `Ambientes/orbit-3d`). Las piezas nuevas están en `css/tutor.css` y solo usan los tokens de Orbita, así que el alto contraste y el tamaño de texto siguen funcionando.

## Contenido: una lección por criterio

Los criterios UX del trabajo de grado (`agente-ux.docx`) son los seis principios fundamentales de la interacción de Norman (2013), *The Design of Everyday Things*:

1. Affordances
2. Significantes
3. Restricciones (físicas, culturales, semánticas, lógicas y funciones forzosas)
4. Mapeo (y mapeo natural)
5. Retroalimentación
6. Modelo conceptual (e imagen del sistema)

Antes de las lecciones, **El marco** presenta la descubribilidad, la comprensión y las brechas de ejecución y de evaluación. Al final, **Integración** consolida las decisiones frente a los seis principios.

Cada lección tiene cuatro pasos:

| Paso | Qué hace el estudiante |
|---|---|
| Aprende | Definición parafraseada, idea clave, matices, ejemplo cotidiano y de producto educativo, confusión frecuente |
| Practica | 4 situaciones con retroalimentación por opción y ayudas graduadas |
| Analiza | Marca problemas en la pantalla simulada de un producto educativo |
| Aplica | Describe estado inicial, problema, ajuste y justificación para **su propio producto**; recibe retroalimentación y lo guarda en la bitácora; cierra con una reflexión y un semáforo |

## Mediación pedagógica (según el informe)

- **Andamiaje.** Cuatro niveles de ayuda (pregunta orientadora, recordar el principio, descartar una opción, explicación del paso). El apoyo se retira a medida que crece el dominio: alto (ayuda desde el inicio), medio (tras un error) y bajo (tras un error, empezando por pistas ligeras).
- **Retroalimentación pedagógica.** Responde a la opción elegida y a lo que el estudiante escribe. En el paso *Aplica*, la primera revisión solo hace preguntas; desde la segunda, si sigue habiendo vacíos, da una orientación directa (para no responder solo con preguntas).
- **Reflexión.** Pregunta metacognitiva y autoevaluación tipo semáforo al cerrar cada lección.
- **Agencia.** El estudiante elige la lección y cuándo pedir ayuda. El tutor recomienda y explica por qué (“Cómo lo calculo”), y el estudiante puede valorar cada ayuda (👍/👎).

## Modelo del estudiante

Rastreo bayesiano del conocimiento por principio (`TUTOR.BKT` en `js/data.js`). El diagnóstico inicial fija el punto de partida; cuentan como acierto solo las respuestas al primer intento y sin ayuda, la primera revisión de cada caso y la primera de cada decisión.

## Panel docente

En **Ayuda › Panel docente** (o `#/admin`): autonomía, dependencia cognitiva, ayudas por nivel, rondas de retroalimentación, valoraciones de la ayuda, dominio por principio, concepciones erróneas más frecuentes y exportación en JSON, CSV de eventos y la bitácora en Markdown.

Los datos se guardan solo en el navegador del dispositivo (`localStorage`). No hay cuentas ni servidor.

## Abrirlo

```bash
python -m http.server 8765
```

Luego abre `http://localhost:8765`.

## Editar el contenido

Todo el texto está en `js/data.js`: el marco, las seis lecciones (definición, matices, situaciones, caso y preguntas de aplicación), el diagnóstico y la integración. En `aplica.claves` están las raíces (sin tildes) con las que el tutor reconoce si la justificación conecta el ajuste con el principio.

Las definiciones están parafraseadas en español; no son traducciones literales del libro.

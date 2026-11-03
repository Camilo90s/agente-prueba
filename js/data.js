/*
 * UX-EduTutor · contenido
 * ---------------------------------------------------------------
 * Criterios UX del trabajo de grado “Agente tutor inteligente para la aplicación
 * de criterios de experiencia de usuario en productos digitales educativos”:
 * los seis principios fundamentales de la interacción de Norman (2013).
 * Una lección por principio. Las definiciones están parafraseadas en español.
 *
 * Esquema de una lección:
 *   id, n, termino, en, icono, color, fuente, brecha (ejecución | evaluación | ambas)
 *   def, clave, explica[], matices[{t, d}], cotidiano, producto, confusion
 *   quiz[{ q, ops: [[texto, retroalimentación]], ok, pista }]
 *   caso { titulo, contexto, pantalla, zonas[{ id, html, problema, fb }] }
 *   aplica { donde, problema, ajuste, porque, claves[], guia, ejemplo }
 *   reflexion  pregunta metacognitiva de cierre
 */
window.TUTOR = {
  LIBRO: 'Norman, D. A. (2013). The Design of Everyday Things (ed. revisada y ampliada). Basic Books.',

  // Introducción: el marco que une los seis principios
  MARCO: {
    descubribilidad: 'Poder averiguar qué acciones son posibles y dónde y cómo realizarlas.',
    comprension: 'Entender cómo se usa el producto y qué significan sus elementos.',
    ejecucion: 'La brecha de ejecución separa lo que la persona quiere hacer de lo que logra averiguar sobre cómo hacerlo.',
    evaluacion: 'La brecha de evaluación separa lo que ocurre en el producto de lo que la persona logra interpretar.',
    idea: 'Para Norman, la descubribilidad resulta de aplicar seis principios. Cuando un producto falla, la pregunta no es “¿qué hizo mal el usuario?”, sino “¿qué principio no se aplicó?”.'
  },

  // Niveles de ayuda del andamiaje (de menor a mayor apoyo)
  AYUDAS: [
    { id: 'pregunta', nombre: 'Pregunta orientadora', icono: 'help' },
    { id: 'definicion', nombre: 'Recordar el principio', icono: 'book' },
    { id: 'descartar', nombre: 'Descartar una opción', icono: 'x' },
    { id: 'explicacion', nombre: 'Explicación del paso', icono: 'bulb' }
  ],

  // Modelo del estudiante: rastreo bayesiano del conocimiento por principio
  BKT: { inicial: 0.25, aprende: 0.12, desliz: 0.1, adivina: 0.3, dominio: 0.85 },

  LECCIONES: [
    /* ======================= 1 · AFFORDANCES ======================= */
    {
      id: 'affordances', n: 1, icono: 'hand', color: 'primary', brecha: 'ejecución',
      termino: 'Affordances', en: 'Affordances',
      fuente: 'Norman (2013), cap. 1 · Affordances',
      def: 'Una affordance es la relación entre las propiedades de un objeto y las capacidades de quien lo usa, relación que determina las formas en que el objeto puede utilizarse.',
      clave: 'No es una propiedad del objeto: es una relación entre el objeto y la persona.',
      explica: [
        'Una silla permite sentarse y también levantarla. Pero si quien lo intenta no tiene la fuerza suficiente, para esa persona la silla no ofrece la posibilidad de ser levantada. La affordance depende a la vez del objeto y de las capacidades de quien interactúa.',
        'Por tratarse de una relación, lo que resulta evidente o posible para un usuario puede no serlo para otro: un gesto de precisión que un adulto hace sin pensar puede ser imposible para un niño de primaria o para alguien con temblor en las manos.'
      ],
      matices: [
        { t: 'Anti-affordance', d: 'Es la prevención de una interacción. El vidrio deja ver pero impide el paso; como no se percibe, pájaros y personas chocan con él.' },
        { t: 'Deben percibirse', d: 'Para ser útiles, las affordances deben poder descubrirse. Si no se perciben, hace falta un significante (lección 2).' },
        { t: 'En pantallas', d: 'Casi todo lo que vemos en una pantalla son señales de lo que se puede hacer. La affordance real es lo que el sistema permite hacer con el dedo, el ratón o el teclado, según quién lo use.' }
      ],
      cotidiano: 'Una placa plana en una puerta permite empujar; no permite halar, porque no hay de dónde agarrar.',
      producto: 'Un juego para grado primero que pide arrastrar fichas de 20 píxeles: para un adulto con ratón la acción es posible; para un niño de 6 años en una tableta, prácticamente no lo es.',
      confusion: 'Decir que un botón “tiene una affordance” como si fuera un atributo fijo del botón, o usar “affordance” como sinónimo de señal o de ícono.',
      quiz: [
        { q: 'Una silla pesada no puede ser levantada por un niño de 6 años. Según Norman:',
          ops: [['La silla no tiene la affordance de levantarse para nadie', 'Para un adulto fuerte sí la tiene: la affordance depende también de quien interactúa.'],
                ['Para el niño, la silla no ofrece la posibilidad de ser levantada', 'Correcto: la affordance es la relación entre las propiedades del objeto y las capacidades del agente.'],
                ['La affordance depende solo del peso de la silla', 'El peso cuenta, pero también la fuerza de quien la quiere levantar. Es una relación.']],
          ok: 1, pista: '¿La affordance está en la silla, en el niño o en la relación entre ambos?' },
        { q: 'Una actividad muestra una pista solo al pasar el cursor por encima de una palabra. Los estudiantes la usan en celulares. ¿Qué ocurre?',
          ops: [['Para quienes usan pantalla táctil, esa acción no es posible: la affordance no existe para ellos', 'Exacto: en una pantalla táctil no hay “pasar el cursor”; la relación objeto–usuario cambia con el dispositivo.'],
                ['Es un problema de retroalimentación', 'La retroalimentación informa el resultado de una acción; aquí la acción ni siquiera puede realizarse.'],
                ['Funciona igual para todos, solo que la pista es corta', 'No funciona igual: depende del dispositivo y de las capacidades de quien usa el producto.']],
          ok: 0, pista: 'Piensa en quién usa el producto y con qué dispositivo. ¿Puede realizar esa acción?' },
        { q: 'Una puerta de vidrio impide el paso, pero la gente choca con ella. ¿Cómo lo explica Norman?',
          ops: [['Es un mapeo deficiente', 'El mapeo relaciona controles con efectos; aquí el problema es percibir que el paso está bloqueado.'],
                ['Es una anti-affordance que no se percibe', 'Correcto: impide la interacción, pero al ser invisible no se descubre.'],
                ['Es una restricción cultural', 'No es una convención aprendida: es una propiedad física que no se ve.']],
          ok: 1, pista: 'El vidrio impide pasar. ¿Esa propiedad se puede ver?' },
        { q: '¿Cuál de estas frases usa el término “affordance” como lo propone Norman?',
          ops: [['“Agregué un ícono de lupa como affordance de búsqueda”', 'El ícono es una señal: eso es un significante, no una affordance.'],
                ['“El mapa permite ampliar con dos dedos a quienes tienen motricidad fina, pero no a algunos de nuestros usuarios mayores”', 'Correcto: describe la posibilidad de acción como relación entre el producto y las capacidades de distintos usuarios.'],
                ['“El botón tiene buena affordance porque es azul”', 'El color es parte de la señal visual; la affordance es lo que la persona puede hacer, según sus capacidades.']],
          ok: 1, pista: 'Busca la frase que habla de una relación entre el producto y las capacidades de alguien.' }
      ],
      caso: {
        titulo: 'Fracciones con pizza · app para grado tercero',
        contexto: 'Niños de 8 años la usan en tabletas del aula. Toca cada elemento donde la posibilidad de acción no existe o no se percibe para estos usuarios.',
        pantalla: 'Fracciones',
        zonas: [
          { id: 'hover', problema: true, html: '<div class="m-text">Pasa el cursor sobre <u class="m-dot">denominador</u> para ver qué significa</div>',
            fb: 'En una tableta no existe “pasar el cursor”: para estos usuarios la acción no es posible. Mejor un toque que abra la explicación.' },
          { id: 'arrastre', problema: true, html: '<div class="m-pizza"><span></span><i class="m-handle"></i></div><div class="m-cap">Arrastra el punto pequeño para cortar la pizza</div>',
            fb: 'Un punto de arrastre diminuto exige una precisión que un niño de 8 años no tiene. El objetivo de toque debe ser grande (al menos 44 px).' },
          { id: 'audio', problema: false, html: '<div class="m-row"><span class="m-round">🔊</span><span class="m-text">Escuchar la pregunta</span></div>',
            fb: 'Bien pensado: permite participar a quienes todavía leen con dificultad.' },
          { id: 'opciones', problema: false, html: '<div class="m-grid"><span class="m-opt">1/2</span><span class="m-opt">1/4</span><span class="m-opt">3/4</span></div>',
            fb: 'Opciones grandes y separadas: la acción de tocarlas es posible y evidente para niños.' },
          { id: 'doble', problema: true, html: '<div class="m-text">Toca dos veces rápido la respuesta para confirmarla</div>',
            fb: 'El doble toque rápido es difícil de controlar para muchos niños y no se descubre solo. Un botón “Confirmar” amplio funciona mejor.' }
        ]
      },
      aplica: {
        donde: '¿Qué acciones principales permite tu producto (tocar, arrastrar, escribir, deslizar…)? Describe una.',
        problema: '¿Para qué usuario esa acción podría no ser posible o no percibirse? Piensa en edad, dispositivo, motricidad o conexión.',
        ajuste: '¿Qué ajuste harías para que la acción sea posible y perceptible para ese usuario?',
        porque: '¿Por qué ese ajuste aplica el principio de affordances?',
        claves: ['relacion', 'capacidad', 'usuario', 'posible', 'permite', 'percib', 'edad', 'dispositiv', 'motric', 'tactil', 'accion'],
        guia: 'Recuerda que una affordance no está en el botón: está en la relación entre el producto y la persona. Una buena justificación nombra al usuario concreto, la capacidad que tiene o le falta, y cómo el ajuste hace posible la acción para él.',
        ejemplo: 'Mi simulador permite girar el modelo arrastrando con un dedo. Para estudiantes con celulares de gama baja el arrastre se traba y para quien usa teclado no existe. Agregué botones grandes de girar a izquierda y derecha. Así la acción es posible según las capacidades y el dispositivo de cada usuario, no solo para quien tiene una pantalla rápida.'
      },
      reflexion: '¿En qué usuario no habías pensado antes de esta lección?'
    },

    /* ======================= 2 · SIGNIFICANTES ======================= */
    {
      id: 'significantes', n: 2, icono: 'info', color: 'teal', brecha: 'ejecución',
      termino: 'Significantes', en: 'Signifiers',
      fuente: 'Norman (2013), cap. 1 · Significantes',
      def: 'Un significante es cualquier marca, sonido o indicador perceptible que comunica dónde y cómo debe realizarse una acción. Mientras las affordances determinan qué acciones son posibles, los significantes las hacen descubribles.',
      clave: 'La affordance dice qué es posible; el significante dice dónde y cómo.',
      explica: [
        'Norman introdujo el término affordance en el diseño y luego vio que se usaba mal: los diseñadores decían “affordance” cuando se referían a una señal. Por eso, en la edición revisada, propone el término significante. Para quien diseña, los significantes son más importantes que las affordances.',
        'Su ausencia explica que funciones que existen pasen inadvertidas: el producto puede hacer algo, pero nadie se entera.'
      ],
      matices: [
        { t: 'Intencionales', d: 'Puestos a propósito: el letrero EMPUJE, el subrayado de un enlace, el borde y la sombra de un botón.' },
        { t: 'Accidentales', d: 'Nadie los diseñó para comunicar, pero comunican: el sendero marcado en el pasto, o un andén vacío que te hace pensar que perdiste el tren.' },
        { t: 'Engañosos', d: 'Un significante mal puesto comunica algo falso: una manija que invita a halar una puerta que se empuja.' }
      ],
      cotidiano: 'Una manija vertical dice “hala aquí”; una placa plana dice “empuja aquí”.',
      producto: 'En una presentación interactiva, las imágenes que se pueden ampliar se ven iguales a las decorativas: nada indica que se pueden tocar.',
      confusion: 'Llamar “affordance” a un ícono o a una etiqueta. Eso es un significante.',
      quiz: [
        { q: 'El texto “Arrastra tu archivo aquí” dentro de un recuadro punteado es…',
          ops: [['Una affordance', 'La posibilidad de soltar el archivo es la affordance; el texto y el recuadro la señalan.'],
                ['Un significante', 'Correcto: es un indicador perceptible que comunica dónde y cómo actuar.'],
                ['Una restricción', 'Una restricción limita las acciones posibles; aquí se comunica qué hacer.']],
          ok: 1, pista: '¿Es la posibilidad de acción en sí, o la señal que te la comunica?' },
        { q: 'Ves un sendero marcado en el pasto de un parque y decides seguirlo. Ese sendero es…',
          ops: [['Un significante accidental', 'Exacto: nadie lo diseñó para comunicar, pero te indica el camino.'],
                ['Una anti-affordance', 'No impide nada; te orienta.'],
                ['Un modelo conceptual', 'No explica cómo funciona algo; es una señal de dónde actuar.']],
          ok: 0, pista: 'Alguien lo creó sin intención de comunicar, pero te comunica algo.' },
        { q: 'Tu plataforma permite deslizar una tarjeta para ver la siguiente, pero nadie lo hace. ¿Qué principio revisas primero?',
          ops: [['Retroalimentación', 'La retroalimentación llega después de actuar; aquí nadie sabe que puede actuar.'],
                ['Significantes', 'Correcto: la acción existe, pero nada comunica dónde y cómo hacerla.'],
                ['Restricciones', 'No se trata de limitar acciones, sino de hacer visible una que existe.']],
          ok: 1, pista: 'La acción es posible. ¿Qué falta para que el usuario la descubra?' },
        { q: 'Un enlace tiene el mismo color y estilo que el texto normal. ¿Qué pasa?',
          ops: [['Falta un significante: el enlace existe pero no se distingue', 'Exacto: sin color, subrayado u otra señal, la acción pasa inadvertida.'],
                ['Hay una anti-affordance', 'El enlace sí se puede tocar; el problema es que no se nota.'],
                ['El mapeo es incorrecto', 'El mapeo es la relación control–efecto; aquí el control ni siquiera se percibe.']],
          ok: 0, pista: '¿El usuario puede notar que ese texto es diferente?' }
      ],
      caso: {
        titulo: 'Guía de estudio interactiva · biología',
        contexto: 'Estudiantes de grado octavo la abren en el celular. Toca los elementos cuya acción pasa inadvertida o cuya señal engaña.',
        pantalla: 'La célula',
        zonas: [
          { id: 'imagen', problema: true, html: '<div class="m-img">🦠</div><div class="m-cap">Imagen de la célula</div>',
            fb: 'La imagen se puede ampliar, pero se ve igual a las decorativas. Un ícono de lupa o el texto “Toca para ampliar” la haría descubrible.' },
          { id: 'enlace', problema: true, html: '<div class="m-text">Repasa la <span>membrana celular</span> antes de seguir.</div>',
            fb: '“Membrana celular” es un enlace, pero tiene el mismo estilo del texto. Necesita color y subrayado.' },
          { id: 'boton', problema: false, html: '<span class="m-btn">Hacer el quiz</span>',
            fb: 'Botón con fondo, contraste y verbo de acción: comunica claramente dónde y cómo actuar.' },
          { id: 'tarjetas', problema: true, html: '<div class="m-card">Mitocondria</div><div class="m-cap">(se puede deslizar a la siguiente tarjeta)</div>',
            fb: 'El deslizamiento no tiene ninguna señal. Puntos de paginación o la tarjeta siguiente asomando por el borde lo comunicarían.' },
          { id: 'audio', problema: false, html: '<div class="m-row"><span class="m-round">🔊</span><span class="m-text">Escuchar</span></div>',
            fb: 'Ícono conocido acompañado de texto: señal clara.' },
          { id: 'subrayado', problema: true, html: '<div class="m-text"><u>Glosario</u> · <u>Importante</u> · <u>Mitosis</u></div><div class="m-cap">Solo “Glosario” es un enlace</div>',
            fb: 'Se usa subrayado para resaltar texto que no es enlace: el significante engaña. Reserva el subrayado para lo que se puede tocar.' }
        ]
      },
      aplica: {
        donde: 'Elige una acción importante de tu producto. ¿Cómo sabe hoy el usuario dónde y cómo hacerla?',
        problema: '¿Qué función de tu producto podría pasar inadvertida, o qué señal podría confundir?',
        ajuste: '¿Qué señal concreta agregarías o cambiarías (texto, ícono, forma, color, sonido, movimiento)?',
        porque: '¿Por qué esa señal aplica el principio de significantes?',
        claves: ['senal', 'indica', 'comunica', 'percib', 'visible', 'descubr', 'donde', 'como', 'icono', 'texto', 'etiquet', 'nota'],
        guia: 'Un significante responde a dos preguntas del usuario: “¿dónde actúo?” y “¿cómo?”. Tu justificación debería decir qué acción ya existía, por qué no se notaba y cómo la nueva señal la vuelve perceptible.',
        ejemplo: 'En mi juego de ortografía se puede volver a escuchar la palabra tocando el parlante, pero el ícono era pequeño y gris. Lo cambié por un botón grande con el texto “Repetir audio”. La acción ya existía; ahora la señal comunica dónde y cómo hacerla, así que deja de pasar inadvertida.'
      },
      reflexion: '¿Qué señal de tu producto dabas por obvia y quizá no lo es para tus usuarios?'
    },

    /* ======================= 3 · RESTRICCIONES ======================= */
    {
      id: 'restricciones', n: 3, icono: 'lock', color: 'orange', brecha: 'ejecución',
      termino: 'Restricciones', en: 'Constraints',
      fuente: 'Norman (2013), caps. 1 y 4 · Restricciones',
      def: 'Las restricciones limitan las acciones posibles y orientan al usuario hacia el uso adecuado. Norman distingue cuatro tipos: físicas, culturales, semánticas y lógicas.',
      clave: 'Pocas alternativas bien elegidas guían la acción; ninguna restricción invita al error y demasiadas frustran.',
      explica: [
        'Las restricciones reducen el conjunto de acciones posibles, de modo que la persona puede actuar bien aunque nunca haya usado el producto. Norman lo muestra con un juguete para armar: aun sin instrucciones, la forma de las piezas, las convenciones y el sentido de la situación dejan muy pocas maneras de ensamblarlo.',
        'Su ausencia permite errores; su rigidez excesiva genera frustración. El reto es restringir lo que conduce al error sin bloquear lo que el usuario necesita hacer.'
      ],
      matices: [
        { t: 'Físicas', d: 'Limitan por la forma: una pieza que solo encaja en un sentido. En pantalla: un selector de fecha que no deja escribir “30 de febrero”. Son más útiles si se ven antes de actuar.' },
        { t: 'Culturales', d: 'Convenciones aprendidas en una cultura: el rojo para detenerse, la X para cerrar. Cambian entre grupos y épocas.' },
        { t: 'Semánticas', d: 'Se apoyan en el significado de la situación: el conductor de una moto de juguete solo tiene sentido sentado mirando hacia adelante.' },
        { t: 'Lógicas', d: 'Se deducen razonando: si queda una pieza y un solo lugar libre, va ahí. En pantalla: si solo falta una respuesta, el sistema puede señalarla.' },
        { t: 'Funciones forzosas', d: 'Restricciones físicas fuertes en las que fallar un paso impide el siguiente. Hay tres: interbloqueos (obligan a un orden), bloqueos internos (impiden salir sin guardar) y bloqueos externos (impiden entrar a algo peligroso).' }
      ],
      cotidiano: 'El horno microondas deja de funcionar si abres la puerta: un interbloqueo que impide una acción peligrosa.',
      producto: 'Un formulario de matrícula con un campo de texto libre para el grado deja escribir “once”, “11°”, “undécimo” o “1l”; una lista desplegable de 6.° a 11.° evita el error.',
      confusion: 'Creer que restringir es siempre bueno, o que una restricción solo sirve si bloquea por completo.',
      quiz: [
        { q: 'En un formulario, el campo de fecha es una caja de texto libre y llegan fechas como “31/02”. ¿Qué tipo de restricción falta?',
          ops: [['Una restricción física, como un selector de fecha', 'Correcto: un selector de calendario solo deja elegir fechas que existen.'],
                ['Una restricción cultural', 'El formato de fecha sí es cultural, pero el error se evita limitando las entradas posibles.'],
                ['Ninguna: el usuario debe fijarse mejor', 'Norman insiste en que el problema está en el diseño, no en el usuario.']],
          ok: 0, pista: '¿Qué componente haría imposible escribir una fecha que no existe?' },
        { q: 'Un editor no deja cerrar sin guardar o confirmar que no quieres hacerlo. ¿Qué es?',
          ops: [['Una restricción semántica', 'No se apoya en el significado de la situación, sino en impedir una acción.'],
                ['Una función forzosa: un bloqueo interno', 'Exacto: impide salir hasta realizar la operación deseada o rechazarla conscientemente.'],
                ['Una restricción lógica', 'No se deduce por razonamiento; el sistema bloquea la acción.']],
          ok: 1, pista: 'Te mantiene “dentro” hasta que decides qué hacer con tu trabajo.' },
        { q: 'Que el ícono de la X cierre una ventana es una restricción…',
          ops: [['Física', 'No hay nada en la forma de la X que obligue a ese uso.'],
                ['Lógica', 'No se deduce razonando; se aprende.'],
                ['Cultural', 'Correcto: es una convención aprendida por los usuarios de computadores.']],
          ok: 2, pista: '¿Se deduce, se impone por la forma o se aprende con la experiencia?' },
        { q: 'El botón “Siguiente” de un quiz está deshabilitado y nadie sabe por qué. ¿Qué dice Norman de esto?',
          ops: [['Es una buena restricción: evita errores', 'Evita avanzar, pero sin explicación se vuelve rígida y frustrante.'],
                ['Las restricciones son más útiles si se ven y se entienden antes de actuar', 'Correcto: si el usuario no entiende qué falta, la restricción frustra en vez de orientar.'],
                ['Hay que eliminar todas las restricciones del quiz', 'Quitar la restricción permitiría avanzar sin responder; el ajuste es hacerla comprensible.']],
          ok: 1, pista: '¿El problema es la restricción en sí o que no se entiende?' }
      ],
      caso: {
        titulo: 'Gestor de cursos · plataforma docente',
        contexto: 'Docentes la usan para crear evaluaciones. Toca los elementos donde falta una restricción que evite el error o donde la restricción es tan rígida que frustra.',
        pantalla: 'Nueva evaluación',
        zonas: [
          { id: 'fecha', problema: true, html: '<div class="m-label">Fecha límite</div><div class="m-field">escribe la fecha…</div>',
            fb: 'Texto libre: permite fechas inexistentes o en formatos distintos. Un selector de calendario es una restricción física que evita el error.' },
          { id: 'grado', problema: false, html: '<div class="m-label">Grado</div><div class="m-field m-select">Noveno ▾</div>',
            fb: 'Lista cerrada de grados: limita las opciones a las válidas.' },
          { id: 'borrar', problema: true, html: '<span class="m-btn m-danger">Eliminar curso</span><div class="m-cap">Se borra al instante, sin confirmación</div>',
            fb: 'Una acción destructiva sin confirmación ni posibilidad de deshacer. Necesita una función forzosa (confirmar escribiendo el nombre) o una papelera.' },
          { id: 'publicar', problema: true, html: '<span class="m-btn m-off">Publicar</span><div class="m-cap">Deshabilitado, sin explicación</div>',
            fb: 'La restricción existe, pero no se entiende qué falta: se vuelve rígida y frustra. Indica “Agrega al menos una pregunta para publicar”.' },
          { id: 'puntos', problema: false, html: '<div class="m-label">Puntaje por pregunta</div><div class="m-row"><span class="m-step">−</span><span class="m-field m-num">5</span><span class="m-step">+</span></div>',
            fb: 'Controles de más y menos con límites: evita valores negativos o absurdos sin bloquear al docente.' }
        ]
      },
      aplica: {
        donde: '¿Qué acción de tu producto podría llevar al usuario a un error (dato inválido, acción irreversible, orden equivocado)?',
        problema: '¿Qué pasa hoy si el usuario se equivoca ahí? ¿O hay alguna restricción tan rígida que frustra?',
        ajuste: '¿Qué restricción agregarías o flexibilizarías? Di de qué tipo es (física, cultural, semántica, lógica o función forzosa).',
        porque: '¿Por qué ese ajuste aplica el principio de restricciones?',
        claves: ['limit', 'evita', 'impide', 'error', 'fisic', 'cultural', 'semantic', 'logic', 'forzos', 'bloque', 'confirm', 'deshacer', 'orient'],
        guia: 'Una buena restricción deja pocas alternativas y todas válidas, y se entiende antes de actuar. En tu justificación nombra el tipo de restricción, qué error evita y cómo cuidas que no frustre (por ejemplo, explicando por qué algo está bloqueado).',
        ejemplo: 'En mi app de tareas se podía entregar sin adjuntar archivo, y llegaban entregas vacías. Ahora el botón “Entregar” se habilita solo cuando hay un archivo, y mientras tanto dice “Adjunta tu archivo para entregar”. Es una función forzosa tipo interbloqueo: impone el orden correcto y, como explica qué falta, no frustra.'
      },
      reflexion: '¿Dónde tu producto confía en que el usuario “no se va a equivocar”?'
    },

    /* ======================= 4 · MAPEO ======================= */
    {
      id: 'mapeo', n: 4, icono: 'grid', color: 'violet', brecha: 'ejecución',
      termino: 'Mapeo', en: 'Mapping',
      fuente: 'Norman (2013), caps. 1 y 3 · Mapeo y mapeo natural',
      def: 'El mapeo es la relación entre los controles y sus efectos, o entre la disposición de los elementos y aquello sobre lo que actúan. Un mapeo natural aprovecha analogías espaciales o culturales para que esa relación se comprenda de inmediato.',
      clave: 'Que se entienda, sin memorizar, qué control mueve qué cosa.',
      explica: [
        'El término viene de las matemáticas: la relación entre los elementos de dos conjuntos. Norman usa una fila de interruptores en la pared y muchas luces en el techo: si la disposición no corresponde, hay que probar uno por uno.',
        'En los productos educativos este principio se relaciona con la correspondencia entre la ubicación de los elementos y los contenidos o acciones a los que dan acceso: el orden del menú, la posición de “anterior” y “siguiente”, la barra de progreso que representa las unidades.'
      ],
      matices: [
        { t: 'El mejor mapeo', d: 'El control está sobre el objeto que controla: tocar directamente la palabra para editarla.' },
        { t: 'El segundo mejor', d: 'El control está lo más cerca posible del objeto: el botón de eliminar junto a cada fila.' },
        { t: 'El tercero', d: 'Los controles se ordenan con la misma disposición espacial que los objetos: perillas en la misma forma que las hornillas.' },
        { t: 'Depende de la cultura', d: 'Hacia dónde avanza el tiempo o la lectura varía entre culturas. En español leemos de izquierda a derecha, así que “siguiente” va a la derecha.' }
      ],
      cotidiano: 'Los botones para ajustar el asiento del carro tienen forma de asiento: mueves la parte del botón que quieres mover.',
      producto: 'Un curso en línea cuyo menú lista las unidades en orden alfabético mientras el curso avanza en otro orden: el estudiante no sabe cuál sigue.',
      confusion: 'Creer que basta con etiquetar los controles para que el mapeo sea bueno.',
      quiz: [
        { q: 'En un aula, seis interruptores en fila controlan seis luces dispuestas en dos filas. Nadie acierta al primer intento. ¿Qué falla?',
          ops: [['La retroalimentación', 'Las luces sí se encienden y se ve el resultado; el problema es saber cuál interruptor usar.'],
                ['El mapeo', 'Correcto: no se entiende la relación entre interruptores y luces.'],
                ['La affordance', 'Los interruptores claramente se pueden presionar.']],
          ok: 1, pista: '¿El problema es presionar, ver el resultado o saber cuál corresponde a cuál?' },
        { q: 'Según Norman, ¿cuál es el mejor mapeo?',
          ops: [['Controles con etiquetas numeradas', 'Las etiquetas obligan a leer y recordar; no son un mapeo natural.'],
                ['Controles colocados directamente sobre lo que controlan', 'Exacto: es el mapeo más efectivo como ayuda para la memoria.'],
                ['Un único control con un menú de opciones', 'Un control para muchas funciones dificulta el mapeo.']],
          ok: 1, pista: 'Piensa en la distancia entre el control y el objeto.' },
        { q: 'En una lección, el botón “Siguiente” está a la izquierda y “Anterior” a la derecha. ¿Qué pasa?',
          ops: [['Se rompe un mapeo natural de base cultural', 'Correcto: en español la lectura y la secuencia avanzan hacia la derecha.'],
                ['No importa mientras estén etiquetados', 'Las etiquetas ayudan, pero el mapeo invertido provoca errores aun así.'],
                ['Es un problema de restricción física', 'No se trata de limitar acciones, sino de la relación entre posición y efecto.']],
          ok: 0, pista: '¿Hacia qué lado avanza la lectura en español?' },
        { q: 'Una barra de progreso dividida en 5 segmentos, uno por unidad, que se colorean al completarlas, es un ejemplo de…',
          ops: [['Restricción lógica', 'No limita acciones; representa el contenido.'],
                ['Mapeo entre la disposición de los elementos y el contenido que representan', 'Exacto: cada segmento corresponde a una unidad en el mismo orden.'],
                ['Anti-affordance', 'No impide ninguna interacción.']],
          ok: 1, pista: '¿Qué relación hay entre cada segmento y cada unidad?' }
      ],
      caso: {
        titulo: 'Curso de programación por bloques · videolecciones',
        contexto: 'Estudiantes de grado décimo siguen un curso de 4 unidades en orden. Toca los elementos cuya relación entre control y efecto (o entre ubicación y contenido) no se entiende de inmediato.',
        pantalla: 'Unidad 2 · Bucles',
        zonas: [
          { id: 'menu', problema: true, html: '<div class="m-label">Unidades</div><div class="m-list"><span>Bucles</span><span>Condicionales</span><span>Eventos</span><span>Variables</span></div><div class="m-cap">Orden alfabético; el curso va: Variables, Eventos, Bucles, Condicionales</div>',
            fb: 'El orden del menú no corresponde al orden del curso. Ordénalo como se avanza y numera las unidades.' },
          { id: 'nav', problema: true, html: '<div class="m-row m-spread"><span class="m-btn">Siguiente ›</span><span class="m-btn m-flat">‹ Anterior</span></div>',
            fb: '“Siguiente” a la izquierda y “Anterior” a la derecha rompe el mapeo natural de la lectura en español.' },
          { id: 'progreso', problema: false, html: '<div class="m-seg"><i class="on"></i><i class="on"></i><i></i><i></i></div><div class="m-cap">Una barra por unidad</div>',
            fb: 'Cada segmento corresponde a una unidad, en el mismo orden: buen mapeo.' },
          { id: 'volumen', problema: true, html: '<div class="m-row"><span class="m-text">Volumen</span><span class="m-slider"><i></i></span></div><div class="m-cap">Al mover a la derecha, baja el volumen</div>',
            fb: 'El control invierte la analogía espacial esperada: hacia la derecha debería ser más.' },
          { id: 'editar', problema: false, html: '<div class="m-row"><span class="m-text">Mi apunte: “repetir 4 veces…”</span><span class="m-round">✎</span></div>',
            fb: 'El control de editar está junto al apunte que edita: segundo mejor mapeo.' }
        ]
      },
      aplica: {
        donde: '¿Qué controles o menús de tu producto dan acceso a contenidos o acciones? Elige uno.',
        problema: '¿La posición u orden de ese control corresponde a lo que controla? ¿Dónde el usuario tendría que adivinar o memorizar?',
        ajuste: '¿Cómo reorganizarías, acercarías o agruparías los controles para que la relación sea evidente?',
        porque: '¿Por qué ese ajuste aplica el principio de mapeo?',
        claves: ['relacion', 'correspond', 'control', 'efecto', 'posicion', 'orden', 'ubic', 'cerca', 'junto', 'espacial', 'natural', 'disposic'],
        guia: 'Un buen mapeo hace que la relación entre control y efecto no haya que recordarla. Justifica diciendo qué relación espera el usuario (por posición, orden o convención cultural) y cómo tu ajuste la hace coincidir con la del producto.',
        ejemplo: 'En mi app de lectura el botón para marcar una palabra difícil estaba en la barra superior, lejos del texto. Ahora se marca tocando la palabra misma. El control queda sobre el objeto que controla, que es el mejor mapeo según Norman, y ya no hay que recordar dónde estaba el botón.'
      },
      reflexion: '¿Qué relación de tu producto te parecía lógica a ti, pero quizá no al usuario?'
    },

    /* ======================= 5 · RETROALIMENTACIÓN ======================= */
    {
      id: 'retroalimentacion', n: 5, icono: 'checkCircle', color: 'teal', brecha: 'evaluación',
      termino: 'Retroalimentación', en: 'Feedback',
      fuente: 'Norman (2013), caps. 1 y 2 · Retroalimentación',
      def: 'La retroalimentación consiste en comunicar los resultados de una acción. Debe ser inmediata e informativa: una retroalimentación deficiente puede ser peor que su ausencia, y una excesiva puede resultar aún más molesta que una escasa.',
      clave: 'Inmediata, informativa y en su justa medida.',
      explica: [
        'Cuando falta, la gente presiona una y otra vez el botón del ascensor o del semáforo peatonal: no sabe si el sistema recibió su solicitud. Norman señala que incluso una demora de una décima de segundo puede desconcertar.',
        'Demasiada retroalimentación también daña: luces y pitidos constantes se vuelven molestos y se terminan ignorando, y con ellos se pierden los avisos importantes. Debe planearse y priorizarse para que lo importante destaque.'
      ],
      matices: [
        { t: 'Inmediata', d: 'Si una acción tarda, hay que mostrar de inmediato que el sistema la recibió y que está trabajando.' },
        { t: 'Informativa', d: 'Un “Error 0x8004” no informa: hay que decir qué pasó y qué puede hacer la persona.' },
        { t: 'Priorizada', d: 'No todo merece el mismo aviso. Lo crítico se destaca; lo trivial se informa con discreción o no se informa.' },
        { t: 'Cierra la brecha de evaluación', d: 'La retroalimentación ayuda a responder “¿qué pasó?” y “¿es lo que quería?”.' }
      ],
      cotidiano: 'El clic y la luz del botón del ascensor al presionarlo.',
      producto: 'Un botón “Entregar” que cambia a “Enviando…” y luego muestra “Tarea entregada a las 10:42 · el docente ya puede verla”.',
      confusion: 'Pensar que más mensajes y más sonidos siempre es mejor retroalimentación.',
      quiz: [
        { q: 'Un estudiante presiona “Entregar” tres veces porque nada cambia en pantalla. ¿Qué falta?',
          ops: [['Retroalimentación', 'Correcto: no sabe si el sistema recibió la acción.'],
                ['Un significante', 'El estudiante sí encontró el botón; lo que no sabe es qué pasó después.'],
                ['Una restricción física', 'Las restricciones limitan acciones; aquí falta comunicar el resultado.']],
          ok: 0, pista: '¿Qué le diría al estudiante que su acción tuvo efecto?' },
        { q: 'Una plataforma suena y muestra una ventana cada vez que guarda automáticamente (cada 10 segundos). ¿Qué opinaría Norman?',
          ops: [['Es buena retroalimentación porque informa todo', 'Si es excesiva, se ignora y se pierde lo importante.'],
                ['Es retroalimentación excesiva y mal priorizada', 'Exacto: puede ser más molesta que la escasa; lo trivial debe informarse con discreción.'],
                ['Es un problema de mapeo', 'El problema está en la cantidad y la prioridad de la información sobre resultados.']],
          ok: 1, pista: '¿Puede ser dañina demasiada información?' },
        { q: 'Al subir un archivo aparece “Error 0x80040154”. ¿Qué característica no cumple esa retroalimentación?',
          ops: [['Ser inmediata', 'Llega de inmediato; el problema es otro.'],
                ['Ser informativa', 'Correcto: no dice qué pasó ni qué hacer. Mejor: “El archivo pesa 30 MB; el máximo es 10 MB”.'],
                ['Ser excesiva', 'Es un solo mensaje; el problema es que no se entiende.']],
          ok: 1, pista: 'Llega a tiempo, pero ¿el usuario entiende qué pasó?' },
        { q: '¿Con qué brecha ayuda principalmente la retroalimentación?',
          ops: [['La brecha de ejecución: averiguar cómo hacer algo', 'Eso lo apoyan sobre todo affordances, significantes, restricciones y mapeo.'],
                ['La brecha de evaluación: interpretar qué ocurrió', 'Exacto: comunica el resultado para que la persona lo compare con lo que quería.'],
                ['Ninguna de las dos', 'Norman la ubica claramente en una de ellas.']],
          ok: 1, pista: 'La retroalimentación llega después de actuar.' }
      ],
      caso: {
        titulo: 'Entrega de tareas · aula virtual',
        contexto: 'Estudiantes de grado once entregan su proyecto final. Toca los elementos donde la retroalimentación falta, no informa o sobra.',
        pantalla: 'Proyecto final',
        zonas: [
          { id: 'entregar', problema: true, html: '<span class="m-btn">Entregar</span><div class="m-cap">Al tocarlo no cambia nada durante 8 segundos</div>',
            fb: 'Sin respuesta inmediata, el estudiante vuelve a tocar y puede duplicar la entrega. Debe cambiar al instante a “Enviando…”.' },
          { id: 'error', problema: true, html: '<div class="m-alert">Error 0x80040154</div>',
            fb: 'No es informativo. Debería decir qué pasó y qué hacer: “El archivo pesa 30 MB; el máximo es 10 MB. Comprímelo o súbelo por partes”.' },
          { id: 'subida', problema: false, html: '<div class="m-text">Subiendo 3 de 5 archivos…</div><div class="m-seg"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div>',
            fb: 'Informa el avance y cuánto falta: retroalimentación inmediata e informativa.' },
          { id: 'guardado', problema: true, html: '<div class="m-toast">🔔 ¡Borrador guardado! 🔔</div><div class="m-cap">Ventana con sonido cada 10 segundos</div>',
            fb: 'Excesiva: un evento trivial interrumpe una y otra vez y se termina ignorando. Basta un texto discreto “Guardado hace 5 s”.' },
          { id: 'confirmacion', problema: false, html: '<div class="m-ok">✓ Entregado a las 10:42 · el docente ya puede verlo</div>',
            fb: 'Confirma el resultado, cuándo ocurrió y qué significa para el estudiante.' }
        ]
      },
      aplica: {
        donde: 'Elige una acción importante de tu producto (responder, guardar, enviar, avanzar). ¿Qué ve o escucha hoy el usuario justo después de hacerla?',
        problema: '¿Esa respuesta llega tarde, no informa o sobra? ¿Qué podría interpretar mal el usuario?',
        ajuste: '¿Qué retroalimentación darías: qué dice, cuándo aparece y con qué prioridad?',
        porque: '¿Por qué ese ajuste aplica el principio de retroalimentación?',
        claves: ['inmediat', 'informa', 'resultado', 'accion', 'sabe', 'mensaje', 'priori', 'excesiv', 'tiempo', 'comunica', 'que paso', 'confirm'],
        guia: 'Revisa tu respuesta con las tres condiciones de Norman: ¿es inmediata?, ¿es informativa (qué pasó y qué hacer)?, ¿está en su justa medida? Tu justificación debería mencionar al menos dos de ellas y cómo ayuda al usuario a interpretar el resultado.',
        ejemplo: 'En mi quiz, al responder solo cambiaba el número de la pregunta, y los estudiantes no sabían si habían acertado. Ahora la opción elegida se pinta de verde o rojo al instante, con una frase que explica por qué. Es inmediata e informativa, y como solo aparece al responder, no sobra.'
      },
      reflexion: '¿Qué momento de tu producto deja al usuario preguntándose “¿y ahora qué pasó?”?'
    },

    /* ======================= 6 · MODELO CONCEPTUAL ======================= */
    {
      id: 'modelo-conceptual', n: 6, icono: 'bulb', color: 'amber', brecha: 'ambas',
      termino: 'Modelo conceptual', en: 'Conceptual model',
      fuente: 'Norman (2013), cap. 1 · Modelos conceptuales e imagen del sistema',
      def: 'El modelo conceptual es una explicación, generalmente simplificada, de cómo funciona un producto. Quien diseña lo comunica a través de la imagen del sistema, y a partir de ella el usuario construye su modelo mental.',
      clave: 'No hay carpetas dentro del computador, pero el modelo de carpetas sirve.',
      explica: [
        'No necesita ser completo ni exacto, siempre que sea útil. Archivos, carpetas e íconos ayudan a entender cómo se guardan los documentos, aunque dentro del computador no existan carpetas.',
        'Quien diseña no puede hablar con cada usuario: solo le llega la imagen del sistema. Si esa imagen es incoherente o insuficiente, el usuario forma un modelo equivocado y comete errores aunque razone bien. Norman lo vivió con su nevera: dos controles parecían manejar cada compartimento por separado, pero uno fijaba la temperatura y el otro repartía el aire frío.'
      ],
      matices: [
        { t: 'Imagen del sistema', d: 'Todo lo que el usuario puede saber del producto: su apariencia, su comportamiento, las instrucciones, la retroalimentación, lo que le cuentan otros y lo que sabe de productos parecidos.' },
        { t: 'Modelo mental', d: 'La idea que el usuario se forma de cómo funciona el producto. El diseñador no la controla directamente; solo influye en ella a través de la imagen del sistema.' },
        { t: 'Coherencia', d: 'Si dos partes del producto sugieren funcionamientos distintos, el modelo mental se rompe. La coherencia entre pantallas, textos y comportamiento sostiene el modelo.' },
        { t: 'Cruza ambas brechas', d: 'Un buen modelo conceptual ayuda a planear qué hacer (ejecución) y a interpretar lo que pasó (evaluación).' }
      ],
      cotidiano: 'Muchas personas suben el termostato al máximo para calentar más rápido, como si fuera una llave de agua; en realidad solo fija la temperatura final.',
      producto: 'Los estudiantes creen que un documento compartido es una copia enviada al docente y siguen editando sin pensar que se ve; en realidad es el mismo archivo.',
      confusion: 'Pensar que el modelo conceptual es una descripción técnica completa, o que basta con que el diseñador lo entienda bien.',
      quiz: [
        { q: '¿Qué exige Norman de un modelo conceptual?',
          ops: [['Que sea completo y técnicamente exacto', 'No es necesario: puede ser simplificado e incluso inexacto.'],
                ['Que sea útil para entender y usar el producto', 'Correcto: su valor está en que ayude a usarlo y a predecir qué pasará.'],
                ['Que el usuario lo aprenda leyendo un manual', 'Se forma sobre todo con lo que el propio producto comunica.']],
          ok: 1, pista: 'Recuerda el ejemplo de las carpetas que no existen.' },
        { q: 'Alguien sube el termostato a 30 °C para que el cuarto se caliente más rápido. ¿Qué revela?',
          ops: [['Un modelo mental equivocado del termostato', 'Exacto: lo trata como una llave de cantidad, no como un objetivo de temperatura.'],
                ['Falta de retroalimentación', 'Puede haberla; el problema es cómo cree que funciona el aparato.'],
                ['Una restricción cultural', 'No es una convención aprendida: es una explicación personal equivocada.']],
          ok: 0, pista: '¿Cómo cree esa persona que funciona el aparato?' },
        { q: '¿Qué es la imagen del sistema?',
          ops: [['El logo y la paleta de colores del producto', 'Es mucho más que la identidad visual.'],
                ['Toda la información disponible para el usuario sobre el producto', 'Correcto: apariencia, comportamiento, instrucciones, retroalimentación y más.'],
                ['El diagrama técnico que usa el equipo de desarrollo', 'El usuario no ve ese diagrama; ve lo que el producto comunica.']],
          ok: 1, pista: 'Piensa en todo lo que te ayuda a hacerte una idea de un producto que no diseñaste.' },
        { q: 'Una app guarda sola cada cambio, pero tiene un botón “Guardar” que no hace nada. ¿Qué problema genera?',
          ops: [['Ninguno: el botón da tranquilidad', 'Da una imagen incoherente: sugiere que, sin presionarlo, el trabajo se pierde.'],
                ['Una imagen del sistema incoherente que forma un modelo mental equivocado', 'Exacto: el usuario cree que debe guardar a mano y desconfía del guardado automático.'],
                ['Un exceso de restricciones', 'No limita ninguna acción; comunica un funcionamiento que no es el real.']],
          ok: 1, pista: '¿Qué cree el usuario sobre cómo se guarda su trabajo al ver ese botón?' }
      ],
      caso: {
        titulo: 'Bitácora colaborativa · proyecto de aula',
        contexto: 'Equipos de estudiantes escriben juntos y el docente revisa. Toca los elementos que hacen que el usuario se forme una idea equivocada de cómo funciona la bitácora.',
        pantalla: 'Bitácora del equipo',
        zonas: [
          { id: 'guardar', problema: true, html: '<span class="m-btn m-flat">💾 Guardar</span><div class="m-cap">La bitácora ya guarda sola cada cambio</div>',
            fb: 'Un botón que no hace nada sugiere que el trabajo se pierde si no se presiona: imagen incoherente con el funcionamiento real.' },
          { id: 'dos-botones', problema: true, html: '<div class="m-row"><span class="m-btn">Enviar al docente</span><span class="m-btn m-flat">Compartir</span></div><div class="m-cap">Ambos hacen lo mismo</div>',
            fb: 'Dos controles distintos para lo mismo hacen pensar que son dos procesos diferentes. Unifícalos con un solo nombre.' },
          { id: 'estado', problema: false, html: '<div class="m-ok">☁ Tu equipo y el docente ven esta misma versión</div>',
            fb: 'Explica de forma simple cómo funciona: un solo documento compartido. Forma un modelo útil.' },
          { id: 'ayuda', problema: true, html: '<div class="m-text">Ayuda: “Para entregar, ve a Menú › Archivo › Enviar”</div><div class="m-cap">Ese menú ya no existe</div>',
            fb: 'La ayuda desactualizada es parte de la imagen del sistema y contradice la pantalla. El usuario cree que algo se dañó.' },
          { id: 'autores', problema: false, html: '<div class="m-row"><span class="m-avatar">AL</span><span class="m-avatar">JD</span><span class="m-avatar">IR</span><span class="m-text">editando ahora</span></div>',
            fb: 'Mostrar quién está editando refuerza el modelo de “un mismo documento para todos”.' }
        ]
      },
      aplica: {
        donde: 'Explica en dos o tres frases cómo funciona tu producto, como se lo contarías a un usuario. ¿Qué elementos de la interfaz transmiten esa idea?',
        problema: '¿Qué podría creer un usuario que no corresponde a cómo funciona realmente? ¿Qué parte de la imagen del sistema lo confundiría?',
        ajuste: '¿Qué cambiarías en pantallas, textos, comportamiento o ayudas para que el usuario se forme una idea útil?',
        porque: '¿Por qué ese ajuste aplica el principio de modelo conceptual?',
        claves: ['modelo', 'mental', 'imagen del sistema', 'funciona', 'idea', 'cree', 'entiende', 'coheren', 'explica', 'simplific', 'metafor', 'consisten'],
        guia: 'Separa tres cosas en tu justificación: cómo funciona tu producto (tu modelo conceptual), qué cree el usuario (su modelo mental) y qué parte de la imagen del sistema conecta o separa a los dos. El ajuste debe hacer la imagen más coherente con el funcionamiento real.',
        ejemplo: 'En mi plataforma de lecturas, el progreso se guarda por libro, pero la pantalla de inicio mostraba un solo porcentaje global, y los estudiantes creían que habían perdido su avance al cambiar de libro. Ahora cada portada muestra su propia barra de avance. La imagen del sistema refleja cómo funciona realmente, así que el modelo mental del estudiante coincide con el modelo conceptual.'
      },
      reflexion: '¿Cómo explicarías tu producto en una frase a alguien que nunca lo ha visto?'
    }
  ],

  // Diagnóstico inicial: una situación por principio
  DIAGNOSTICO: [
    { p: 'affordances', q: 'Un juego para niños de 5 años exige trazar líneas con mucha precisión. Muchos no logran hacerlo. ¿Qué explica mejor el problema?',
      ops: ['Los niños no prestan atención', 'La acción no es posible para las capacidades de esos usuarios', 'El juego tiene pocos colores'], ok: 1 },
    { p: 'significantes', q: 'Una función útil de tu app existe, pero ningún usuario la usa porque no sabe que está ahí. ¿Qué falta?',
      ops: ['Una señal que comunique dónde y cómo hacerla', 'Más funciones', 'Un manual más largo'], ok: 0 },
    { p: 'restricciones', q: 'Un formulario deja escribir cualquier cosa en el campo “edad”, incluso letras. ¿Qué principio ayudaría a evitar el error?',
      ops: ['Retroalimentación', 'Mapeo', 'Restricciones'], ok: 2 },
    { p: 'mapeo', q: 'El menú de un curso lista las unidades en un orden distinto al que se estudian. ¿Qué principio se ve afectado?',
      ops: ['Mapeo', 'Affordances', 'Modelo conceptual'], ok: 0 },
    { p: 'retroalimentacion', q: 'Al presionar “Calificar”, la pantalla no cambia y el docente presiona varias veces. ¿Qué falta?',
      ops: ['Un significante', 'Retroalimentación', 'Una restricción cultural'], ok: 1 },
    { p: 'modelo-conceptual', q: 'Los estudiantes creen que borrar un archivo de su carpeta lo borra también de la carpeta del docente, y no es así. ¿Qué principio revisarías?',
      ops: ['Modelo conceptual', 'Mapeo', 'Restricciones'], ok: 0 }
  ],

  // Integración: los seis principios aplicados al producto del estudiante
  INTEGRACION: {
    intro: 'Consolida tus ajustes y argumenta tus decisiones de diseño frente a los seis principios.',
    preguntas: [
      '¿Qué principio te hizo cambiar más tu producto y por qué?',
      '¿Qué decisión de diseño mantendrías aunque un compañero te pidiera cambiarla? Argumenta con un principio.',
      '¿Qué te gustaría probar con usuarios reales para saber si tus ajustes funcionan?'
    ]
  }
};

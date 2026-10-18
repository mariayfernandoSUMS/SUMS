/**
 * FINANZAS – backend en Google Apps Script
 *
 * 1) Ejecuta configurar() una vez: crea las pestañas, la tarea diaria de recurrentes y te da tu clave secreta.
 * 2) Implementa como "Aplicación web" (Ejecutar como: Yo · Acceso: Cualquier usuario).
 * 3) La URL /exec sirve la app (GET), da las listas a los atajos (GET ?accion=listas) y recibe movimientos (POST).
 *
 * Todo lo que vas a querer cambiar (categorías, métodos, personas, reglas, recurrentes) se cambia EN LA HOJA.
 * Los valores de abajo solo rellenan las pestañas la primera vez.
 */

// ── Valores iniciales ────────────────────────────────────────────────────────
const PERSONAS_INICIALES = ['Yo', 'Pareja'];
const METODOS_INICIALES = ['Apple Pay', 'Tarjeta', 'Bizum', 'Efectivo', 'Transferencia', 'Domiciliación'];

// [Tipo, Categoría, Subcategoría, Detalle]
const CATEGORIAS_INICIALES = [
  ['Gasto', 'Vivienda', 'Hipoteca', ''],
  ['Gasto', 'Vivienda', 'Comunidad', ''],
  ['Gasto', 'Vivienda', 'Suministros', 'Luz'],
  ['Gasto', 'Vivienda', 'Suministros', 'Agua'],
  ['Gasto', 'Vivienda', 'Suministros', 'Gas'],
  ['Gasto', 'Vivienda', 'Hogar', 'Decoración'],
  ['Gasto', 'Vivienda', 'Hogar', 'Mantenimiento y reparaciones'],
  ['Gasto', 'Coche', 'Combustible', 'Gasoil'],
  ['Gasto', 'Coche', 'Combustible', 'AdBlue'],
  ['Gasto', 'Coche', 'Mantenimiento', 'Taller'],
  ['Gasto', 'Coche', 'Mantenimiento', 'Lavado'],
  ['Gasto', 'Coche', 'Mantenimiento', 'ITV'],
  ['Gasto', 'Alimentación', 'Supermercado', ''],
  ['Gasto', 'Telecomunicaciones y suscripciones', 'Móvil y TV', ''],
  ['Gasto', 'Telecomunicaciones y suscripciones', 'Suscripciones', 'Spotify'],
  ['Gasto', 'Telecomunicaciones y suscripciones', 'Suscripciones', 'iCloud'],
  ['Gasto', 'Telecomunicaciones y suscripciones', 'Suscripciones', 'Goodnotes 6'],
  ['Gasto', 'Telecomunicaciones y suscripciones', 'Suscripciones', 'Claude'],
  ['Gasto', 'Cuidado personal', 'Salud', 'Dentista'],
  ['Gasto', 'Cuidado personal', 'Salud', 'Farmacia'],
  ['Gasto', 'Cuidado personal', 'Salud', 'Podólogo'],
  ['Gasto', 'Cuidado personal', 'Salud', 'Médicos y otros'],
  ['Gasto', 'Cuidado personal', 'Belleza', 'Cosmética y cremas'],
  ['Gasto', 'Cuidado personal', 'Belleza', 'Maquillaje'],
  ['Gasto', 'Cuidado personal', 'Belleza', 'Peluquería'],
  ['Gasto', 'Cuidado personal', 'Belleza', 'Uñas'],
  ['Gasto', 'Cuidado personal', 'Deporte', 'Cuotas y gimnasio'],
  ['Gasto', 'Cuidado personal', 'Deporte', 'Material'],
  ['Gasto', 'Compras', 'Ropa', 'Ropa'],
  ['Gasto', 'Compras', 'Ropa', 'Calzado'],
  ['Gasto', 'Compras', 'Ropa', 'Accesorios'],
  ['Gasto', 'Compras', 'Tecnología', ''],
  ['Gasto', 'Compras', 'Juegos', ''],
  ['Gasto', 'Ocio', 'Restaurantes y cafés', 'Restaurantes'],
  ['Gasto', 'Ocio', 'Restaurantes y cafés', 'Cafés (uni)'],
  ['Gasto', 'Ocio', 'Planes', 'Cine'],
  ['Gasto', 'Ocio', 'Planes', 'Conciertos'],
  ['Gasto', 'Ocio', 'Planes', 'Actividades'],
  ['Gasto', 'Ocio', 'Viajes', 'Transporte'],
  ['Gasto', 'Ocio', 'Viajes', 'Alojamiento'],
  ['Gasto', 'Ocio', 'Viajes', 'Comidas y actividades'],
  ['Gasto', 'Impuestos y tasas', 'IBI', ''],
  ['Gasto', 'Impuestos y tasas', 'Circulación', ''],
  ['Gasto', 'Impuestos y tasas', 'Basuras', ''],
  ['Gasto', 'Impuestos y tasas', 'Renta', ''],
  ['Gasto', 'Impuestos y tasas', 'Otros impuestos y tasas', 'Vado'],
  ['Gasto', 'Impuestos y tasas', 'Otros impuestos y tasas', 'ITP'],
  ['Gasto', 'Impuestos y tasas', 'Otros impuestos y tasas', 'Plusvalía'],
  ['Gasto', 'Impuestos y tasas', 'Otros impuestos y tasas', 'DNI y carnet'],
  ['Gasto', 'Impuestos y tasas', 'Otros impuestos y tasas', 'Multas'],
  ['Gasto', 'Sin clasificar', '', ''],
  ['Ingreso', 'Nómina', 'Yo', ''],
  ['Ingreso', 'Nómina', 'Pareja', ''],
  ['Ingreso', 'Paga extra', 'Yo', ''],
  ['Ingreso', 'Paga extra', 'Pareja', ''],
  ['Ingreso', 'Regalos', 'Familia', ''],
  ['Ingreso', 'Regalos', 'Otros', ''],
  ['Ingreso', 'Devolución de Hacienda', '', ''],
  ['Ingreso', 'Ventas de segunda mano', '', ''],
  ['Ingreso', 'Intereses y rendimientos', '', ''],
  ['Ingreso', 'Otros ingresos', '', '']
];

// [Si el concepto contiene…, Categoría, Subcategoría, Detalle]  (para la automatización de Apple Pay)
const REGLAS_INICIALES = [
  ['mercadona', 'Alimentación', 'Supermercado', ''], ['carrefour', 'Alimentación', 'Supermercado', ''],
  ['lidl', 'Alimentación', 'Supermercado', ''], ['aldi', 'Alimentación', 'Supermercado', ''],
  ['dia ', 'Alimentación', 'Supermercado', ''], ['eroski', 'Alimentación', 'Supermercado', ''],
  ['alcampo', 'Alimentación', 'Supermercado', ''], ['consum', 'Alimentación', 'Supermercado', ''],
  ['ahorramas', 'Alimentación', 'Supermercado', ''], ['hipercor', 'Alimentación', 'Supermercado', ''],
  ['repsol', 'Coche', 'Combustible', 'Gasoil'], ['cepsa', 'Coche', 'Combustible', 'Gasoil'],
  ['moeve', 'Coche', 'Combustible', 'Gasoil'], ['galp', 'Coche', 'Combustible', 'Gasoil'],
  ['ballenoil', 'Coche', 'Combustible', 'Gasoil'], ['plenoil', 'Coche', 'Combustible', 'Gasoil'],
  ['bp ', 'Coche', 'Combustible', 'Gasoil'], ['shell', 'Coche', 'Combustible', 'Gasoil'],
  ['lavado', 'Coche', 'Mantenimiento', 'Lavado'], ['itv', 'Coche', 'Mantenimiento', 'ITV'],
  ['farmacia', 'Cuidado personal', 'Salud', 'Farmacia'],
  ['druni', 'Cuidado personal', 'Belleza', 'Cosmética y cremas'], ['primor', 'Cuidado personal', 'Belleza', 'Cosmética y cremas'],
  ['sephora', 'Cuidado personal', 'Belleza', 'Maquillaje'],
  ['decathlon', 'Cuidado personal', 'Deporte', 'Material'],
  ['zara', 'Compras', 'Ropa', 'Ropa'], ['mango', 'Compras', 'Ropa', 'Ropa'], ['primark', 'Compras', 'Ropa', 'Ropa'],
  ['pull&bear', 'Compras', 'Ropa', 'Ropa'], ['bershka', 'Compras', 'Ropa', 'Ropa'], ['h&m', 'Compras', 'Ropa', 'Ropa'],
  ['media markt', 'Compras', 'Tecnología', ''], ['mediamarkt', 'Compras', 'Tecnología', ''], ['fnac', 'Compras', 'Tecnología', ''],
  ['game ', 'Compras', 'Juegos', ''],
  ['ikea', 'Vivienda', 'Hogar', 'Decoración'], ['maisons du monde', 'Vivienda', 'Hogar', 'Decoración'],
  ['zara home', 'Vivienda', 'Hogar', 'Decoración'], ['leroy merlin', 'Vivienda', 'Hogar', 'Mantenimiento y reparaciones'],
  ['bricomart', 'Vivienda', 'Hogar', 'Mantenimiento y reparaciones'],
  ['glovo', 'Ocio', 'Restaurantes y cafés', 'Restaurantes'], ['uber eats', 'Ocio', 'Restaurantes y cafés', 'Restaurantes'],
  ['just eat', 'Ocio', 'Restaurantes y cafés', 'Restaurantes'], ['restaurante', 'Ocio', 'Restaurantes y cafés', 'Restaurantes'],
  ['cafe', 'Ocio', 'Restaurantes y cafés', 'Cafés (uni)'], ['starbucks', 'Ocio', 'Restaurantes y cafés', 'Cafés (uni)'],
  ['cinesa', 'Ocio', 'Planes', 'Cine'], ['yelmo', 'Ocio', 'Planes', 'Cine'], ['kinepolis', 'Ocio', 'Planes', 'Cine'],
  ['ticketmaster', 'Ocio', 'Planes', 'Conciertos'],
  ['renfe', 'Ocio', 'Viajes', 'Transporte'], ['iryo', 'Ocio', 'Viajes', 'Transporte'], ['ouigo', 'Ocio', 'Viajes', 'Transporte'],
  ['ryanair', 'Ocio', 'Viajes', 'Transporte'], ['vueling', 'Ocio', 'Viajes', 'Transporte'], ['iberia', 'Ocio', 'Viajes', 'Transporte'],
  ['booking', 'Ocio', 'Viajes', 'Alojamiento'], ['airbnb', 'Ocio', 'Viajes', 'Alojamiento']
];

// ── No hace falta tocar nada de aquí hacia abajo ─────────────────────────────
const H = { MOV: 'Movimientos', CAT: 'Categorías', LIS: 'Listas', REG: 'Reglas', REC: 'Recurrentes', CUE: 'Cuentas' };
const TIPOS = ['Gasto', 'Ingreso', 'Reembolso', 'Traspaso'];
const CAB_MOV = ['ID', 'Fecha', 'Importe', 'Tipo', 'Concepto', 'Categoría', 'Subcategoría', 'Detalle',
  'Banco', 'Quién', 'Notas', 'Reembolso de (ID)', 'Origen', 'Banco destino'];
const CAB_REC = ['Activo', 'Concepto', 'Importe', 'Tipo', 'Categoría', 'Subcategoría', 'Detalle',
  'Banco', 'Quién', 'Día del mes', 'Último mes añadido', 'Banco destino'];
const C = { ID: 0, FECHA: 1, IMP: 2, TIPO: 3, CONC: 4, CAT: 5, SUB: 6, DET: 7, MET: 8, QUIEN: 9, NOTAS: 10, VINC: 11, ORIG: 12, DEST: 13 };

function configurar() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone('Europe/Madrid');
  const lista = l => SpreadsheetApp.newDataValidation().requireValueInList(l, true).setAllowInvalid(true).build();
  const rango = r => SpreadsheetApp.newDataValidation().requireValueInRange(r, true).setAllowInvalid(true).build();

  // Movimientos
  const mov = crearHoja_(ss, H.MOV, CAB_MOV, null, 0);
  mov.getRange('B:B').setNumberFormat('dd/mm/yyyy HH:mm');
  mov.getRange('C:C').setNumberFormat('#,##0.00 "€"');
  mov.setColumnWidth(5, 200);
  if (!String(mov.getRange('N1').getValue()).trim()) mov.getRange('N1').setValue('Banco destino').setFontWeight('bold').setBackground('#eef2f7');

  // Categorías
  crearHoja_(ss, H.CAT, ['Tipo', 'Categoría', 'Subcategoría', 'Detalle'], CATEGORIAS_INICIALES, 1)
    .getRange('A2:A').setDataValidation(lista(['Gasto', 'Ingreso']));

  // Listas (métodos y personas)
  const n = Math.max(METODOS_INICIALES.length, PERSONAS_INICIALES.length);
  const filas = [];
  for (let i = 0; i < n; i++) filas.push([METODOS_INICIALES[i] || '', PERSONAS_INICIALES[i] || '']);
  const lis = crearHoja_(ss, H.LIS, ['Métodos', 'Personas'], filas, 2);

  // Reglas
  crearHoja_(ss, H.REG, ['Si el concepto contiene…', 'Categoría', 'Subcategoría', 'Detalle'], REGLAS_INICIALES, 3);

  // Recurrentes (ejemplos desactivados)
  const ejemplos = [
    [false, 'Nómina', 1800, 'Ingreso', 'Nómina', 'Yo', '', 'Transferencia', PERSONAS_INICIALES[0], 28, ''],
    [false, 'Hipoteca', 650, 'Gasto', 'Vivienda', 'Hipoteca', '', 'Domiciliación', PERSONAS_INICIALES[0], 1, ''],
    [false, 'Spotify', 11.99, 'Gasto', 'Telecomunicaciones y suscripciones', 'Suscripciones', 'Spotify', 'Domiciliación', PERSONAS_INICIALES[0], 5, '']
  ];
  const rec = crearHoja_(ss, H.REC, CAB_REC, ejemplos, 4);
  rec.getRange('A2:A200').insertCheckboxes();
  rec.getRange('C:C').setNumberFormat('#,##0.00 "€"');
  rec.getRange('K:K').setNumberFormat('@');
  rec.getRange('K1').setNote('Lo rellena la hoja sola. Si activas un recurrente que ya has apuntado este mes, escribe aquí el mes actual (ej. 2026-10) para que no se duplique.');
  rec.getRange('A1').setNote('Marca la casilla para que se añada solo cada mes, el día indicado.');
  if (!String(rec.getRange('L1').getValue()).trim()) rec.getRange('L1').setValue('Banco destino').setFontWeight('bold').setBackground('#eef2f7');
  rec.getRange('L1').setNote('Solo para traspasos (Tipo = Traspaso): la cuenta a la que va el dinero. El banco de origen va en la columna Banco.');

  // Desplegables en Movimientos y Recurrentes
  [[mov, 'D', 'I', 'J', 'N'], [rec, 'D', 'H', 'I', 'L']].forEach(([h, t, m, q, dst]) => {
    h.getRange(t + '2:' + t).setDataValidation(lista(h === mov ? TIPOS : ['Gasto', 'Ingreso', 'Traspaso']));
    h.getRange(m + '2:' + m).setDataValidation(rango(lis.getRange('A2:A')));
    h.getRange(q + '2:' + q).setDataValidation(rango(lis.getRange('B2:B')));
    h.getRange(dst + '2:' + dst).setDataValidation(rango(lis.getRange('A2:A')));
  });

  // Tarea diaria para los recurrentes
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'procesarRecurrentes')) {
    ScriptApp.newTrigger('procesarRecurrentes').timeBased().everyDays(1).atHour(7).create();
  }

  const props = PropertiesService.getScriptProperties();
  let token = props.getProperty('TOKEN');
  if (!token) {
    token = Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    props.setProperty('TOKEN', token);
  }
  Logger.log('✅ Hoja lista. Tu clave secreta es: ' + token);
  return token;
}

function crearHoja_(ss, nombre, cabecera, filas, pos) {
  let h = ss.getSheetByName(nombre);
  if (h) return h;
  h = ss.insertSheet(nombre, pos);
  h.getRange(1, 1, 1, cabecera.length).setValues([cabecera]).setFontWeight('bold').setBackground('#eef2f7');
  h.setFrozenRows(1);
  if (filas && filas.length) h.getRange(2, 1, filas.length, cabecera.length).setValues(filas);
  return h;
}

// ── Web ──────────────────────────────────────────────────────────────────────
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.accion === 'listas') {      // para los atajos: …/exec?accion=listas&token=CLAVE
    try {
      comprobarToken_(p.token);
      const c = config_();
      // Atajos desordena las claves de los diccionarios: se añade «_orden» con la lista en el orden de la hoja
      const conOrden = arbol => {
        const o = { _orden: Object.keys(arbol) };
        Object.keys(arbol).forEach(cat => {
          const subs = arbol[cat];
          const s = { _orden: Object.keys(subs) };
          Object.keys(subs).forEach(sub => { s[sub] = subs[sub]; });
          o[cat] = s;
        });
        return o;
      };
      c.categorias = { Gasto: conOrden(c.categorias.Gasto), Ingreso: conOrden(c.categorias.Ingreso) };
      return json_(Object.assign({ ok: true }, c));
    }
    catch (err) { return json_({ ok: false, mensaje: '⚠️ ' + err.message }); }
  }
  const t = HtmlService.createTemplateFromFile('Index');
  // Clave y usuario opcionales en el enlace (…/exec?k=CLAVE&u=María) para no tener que escribirlos
  t.params = JSON.stringify({ k: String(p.k || ''), u: String(p.u || '') }).replace(/</g, '\\u003c');
  return t.evaluate()
    .setTitle('SUMS')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .addMetaTag('apple-mobile-web-app-capable', 'yes')
    .addMetaTag('mobile-web-app-capable', 'yes');
}

// Funciones que puede usar la app instalada (cada una comprueba la clave)
const API_APP_ = { api_datos: (...a) => api_datos(...a), api_agregar: (...a) => api_agregar(...a), api_editar: (...a) => api_editar(...a),
  api_borrar: (...a) => api_borrar(...a), api_ordenCuentas: (...a) => api_ordenCuentas(...a), api_listar: (...a) => api_listar(...a),
  api_importar: (...a) => api_importar(...a) };
function doPost(e) {
  try {
    let d = {};
    try { d = JSON.parse((e.postData && e.postData.contents) || '{}'); }
    catch (_) { d = e.parameter || {}; }
    // Llamadas de la app instalada (SUMS en GitHub Pages): { accion: 'api_datos', token, args: [...] }
    if (d.accion && API_APP_[d.accion]) return json_({ ok: true, datos: API_APP_[d.accion].apply(null, [d.token].concat(d.args || [])) });
    comprobarToken_(d.token);
    const m = agregar_(d, 'Atajo');
    const ruta = m.tipo === 'Traspaso' ? m.metodo + ' → ' + m.destino
      : [m.categoria, m.subcategoria, m.detalle].filter(String).join(' › ');
    return json_({ ok: true, mensaje: m.tipo + ' de ' + m.importe.toFixed(2).replace('.', ',') + ' € · ' + ruta });
  } catch (err) {
    return json_({ ok: false, mensaje: '⚠️ ' + err.message });
  }
}

// ── Funciones que llama la app ───────────────────────────────────────────────
function api_config(token) { comprobarToken_(token); return config_(); }

function api_listar(token) {
  comprobarToken_(token);
  const hoja = hoja_(H.MOV), tz = tz_();
  const vals = hoja.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < vals.length; i++) {
    const r = vals[i];
    if (r[C.IMP] === '' || r[C.IMP] === null) continue;
    const imp = parsearImporte_(r[C.IMP]);
    if (!isFinite(imp) || imp === 0) continue;
    if (!r[C.ID]) { r[C.ID] = nuevoId_(); hoja.getRange(i + 1, 1).setValue(r[C.ID]); }  // filas añadidas a mano
    const f = r[C.FECHA] instanceof Date ? r[C.FECHA] : parsearFecha_(r[C.FECHA]);
    out.push({
      id: String(r[C.ID]),
      fecha: Utilities.formatDate(f, tz, 'yyyy-MM-dd'),
      hora: Utilities.formatDate(f, tz, 'HH:mm'),
      importe: Math.abs(imp),
      tipo: normalizarTipo_(r[C.TIPO]),
      concepto: String(r[C.CONC] || 'Sin concepto'),
      categoria: String(r[C.CAT] || (normalizarTipo_(r[C.TIPO]) === 'Traspaso' ? 'Traspaso' : 'Sin clasificar')),
      subcategoria: String(r[C.SUB] || ''),
      detalle: String(r[C.DET] || ''),
      metodo: String(r[C.MET] || ''),
      quien: String(r[C.QUIEN] || ''),
      notas: String(r[C.NOTAS] || ''),
      origen: String(r[C.ORIG] || ''),
      vinculado: String(r[C.VINC] || ''),
      destino: String(r[C.DEST] || '')
    });
  }
  return out;
}

// Importación desde el extracto del banco: añade muchas filas de golpe (ya revisadas en la app)
function api_importar(token, filas) {
  comprobarToken_(token);
  if (!Array.isArray(filas) || !filas.length) return 0;
  const s = x => String(x == null ? '' : x).trim();
  const datos = filas.map(d => {
    const imp = Math.abs(parsearImporte_(d.importe));
    if (!isFinite(imp) || !imp) throw new Error('Importe no válido: ' + d.importe);
    const tipo = normalizarTipo_(d.tipo), tr = tipo === 'Traspaso';
    const f = parsearFecha_(d.fecha); f.setHours(12, 0, 0, 0);
    return [nuevoId_(), f, imp, tipo, s(d.concepto) || 'Sin concepto', tr ? '' : s(d.categoria) || (tipo === 'Ingreso' ? 'Otros ingresos' : 'Sin clasificar'),
      tr ? '' : s(d.subcategoria), tr ? '' : s(d.detalle), s(d.metodo), s(d.quien), s(d.notas), '', 'Importado', tr ? s(d.destino) : ''];
  });
  conBloqueo_(() => {
    const h = hoja_(H.MOV);
    h.getRange(h.getLastRow() + 1, 1, datos.length, CAB_MOV.length).setValues(datos);
  });
  return datos.length;
}
function api_agregar(token, d) { comprobarToken_(token); agregar_(d, 'App'); return true; }

function api_editar(token, id, d) {
  comprobarToken_(token);
  return conBloqueo_(() => {
    const { hoja, fila } = buscar_(id);
    const actual = hoja.getRange(fila, 1, 1, CAB_MOV.length).getValues()[0];
    const v = validar_(d, actual[C.FECHA] instanceof Date ? actual[C.FECHA] : null);
    hoja.getRange(fila, 2, 1, 11).setValues([[v.fecha, v.importe, v.tipo, v.concepto, v.categoria, v.subcategoria,
      v.detalle, v.metodo, v.quien, v.notas, v.vinculado]]);
    hoja.getRange(fila, C.DEST + 1).setValue(v.destino);
    return true;
  });
}

function api_borrar(token, id) {
  comprobarToken_(token);
  return conBloqueo_(() => {
    const { hoja, fila } = buscar_(id);
    hoja.deleteRow(fila);
    return true;
  });
}

// Todo lo que necesita la app SUMS en una sola llamada
function api_datos(token) {
  comprobarToken_(token);
  // La primera vez que se abre la app con esta versión, crea la columna «Icono» en Categorías
  try { const hc = SpreadsheetApp.getActive().getSheetByName(H.CAT); if (hc && colPorTitulo_(hc, 'icono') < 0) ponerIconos(); } catch (e) {}
  return { movs: api_listar(token), cuentas: cuentas_(), recurrentes: recurrentesActivos_(), config: config_() };
}

// Guarda el orden de las cuentas (las filas de la pestaña Cuentas) según la lista recibida
function api_ordenCuentas(token, orden) {
  comprobarToken_(token);
  return conBloqueo_(() => {
    const h = SpreadsheetApp.getActive().getSheetByName(H.CUE);
    if (!h || h.getLastRow() < 3) return true;
    const ancho = h.getLastColumn(), n = h.getLastRow() - 1;
    const filas = h.getRange(2, 1, n, ancho).getValues();
    const iB = colPorTitulo_(h, 'banco');
    const pos = b => { const i = orden.indexOf(String(b).trim()); return i < 0 ? 999 : i; };
    filas.sort((a, b) => pos(a[iB]) - pos(b[iB]));
    h.getRange(2, 1, n, ancho).setValues(filas);
    return true;
  });
}

function colPorTitulo_(h, texto) {
  const cab = h.getRange(1, 1, 1, Math.max(1, h.getLastColumn())).getValues()[0].map(x => sinAcentos_(x).trim());
  return cab.findIndex(x => x.indexOf(texto) > -1);
}

function cuentas_() {
  const h = SpreadsheetApp.getActive().getSheetByName(H.CUE);
  if (!h || h.getLastRow() < 2) return [];
  const iB = colPorTitulo_(h, 'banco'), iS = colPorTitulo_(h, 'saldo'), iF = colPorTitulo_(h, 'fecha'), iL = colPorTitulo_(h, 'logo');
  if (iB < 0) return [];
  const tz = tz_();
  return h.getRange(2, 1, h.getLastRow() - 1, h.getLastColumn()).getValues()
    .filter(r => String(r[iB]).trim())
    .map(r => {
      const f = iF > -1 ? (r[iF] instanceof Date ? r[iF] : parsearFecha_(r[iF])) : null;
      return {
        banco: String(r[iB]).trim(),
        saldoInicial: iS > -1 ? (parsearImporte_(r[iS]) || 0) : 0,
        fecha: f ? Utilities.formatDate(f, tz, 'yyyy-MM-dd') : '2000-01-01',
        logo: iL > -1 ? logo_(String(r[iL]).trim()) : ''
      };
    });
}

// Lee la imagen del logo desde tu Google Drive y la devuelve lista para mostrar (se guarda 6 h en caché)
function logo_(enlace) {
  if (!enlace) return '';
  const m = enlace.match(/\/d\/([\w-]{20,})/) || enlace.match(/[?&]id=([\w-]{20,})/);
  if (!m) return /^https?:\/\//.test(enlace) ? enlace : '';
  const cache = CacheService.getScriptCache(), clave = 'logo_' + m[1];
  const enCache = cache.get(clave);
  if (enCache) return enCache;
  try {
    const blob = DriveApp.getFileById(m[1]).getBlob();
    const uri = 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
    if (uri.length < 95000) cache.put(clave, uri, 21600);
    return uri;
  } catch (e) {
    return '';
  }
}

// Lee Recurrentes por el título de cada columna (si alguna se ha movido sigue funcionando).
// «Activo» acepta casilla marcada, Sí, X, TRUE o 1.
function leerRecurrentes_() {
  const h = SpreadsheetApp.getActive().getSheetByName(H.REC);
  if (!h || h.getLastRow() < 2) return [];
  const tz = tz_(), nc = Math.max(h.getLastColumn(), CAB_REC.length);
  const col = (t, def) => { const i = colPorTitulo_(h, t); return i > -1 ? i : def; };
  const K = { act: col('activo', 0), conc: col('concepto', 1), imp: col('importe', 2), tipo: col('tipo', 3), cat: col('categor', 4),
    sub: col('subcategor', 5), det: col('detalle', 6), banco: col('banco', 7), quien: col('quien', 8), dia: col('dia', 9),
    ult: col('ultimo', 10), dest: col('destino', 11) };
  if (K.banco === K.dest) K.banco = 7;                       // «Banco destino» también contiene «banco»
  const vals = h.getRange(2, 1, h.getLastRow() - 1, nc).getValues();
  const activo = v => v === true || v === 1 || ['si', 'sí', 'x', 'true', 'verdadero', '1', 'yes'].indexOf(String(v).trim().toLowerCase()) > -1;
  const out = [];
  vals.forEach((r, i) => {
    const imp = parsearImporte_(r[K.imp]);
    if (!activo(r[K.act]) || !isFinite(imp) || !imp) return;
    const ult = r[K.ult];
    out.push({ fila: i + 2, colUlt: K.ult + 1,
      concepto: String(r[K.conc] || ''), importe: Math.abs(imp), tipo: normalizarTipo_(r[K.tipo] || 'Gasto'),
      categoria: String(r[K.cat] || ''), subcategoria: String(r[K.sub] || ''), detalle: String(r[K.det] || ''),
      banco: String(r[K.banco] || ''), quien: String(r[K.quien] || ''),
      dia: Math.min(31, Math.max(1, parseInt(r[K.dia] instanceof Date ? r[K.dia].getDate() : r[K.dia], 10) || 1)),
      ultimo: ult instanceof Date ? Utilities.formatDate(ult, tz, 'yyyy-MM') : String(ult || '').trim().slice(0, 7),
      destino: String(r[K.dest] || '') });
  });
  return out;
}
function recurrentesActivos_() {
  return leerRecurrentes_().map(r => { const o = Object.assign({}, r); delete o.fila; delete o.colUlt; return o; });
}

// Añade los recurrentes cuyo día ya ha llegado este mes (lo lanza un activador diario)
function procesarRecurrentes() {
  const h = SpreadsheetApp.getActive().getSheetByName(H.REC);
  if (!h) return 0;
  const tz = tz_(), hoy = new Date();
  const mes = Utilities.formatDate(hoy, tz, 'yyyy-MM');
  const y = +Utilities.formatDate(hoy, tz, 'yyyy'), m = +Utilities.formatDate(hoy, tz, 'M'), dHoy = +Utilities.formatDate(hoy, tz, 'd');
  const diasMes = new Date(y, m, 0).getDate();
  let n = 0;
  leerRecurrentes_().forEach(r => {
    const dia = Math.min(r.dia, diasMes);
    if (dHoy < dia || r.ultimo === mes) return;
    agregar_({ concepto: r.concepto, importe: r.importe, tipo: r.tipo, categoria: r.categoria, subcategoria: r.subcategoria, detalle: r.detalle,
      metodo: r.banco, quien: r.quien, destino: r.destino, fecha: new Date(y, m - 1, dia, 9, 0), notas: 'Automático' }, 'Recurrente');
    h.getRange(r.fila, r.colUlt).setNumberFormat('@').setValue(mes);
    n++;
  });
  return n;
}

// ── Lógica interna ───────────────────────────────────────────────────────────
// Emojis propuestos para las categorías (se buscan por el nombre de la categoría, subcategoría o detalle)
const ICONOS_PROPUESTOS = {
  'vivienda': '🏠', 'hipoteca': '🏦', 'comunidad': '🏢', 'seguro casa': '🛡️', 'suministros': '🔌', 'luz': '💡', 'agua': '💧', 'gas': '🔥',
  'hogar': '🛋️', 'decoracion': '🛋️', 'reparaciones': '🔧', 'mantenimiento': '🔧',
  'coche': '🚗', 'combustible': '⛽', 'gasoil': '⛽', 'gasolina': '⛽', 'adblue': '🧪', 'taller': '🔧', 'lavado': '🧽', 'itv': '📋', 'seguro coche': '🛡️', 'parking': '🅿️', 'peaje': '🛣️',
  'alimentacion': '🛒', 'supermercado': '🛒',
  'suscripciones': '🔁', 'suscripcion': '🔁', 'telecomunicaciones': '📱', 'movil': '📱', 'spotify': '🎵', 'icloud': '☁️', 'goodnotes': '📝', 'claude': '🤖', 'netflix': '🎬',
  'cuidado personal': '💆', 'salud': '🩺', 'dentista': '🦷', 'farmacia': '💊', 'podologo': '🦶', 'medicos': '🩺', 'belleza': '💄', 'cosmetica': '🧴',
  'maquillaje': '💄', 'peluqueria': '💇', 'unas': '💅', 'deporte': '🏋️', 'cuotas': '🏋️', 'gimnasio': '🏋️', 'material': '👟',
  'compras': '🛍️', 'ropa': '👕', 'calzado': '👟', 'accesorios': '👜', 'tecnologia': '💻', 'juegos': '🎮', 'regalo': '🎁',
  'ocio': '🎉', 'restaurantes': '🍽️', 'cafeterias': '☕', 'cafes': '☕', 'cafe': '☕', 'planes': '🎟️', 'cine': '🎬', 'conciertos': '🎤', 'actividades': '🎯',
  'viajes': '✈️', 'transporte': '🚆', 'alojamiento': '🏨', 'comidas': '🍴',
  'impuestos': '🧾', 'ibi': '🏛️', 'circulacion': '🚘', 'basuras': '🗑️', 'renta': '🧾', 'vado': '🚧', 'itp': '📄', 'plusvalia': '📄', 'dni': '🪪', 'multas': '🚨',
  'papeleria': '📚', 'copisteria': '📚', 'libros': '📚', 'material escolar': '📚',
  'sin clasificar': '❓', 'mascotas': '🐾', 'educacion': '🎓', 'bancos': '🏦', 'comisiones': '🏦',
  'nomina': '💸', 'paga extra': '💶', 'regalos': '🎁', 'familia': '👨‍👩‍👧', 'devolucion de hacienda': '🏛️', 'hacienda': '🏛️', 'ventas': '🏷️',
  'intereses': '📈', 'rendimientos': '📈', 'otros ingresos': '💰'
};
function iconoPropuesto_(nombre) {
  const n = sinAcentos_(nombre).trim();
  if (!n) return '';
  if (ICONOS_PROPUESTOS[n]) return ICONOS_PROPUESTOS[n];
  const k = Object.keys(ICONOS_PROPUESTOS).sort((a, b) => b.length - a.length).find(x => new RegExp('(^|[^a-z])' + x + '([^a-z]|$)').test(n));
  return k ? ICONOS_PROPUESTOS[k] : '';
}

// Ejecútala una vez: añade la columna «Icono» a Categorías y la rellena con una propuesta (no toca las celdas que ya tengan algo)
function ponerIconos() {
  const h = SpreadsheetApp.getActive().getSheetByName(H.CAT);
  if (!h || h.getLastRow() < 2) throw new Error('No encuentro la pestaña Categorías');
  let col = colPorTitulo_(h, 'icono');
  if (col < 0) {
    col = h.getLastColumn();
    h.getRange(1, col + 1).setValue('Icono').setFontWeight('bold').setBackground(h.getRange(1, 1).getBackground());
    h.getRange(1, col + 1).setNote('Un emoji por fila. Se usa para los movimientos con esa categoría/subcategoría/detalle. ' +
      'Para cambiar el icono de una categoría entera, añade una fila solo con el Tipo y la Categoría y pon ahí su emoji.');
  }
  const n = h.getLastRow() - 1, filas = h.getRange(2, 1, n, 4).getValues(), cel = h.getRange(2, col + 1, n, 1), act = cel.getValues();
  const nuevos = filas.map((r, i) => [String(act[i][0]).trim() || iconoPropuesto_(r[3]) || iconoPropuesto_(r[2]) || iconoPropuesto_(r[1])]);
  cel.setValues(nuevos).setHorizontalAlignment('center');
  h.setColumnWidth(col + 1, 60);
  return nuevos.filter(x => x[0]).length;
}

function config_() {
  const arbol = { Gasto: {}, Ingreso: {} };
  const hc = SpreadsheetApp.getActive().getSheetByName(H.CAT);
  let filas = CATEGORIAS_INICIALES, colFijo = -1, colIco = -1;
  if (hc && hc.getLastRow() > 1) {
    const ancho = Math.max(4, hc.getLastColumn());
    const cab = hc.getRange(1, 1, 1, ancho).getValues()[0].map(x => sinAcentos_(x));
    colFijo = cab.findIndex(x => x.indexOf('fijo') > -1);
    colIco = cab.findIndex(x => x.indexOf('icono') > -1);
    filas = hc.getRange(2, 1, hc.getLastRow() - 1, ancho).getValues();
  }
  const fijos = [], iconos = {};
  filas.forEach(r => {
    if (colIco > -1 && String(r[colIco]).trim() && String(r[1]).trim())
      iconos[[String(r[1]).trim(), String(r[2]).trim(), String(r[3]).trim()].join('|')] = String(r[colIco]).trim();
    if (colFijo > -1 && /^fijo/i.test(String(r[colFijo]).trim()) && String(r[1]).trim())
      fijos.push([String(r[1]).trim(), String(r[2]).trim(), String(r[3]).trim()].join('|'));
    const t = /ingreso/i.test(r[0]) ? 'Ingreso' : 'Gasto';
    const cat = String(r[1]).trim(), sub = String(r[2]).trim(), det = String(r[3]).trim();
    if (!cat) return;
    arbol[t][cat] = arbol[t][cat] || {};
    if (!sub) return;
    arbol[t][cat][sub] = arbol[t][cat][sub] || [];
    if (det && arbol[t][cat][sub].indexOf(det) < 0) arbol[t][cat][sub].push(det);
  });
  // Lo que no tenga emoji en la hoja usa la propuesta según su nombre
  Object.keys(arbol).forEach(t => Object.keys(arbol[t]).forEach(cat => {
    const pon = (k, nombre) => { if (!iconos[k]) { const e = iconoPropuesto_(nombre); if (e) iconos[k] = e; } };
    pon(cat + '||', cat);
    Object.keys(arbol[t][cat]).forEach(sub => { pon(cat + '|' + sub + '|', sub); arbol[t][cat][sub].forEach(det => pon(cat + '|' + sub + '|' + det, det)); });
  }));
  const hl = SpreadsheetApp.getActive().getSheetByName(H.LIS);
  let metodos = METODOS_INICIALES, personas = PERSONAS_INICIALES;
  if (hl && hl.getLastRow() > 1) {
    const v = hl.getRange(2, 1, hl.getLastRow() - 1, 2).getValues();
    metodos = v.map(r => String(r[0]).trim()).filter(Boolean);
    personas = v.map(r => String(r[1]).trim()).filter(Boolean);
  }
  // Reglas de categorización (para que la app pueda proponer categorías al importar)
  const hr = SpreadsheetApp.getActive().getSheetByName(H.REG);
  const reglas = hr && hr.getLastRow() > 1 ? hr.getRange(2, 1, hr.getLastRow() - 1, 4).getValues()
    .filter(r => String(r[0]).trim() && String(r[1]).trim()).map(r => [String(r[0]), String(r[1]).trim(), String(r[2]).trim(), String(r[3]).trim()]) : [];
  return { categorias: arbol, metodos, personas, fijos, iconos, reglas };
}

function agregar_(d, origen) {
  const v = validar_(d, null);
  return conBloqueo_(() => {
    hoja_(H.MOV).appendRow([nuevoId_(), v.fecha, v.importe, v.tipo, v.concepto, v.categoria, v.subcategoria,
      v.detalle, v.metodo, v.quien, v.notas, v.vinculado, origen, v.destino]);
    return v;
  });
}

function validar_(d, base) {
  const imp = parsearImporte_(d.importe);
  if (!isFinite(imp) || imp === 0) throw new Error('Importe no válido: ' + d.importe);
  const tipo = normalizarTipo_(d.tipo);
  const s = x => String(x == null ? '' : x).trim();
  let cat = s(d.categoria), sub = s(d.subcategoria), det = s(d.detalle);
  const vinculado = s(d.vinculado);
  let destino = s(d.destino);

  // Traspaso entre tus cuentas: no es gasto ni ingreso, solo mueve dinero de un banco a otro
  if (tipo === 'Traspaso') {
    const origenB = bancoNormal_(s(d.metodo));
    destino = bancoNormal_(destino);
    if (!origenB || !destino) throw new Error('Un traspaso necesita banco de origen y de destino');
    if (origenB === destino) throw new Error('El banco de origen y el de destino son el mismo');
    let fechaT = d.fecha ? parsearFecha_(d.fecha, base) : new Date();
    if (!base && !(d.fecha instanceof Date) &&
        Utilities.formatDate(fechaT, tz_(), 'yyyy-MM-dd') === Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd')) fechaT = new Date();
    return {
      fecha: fechaT, tipo, importe: Math.abs(imp),
      concepto: s(d.concepto) || 'Traspaso ' + origenB + ' → ' + destino,
      categoria: '', subcategoria: '', detalle: '',
      metodo: origenB, destino, quien: s(d.quien) || config_().personas[0] || '',
      notas: s(d.notas), vinculado: ''
    };
  }
  destino = '';

  // Un reembolso vinculado hereda la categoría del gasto original
  if (!cat && vinculado) {
    try {
      const { hoja, fila } = buscar_(vinculado);
      const o = hoja.getRange(fila, 1, 1, CAB_MOV.length).getValues()[0];
      cat = s(o[C.CAT]); sub = s(o[C.SUB]); det = s(o[C.DET]);
    } catch (_) {}
  }
  let concepto = s(d.concepto) || s(d.comercio);
  if (!concepto && cat) {   // sin concepto: se usa la categoría (ej. «Nómina · Yo», «Luz»)
    concepto = tipo === 'Ingreso' ? [cat, sub].filter(Boolean).join(' · ') : (det || sub || cat);
    if (tipo === 'Reembolso') concepto = 'Reembolso · ' + concepto;
  }
  concepto = concepto || 'Sin concepto';
  if (!cat && tipo !== 'Ingreso') {
    const r = categorizar_(concepto);
    if (r) { cat = r[0]; sub = r[1]; det = r[2]; }
  }
  if (!cat) cat = tipo === 'Ingreso' ? 'Otros ingresos' : 'Sin clasificar';

  let fecha = d.fecha ? parsearFecha_(d.fecha, base) : new Date();
  const tz = tz_();
  if (!base && !(d.fecha instanceof Date) &&
      Utilities.formatDate(fecha, tz, 'yyyy-MM-dd') === Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd')) {
    fecha = new Date();   // si es de hoy, guarda también la hora
  }
  return {
    fecha, tipo, concepto, importe: Math.abs(imp),
    categoria: cat, subcategoria: sub, detalle: det,
    metodo: bancoNormal_(s(d.metodo)), quien: s(d.quien) || config_().personas[0] || '',
    notas: s(d.notas), vinculado, destino
  };
}

// Convierte el nombre de una tarjeta («BBVA Visa Débito») en el banco de la pestaña Listas («BBVA»)
function bancoNormal_(x) {
  if (!x) return '';
  const bancos = config_().metodos, t = sinAcentos_(x).trim();
  const exacto = bancos.find(b => sinAcentos_(b).trim() === t);
  if (exacto) return exacto;
  const parecido = bancos.filter(b => sinAcentos_(b).trim().length > 1)
    .sort((a, b) => b.length - a.length)
    .find(b => t.indexOf(sinAcentos_(b).trim()) > -1);
  return parecido || x;
}

function categorizar_(concepto) {
  const hoja = SpreadsheetApp.getActive().getSheetByName(H.REG);
  if (!hoja || hoja.getLastRow() < 2) return null;
  const texto = ' ' + sinAcentos_(concepto) + ' ';
  const reglas = hoja.getRange(2, 1, hoja.getLastRow() - 1, 4).getValues()
    .filter(r => String(r[0]).trim() && String(r[1]).trim())
    .map(r => [sinAcentos_(r[0]).replace(/^\s+/, ''), String(r[1]).trim(), String(r[2]).trim(), String(r[3]).trim()])
    .sort((a, b) => b[0].length - a[0].length);   // las coincidencias más largas primero
  // La palabra tiene que empezar en un inicio de palabra («dia» no coincide con «media»)
  const hit = reglas.find(r => {
    let i = texto.indexOf(r[0]);
    while (i > -1) {
      if (!/[a-z0-9]/.test(texto.charAt(i - 1))) return true;
      i = texto.indexOf(r[0], i + 1);
    }
    return false;
  });
  return hit ? hit.slice(1) : null;
}

function parsearImporte_(v) {
  if (typeof v === 'number') return v;
  let s = String(v == null ? '' : v).replace(/[^\d,.\-]/g, '');
  const neg = s.indexOf('-') > -1;
  s = s.replace(/-/g, '');
  const c = s.lastIndexOf(','), p = s.lastIndexOf('.');
  if (c > -1 && p > -1) {
    s = c > p ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (c > -1) {
    s = s.replace(/,(?=.*,)/g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '');               // 1.250 → mil doscientos cincuenta
  }
  const n = parseFloat(s);
  return neg ? -n : n;
}

function parsearFecha_(s, base) {
  if (s instanceof Date) return s;
  const str = String(s || '').trim();
  let m, y, mo, d;
  if ((m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
  else if ((m = str.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/))) { d = +m[1]; mo = +m[2]; y = +m[3]; if (y < 100) y += 2000; }
  else { const t = new Date(str); return isNaN(t) ? new Date() : t; }
  return new Date(y, mo - 1, d, base ? base.getHours() : 12, base ? base.getMinutes() : 0);
}

function normalizarTipo_(t) {
  const s = String(t || '');
  if (/traspaso|transferencia entre/i.test(s)) return 'Traspaso';
  if (/reembolso|devoluc/i.test(s)) return 'Reembolso';
  if (/ingreso/i.test(s)) return 'Ingreso';
  return 'Gasto';
}

function buscar_(id) {
  const hoja = hoja_(H.MOV);
  const ids = hoja.getRange(1, 1, Math.max(hoja.getLastRow(), 1), 1).getValues();
  for (let i = 1; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return { hoja, fila: i + 1 };
  throw new Error('No encuentro ese movimiento (¿se borró en la hoja?)');
}

function comprobarToken_(t) {
  const ok = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!ok) throw new Error('Falta ejecutar configurar()');
  if (String(t || '').trim() !== ok) throw new Error('Clave incorrecta');
}

function conBloqueo_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function hoja_(n) {
  const h = SpreadsheetApp.getActive().getSheetByName(n);
  if (!h) throw new Error('Falta ejecutar configurar()');
  return h;
}
function tz_() { return SpreadsheetApp.getActive().getSpreadsheetTimeZone(); }
function nuevoId_() { return Utilities.getUuid().slice(0, 8); }
function sinAcentos_(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

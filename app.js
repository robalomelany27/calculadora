<script>
// ========= Config =========
const WHATSAPP_TEL = '5491127870031';
const SHARE_TITLE  = 'PLAN GRUPOZZETTO & OMBU';

// ========= Utils =========
const $  = id => document.getElementById(id);
const fmt = n => n.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0});
const clampToStep = (val, min, max, step) => {
  let v = Math.max(min, Math.min(max, val));
  const mod = (v - min) % step;
  if (mod !== 0) v = v - mod;
  return v;
};
const provNombre = () => $('prov').value==='cordoba' ? 'Córdoba' : 'Otra provincia';

// ========= Estado =========
let persona = 'pf';
$('pf').addEventListener('click', ()=>{ persona='pf'; $('pf').classList.add('active'); $('pj').classList.remove('active'); calc(); });
$('pj').addEventListener('click', ()=>{ persona='pj'; $('pj').classList.add('active'); $('pf').classList.remove('active'); calc(); });

// ========= Cálculo =========
function params(){
  const V = clampToStep(Number(($('vbm').value||'').toString().replace(/\D/g,'')) || 0, 40000000, 72000000, 10000);
  $('vbm').value = V ? V : 40000000;
  const cuota = Math.max(1, Math.min(60, Number(($('ncuota').value||'').toString().replace(/\D/g,'')) || 1));
  $('ncuota').value = cuota;

  const selloTotal = ($('prov').value === 'cordoba') ? 0 : V * 0.012;
  const selloCuota = selloTotal / 6;

  const adminPorCuota = (V * 0.08) / 60;
  const adminIVA = adminPorCuota * 0.21;
  const adminTotalCuota = adminPorCuota + adminIVA;

  const cuotaPura = V / 60;
  const idc = cuotaPura * 0.00804;
  const saldoDeudor = V - cuotaPura * (cuota - 1);
  const seguro = Math.max(0, saldoDeudor) * 0.000833;
  const total = cuotaPura + adminTotalCuota + seguro + idc;

  return {V, cuota, selloCuota, adminTotalCuota, cuotaPura, idc, seguro, total};
}

// ========= Resumen (compartir / WhatsApp) =========
function resumenTexto(){
  const P = params();
  const selloTexto = ($('prov').value==='cordoba') ? '0% (exento)' : '1,2% prorrateado en 6 cuotas';
  const selloCuota = (P.cuota>=1 && P.cuota<=6)? fmt(P.selloCuota) : fmt(0);

  return `${SHARE_TITLE}
V.B.M.: ${fmt(P.V)} · ${persona==='pf'?'Persona física':'Persona jurídica'}
Provincia: ${provNombre()}
Cuota #${$('ncuota').value}: ${fmt(P.total)} (sin sello)
Detalle: Pura ${fmt(P.cuotaPura)} · Adm+IVA ${fmt(P.adminTotalCuota)} · Seguro ${fmt(P.seguro)} · IDC ${fmt(P.idc)}
Sello por cuota (${selloTexto}): ${selloCuota}`;
}

// ========= Render =========
function calc(){
  const P = params();
  $('k_pura').textContent  = fmt(P.cuotaPura);
  $('k_adm').textContent   = fmt(P.adminTotalCuota);
  $('k_seg').textContent   = fmt(P.seguro);
  $('k_idc').textContent   = fmt(P.idc);
  $('k_total').textContent = fmt(P.total);
  $('k_sello').textContent = fmt((P.cuota>=1 && P.cuota<=6)? P.selloCuota : 0);
}

// ========= Acciones =========
$('btn-calc').addEventListener('click', calc);
['vbm','ncuota','prov'].forEach(id=> $(id).addEventListener('change', calc));

// Compartir (SOLO 'text' para evitar títulos duplicados)
$('btn-share').addEventListener('click', ()=>{
  const text = resumenTexto();
  if(navigator.share){
    navigator.share({ text }).catch(()=>{});
  }else{
    navigator.clipboard.writeText(text).then(()=>alert('Detalle copiado para compartir'));
  }
});

// WhatsApp (incluye el encabezado en el cuerpo)
$('btn-wa').addEventListener('click', ()=>{
  const text = resumenTexto();
  const url = `https://wa.me/${WHATSAPP_TEL}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
});

// Inicial + accesibilidad
calc();
['vbm','ncuota'].forEach(id=>{
  $(id).addEventListener('keyup', e => { if(e.key==='Enter') calc(); });
});
</script>

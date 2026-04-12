import { useState, useEffect } from 'react'
import { db } from './firebaseConfig'
import { collection, getDocs, query, where } from 'firebase/firestore'

function App() {
  // --- ESTADOS ---
  const [categoria, setCategoria] = useState(null)
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("")
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [busqueda, setBusqueda] = useState("");

  const categorias = [
    { id: 'aceites', nombre: 'Aceites', icono: '🛢️', filtros: ['5W30', '10W40', '5W40', '0W20'] },
    { id: 'baterias', nombre: 'Baterías', icono: '⚡', filtros: ['60Ah', '74Ah', '95Ah'] },
    { id: 'neumaticos', nombre: 'Neumáticos', icono: '⭕', img: 'https://i.postimg.cc/bJcDN4gS/depositphotos-69409077-stock-photo-single-car-tire.webp', filtros: ['205/55 R16', '225/45 R17'] }
  ]

  // --- LÓGICA DE FIREBASE ---
  useEffect(() => {
    const obtenerProductos = async () => {
      if (!categoria) return;

      setCargando(true);
      try {
        const q = query(collection(db, "productos"), where("cat", "==", categoria));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProductos(docs);
      } catch (error) {
        console.error("Error en Firebase:", error);
      }
      setCargando(false);
    };

    obtenerProductos();
  }, [categoria]);

  // --- FUNCIONES AUXILIARES ---
  const volverAtras = () => {
    setCategoria(null);
    setFiltroSeleccionado("");
    setProductos([]);
  };

  const productosFiltrados = productos.filter(p => {
    const coincideFiltro = filtroSeleccionado === "" || p.tipo === filtroSeleccionado;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideFiltro && coincideBusqueda;
  });

  const [slideActual, setSlideActual] = useState(0);
  const promos = [
    { img: "https://motor.elpais.com/wp-content/uploads/2019/04/cambio-aceite-coche.jpg", titulo: "Oferta en Aceites", desc: "20% de descuento este mes" },
    { img: "https://www.muchoneumatico.com/blog/wp-content/uploads/2023/01/auto-mechanic-replacing-car-battery.jpg", titulo: "Baterías de primera marca", desc: "5 años de garantía en tu batería" },
    { img: "https://www.amv.es/blog/wp-content/uploads/2024/12/cambio_neumaticos.jpeg", titulo: "Neumáticos de Invierno", desc: "Seguridad total en carretera" }
  ];

  // Efecto para que cambie solo
  useEffect(() => {
    if (!categoria) {
      const intervalo = setInterval(() => {
        setSlideActual((prev) => (prev + 1) % promos.length);
      }, 5000);
      return () => clearInterval(intervalo);
    }
  }, [categoria]);

  return (
    <div className="min-h-screen bg-white">

      {/* --- HERO SECTION DINÁMICO --- */}
      <div className="relative bg-slate-900 h-[280px] md:h-[280px] flex items-center overflow-hidden">
        {/* LOGO (Clicable para volver al inicio) */}
        <img
          src="/logo.png"
          onClick={volverAtras}
          className="absolute top-6 left-6 w-60 md:w-60 object-contain z-20 cursor-pointer hover:scale-105 transition-transform drop-shadow-lg"
          alt="Logo RecambiosClick"
        />

        {/* IMAGEN DE FONDO HERO */}
        <img
          src="/tallerMecanico.jpg"
          className="absolute w-full h-full object-cover opacity-20"
          alt="Fondo taller"
        />

        <div className="relative max-w-7xl mx-auto px-6 w-full z-10">
          {!categoria ? (
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-4xl font-black text-white mb-4 leading-tight">
                Expertos en <br />
                <span className="text-blue-500">Recambios</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-lg mb-8">
                Accede a nuestro stock real gestionado por Firebase. Calidad profesional para tu vehículo.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="inline-block bg-blue-600 px-4 py-1 rounded text-xs font-bold text-white uppercase tracking-widest mb-4">
                Catálogo Online
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">
                Sección <span className="text-blue-500">{categoria}</span>
              </h2>
              <p className="text-gray-400 mt-4 text-lg">Filtrado inteligente de componentes</p>
            </div>
          )}
        </div>
      </div>

      {/* --- PÁGINA DE INICIO (HOME) --- */}
      {!categoria ? (
        <div className="animate-fade-in">

          {/* CARRUSEL FULL WIDTH (De borde a borde) */}
          <div className="relative mt-5 w-full h-[350px] md:h-[450px] bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
              <img
                src={promos[slideActual].img}
                className="w-1024 h-full object-cover opacity-60"
                alt="Promoción"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center z-10">
              <div className="max-w-2xl animate-fade-in">
                <span className="inline-block bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-4 tracking-widest">
                  Oferta Destacada
                </span>
                <h4 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                  {promos[slideActual].titulo}
                </h4>
                <p className="text-xl text-gray-200 mb-8">
                  {promos[slideActual].desc}
                </p>
              </div>
            </div>

            {/* Puntos del Carrusel */}
            <div className="absolute bottom-8 w-full flex justify-center gap-3 z-20">
              {promos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideActual(i)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${slideActual === i ? 'w-12 bg-blue-500' : 'w-4 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>

          {/* BUSCADOR FLOTANTE Y CATEGORÍAS */}
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative -mt-12 mb-20 z-30">
              <div className="bg-white p-2 rounded-3xl shadow-2xl border border-gray-100 flex items-center">
                <div className="pl-6 pr-4 text-2xl">🔍</div>
                <input
                  type="text"
                  placeholder="Busca por marca, modelo o recambio..."
                  className="w-full py-5 pr-6 text-lg bg-transparent outline-none text-gray-700 font-medium"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-10 flex items-center gap-3">
              <span className="w-10 h-1 bg-blue-600"></span>
              Selecciona una categoría
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoria(cat.id)}
                  className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-2xl transition-all group text-center"
                >
                  <div className="h-28 flex items-center justify-center mb-6">
                    {cat.img ? (
                      <img src={cat.img} alt={cat.nombre} className="h-full object-contain group-hover:scale-110 transition-transform" />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform block">{cat.icono}</span>
                    )}
                  </div>
                  <span className="text-2xl font-black text-gray-700 group-hover:text-blue-600 uppercase tracking-wide">{cat.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN DE CONFIANZA */}
          <div className="bg-slate-50 py-20 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-4">🚚</span>
                <h4 className="font-bold text-lg text-gray-800">Entrega Express</h4>
                <p className="text-gray-500 mt-2">Logística optimizada para que tu taller no se detenga.</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-4">🛡️</span>
                <h4 className="font-bold text-lg text-gray-800">Garantía Total</h4>
                <p className="text-gray-500 mt-2">Productos certificados y testados bajo normativa europea.</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-4">☁️</span>
                <h4 className="font-bold text-lg text-gray-800">Stock en tiempo real</h4>
                <p className="text-gray-500 mt-2">Sincronización directa con nuestra base de datos Firebase.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- VISTA DE PRODUCTOS --- */
        <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
          <button
            onClick={volverAtras}
            className="mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors group"
          >
            <span className="bg-slate-100 group-hover:bg-blue-100 p-2 rounded-full">←</span>
            Volver al catálogo principal
          </button>

          <div className="flex flex-col md:flex-row gap-10">
            <aside className="w-full md:w-72">
              <div className="sticky top-10 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h4 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">Especificaciones</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setFiltroSeleccionado("")}
                    className={`w-full py-3 px-5 rounded-xl text-left font-bold transition-all ${filtroSeleccionado === "" ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    Ver todo
                  </button>
                  {categorias.find(c => c.id === categoria)?.filtros.map(f => (
                    <button
                      key={f}
                      onClick={() => setFiltroSeleccionado(f)}
                      className={`w-full py-3 px-5 rounded-xl text-left font-bold transition-all ${filtroSeleccionado === f ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <main className="flex-1">
              {/* BUSCADOR INTERNO DE CATEGORÍA */}
              <div className="relative mb-8">
                <input
                  type="text"
                  placeholder={`Buscar en ${categoria}...`}
                  className="w-full p-5 pl-12 rounded-2xl border border-gray-100 shadow-sm outline-none focus:border-blue-500 transition-all"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <span className="absolute left-4 top-5 text-gray-400">🔍</span>
              </div>

              {cargando ? (
                <div className="text-center py-20 text-gray-300 animate-pulse text-xl font-bold">Consultando Firebase...</div>
              ) : productosFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {productosFiltrados.map(prod => (
                    <div key={prod.id} className="group bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center gap-8 hover:shadow-xl transition-all border-l-4 hover:border-l-blue-600">
                      <div className="w-28 h-28 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center p-3">
                        {prod.img ? (
                          <img src={prod.img} alt={prod.nombre} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                        ) : (
                          <span className="text-5xl">{categorias.find(c => c.id === categoria)?.icono}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-bold text-blue-500 uppercase">{prod.tipo}</span>
                        <h4 className="text-xl font-bold text-gray-800 mt-1">{prod.nombre}</h4>
                        <p className="text-2xl font-black text-blue-600 mt-2">{prod.precio}</p>
                      </div>
                      <a
                        href={prod.ficha}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg text-center"
                      >
                        Ver ficha
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold text-xl">Sin existencias para esta búsqueda</p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      {/* --- FOOTER ACTUALIZADO --- */}
      <footer className="bg-slate-900 text-slate-500 py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">

          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-10">
            <div className="text-center md:text-left">
              <span className="text-white font-black text-2xl tracking-tighter italic">RECAMBIOSCLICK</span>
              <p className="mt-2 text-sm max-w-xs text-slate-400">
                Tu partner tecnológico para el mantenimiento de vehículos.
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-600 font-mono">PROYECTO FINAL DAW - GABRIEL AIZMAN</p>
            </div>
          </div>

          {/* CLÁUSULA EDUCATIVA */}
          <div className="w-full border-t border-slate-800 pt-8 mt-4 text-center">
            <p className="text-[10px] leading-relaxed text-slate-600 max-w-3xl mx-auto uppercase tracking-widest">
              Este proyecto es **estrictamente educativo**. Las imágenes mostradas en el carrusel y catálogo
              pertenecen a sus respectivos autores. No se realiza actividad comercial alguna con este sitio.
            </p>
          </div>

        </div>
      </footer>
    </div>
  )
}

export default App
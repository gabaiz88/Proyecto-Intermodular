import { useState, useEffect } from 'react'
import { db } from './firebaseConfig'
import { collection, getDocs, query, where } from 'firebase/firestore'
import vehiculosData from './data/vehiculos.json';
import { useCart } from './CartContext';
import { CartDrawer } from './CartDrawer';
import { Checkout } from './Checkout';

function App() {
  // Estados
  const [categoria, setCategoria] = useState(null)
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("")
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [slideActual, setSlideActual] = useState(0)
  const [matriculaInput, setMatriculaInput] = useState("");
  const [cocheDetectado, setCocheDetectado] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { cart, addToCart, updateQuantity, totalItems, totalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const categorias = [
    { id: 'aceites', nombre: 'Aceites', icono: '🛢️', filtros: ['5W30', '10W40', '5W40', '0W20'] },
    { id: 'baterias', nombre: 'Baterías', icono: '⚡', filtros: ['60Ah', '74Ah', '95Ah'] },
    { id: 'neumaticos', nombre: 'Neumáticos', icono: '⭕', img: 'https://i.postimg.cc/bJcDN4gS/depositphotos-69409077-stock-photo-single-car-tire.webp', filtros: ['205/55 R16', '225/45 R17'] }
  ]

  const promos = [
    { img: "https://motor.elpais.com/wp-content/uploads/2019/04/cambio-aceite-coche.jpg", titulo: "Oferta en Aceites", desc: "20% de descuento este mes" },
    { img: "https://www.muchoneumatico.com/blog/wp-content/uploads/2023/01/auto-mechanic-replacing-car-battery.jpg", titulo: "Baterías de primera marca", desc: "5 años de garantía en tu batería" },
    { img: "https://www.amv.es/blog/wp-content/uploads/2024/12/cambio_neumaticos.jpeg", titulo: "Neumáticos de Invierno", desc: "Seguridad total en carretera" }
  ]

  // Firebase
  useEffect(() => {
    const obtenerProductos = async () => {
      if (!categoria) {
        setProductos([]);
        return;
      }
      setCargando(true);
      try {
        let q;
        if (categoria === "busqueda_global") {
          q = query(collection(db, "productos"));
        } else {
          q = query(collection(db, "productos"), where("cat", "==", categoria.toLowerCase()));
        }
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProductos(docs);
      } catch (error) {
        console.error("Error en Firebase:", error);
      }
      setCargando(false);
    };
    obtenerProductos();
  }, [categoria]);

  // Carrusel
  useEffect(() => {
    if (!categoria) {
      const intervalo = setInterval(() => {
        setSlideActual((prev) => (prev + 1) % promos.length);
      }, 5000);
      return () => clearInterval(intervalo);
    }
  }, [categoria]);

  const volverAtras = () => {
    setCategoria(null);
    setFiltroSeleccionado("");
    setProductos([]);
    setBusqueda("");
    setCocheDetectado(null);
  };

  const ejecutarBusquedaGlobal = () => {
    if (busqueda.trim().length > 0) {
      setFiltroSeleccionado("");
      setCategoria("busqueda_global");
    }
  };

  const buscarMatricula = () => {
    const encontrado = vehiculosData.find(
      v => v.matricula === matriculaInput.toUpperCase().replace(/\s+/g, '')
    );
    if (encontrado) {
      setCocheDetectado(encontrado);
      setCategoria("busqueda_global");
      setBusqueda(`${encontrado.aceite} ${encontrado.bateria} ${encontrado.neumaticos}`);
      setFiltroSeleccionado("");
    } else {
      alert("Matrícula no encontrada.");
    }
  };

  const productosFiltrados = productos.filter(p => {
    const nombre = p.nombre ? p.nombre.toLowerCase() : "";
    const busquedaLower = busqueda.toLowerCase();
    const terminos = busquedaLower.split(' ');
    const coincideConAlgunaKeyword = terminos.some(termino =>
      nombre.includes(termino) || (p.tipo && p.tipo.toLowerCase().includes(termino))
    );
    const coincideFiltro = filtroSeleccionado === "" ||
      p.tipo === filtroSeleccionado ||
      p.cat === filtroSeleccionado;
    return coincideFiltro && coincideConAlgunaKeyword;
  });

  if (showCheckout) {
    return <Checkout onBack={() => setShowCheckout(false)} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header con Carrito */}
      <div className="relative bg-slate-900 h-[280px] flex items-center overflow-hidden">
        <img
          src="/logo.png"
          onClick={volverAtras}
          className="absolute top-6 left-6 w-48 md:w-60 z-20 cursor-pointer hover:scale-105 transition-transform"
          alt="Logo"
        />
        <img src="/tallerMecanico.jpg" className="absolute w-full h-full object-cover opacity-20" alt="Fondo" />

        <div className="relative max-w-7xl mx-auto px-6 w-full z-10">
          {!categoria ? (
            <div className="animate-fade-in ml-40">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Expertos en <br /><span className="text-blue-500">Recambios</span></h1>
              <p className="text-lg text-gray-300 max-w-lg">Stock real gestionado por Firebase.</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="inline-block bg-blue-600 px-4 py-1 rounded text-xs font-bold text-white uppercase mb-4 tracking-widest">Catálogo Online</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">
                {categoria === "busqueda_global" ? (
                  <>Resultados: <span className="text-blue-500">"{busqueda}"</span></>
                ) : (
                  <>Sección <span className="text-blue-500">{categoria}</span></>
                )}
              </h2>
            </div>
          )}
        </div>

        {/* Widget del Carrito */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
          <div
            onClick={() => setIsDrawerOpen(true)}
            className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform active:scale-95"
          >
            <span className="text-2xl">🛒</span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-blue-600 uppercase leading-none">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </span>
              <span className="text-sm font-bold text-slate-800">
                {(totalPrice || 0).toFixed(2)}€
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Home / Categorías */}
      {!categoria ? (
        <div className="animate-fade-in">
          <div className="relative w-full h-[350px] md:h-[450px] bg-slate-900 overflow-hidden">
            <div className="absolute inset-0">
              <img src={promos[slideActual].img} className="mt-5 w-full h-full object-cover opacity-60" alt="Promo" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
            </div>
            <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center z-10">
              <div className="max-w-2xl">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-4 inline-block">Oferta Destacada</span>
                <h4 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">{promos[slideActual].titulo}</h4>
                <p className="text-xl text-gray-200">{promos[slideActual].desc}</p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="relative -mt-10 mb-20 z-30">
              <div className="bg-white p-2 rounded-3xl shadow-2xl border border-gray-100 flex items-center">
                <div className="pl-6 pr-4 text-2xl">🔍</div>
                <input
                  type="text"
                  placeholder="Busca cualquier recambio (ej: Michelin, Varta, Castrol...)"
                  className="w-full py-5 pr-6 text-lg bg-transparent outline-none font-medium"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && ejecutarBusquedaGlobal()}
                />
              </div>
            </div>

            <div className="mt-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="relative group w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold text-xs">E</span>
                </div>
                <input
                  type="text"
                  placeholder="1234BBB"
                  className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-lg font-mono text-xl uppercase tracking-widest focus:border-yellow-400 outline-none transition-all shadow-inner"
                  value={matriculaInput}
                  onChange={(e) => setMatriculaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarMatricula()}
                />
              </div>
              <button
                onClick={buscarMatricula}
                className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black px-8 py-3 rounded-xl transition-transform active:scale-95 shadow-md uppercase text-sm"
              >
                Buscar por Matrícula
              </button>
            </div>

            <h3 className="text-2xl font-bold mb-10">Selecciona una categoría</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setBusqueda(""); setCategoria(cat.id); }}
                  className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:border-blue-500 hover:shadow-2xl transition-all group"
                >
                  <div className="h-28 flex items-center justify-center mb-6">
                    {cat.img ? <img src={cat.img} className="h-full object-contain group-hover:scale-110 transition-transform" /> : <span className="text-6xl">{cat.icono}</span>}
                  </div>
                  <span className="text-2xl font-black text-gray-700 uppercase">{cat.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Listado de Productos */
        <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
          <button onClick={volverAtras} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold group">
            <span className="bg-slate-100 group-hover:bg-blue-100 p-2 rounded-full transition-colors">←</span> Volver al inicio
          </button>

          {cocheDetectado && categoria === "busqueda_global" && (
            <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-2xl animate-fade-in">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🚗</span>
                <div>
                  <h3 className="font-bold text-blue-900 text-lg">Vehículo Identificado: {cocheDetectado.marca} {cocheDetectado.modelo}</h3>
                  <p className="text-blue-700 text-sm">
                    Recomendación técnica: Aceite <span className="font-bold">{cocheDetectado.aceite}</span> •
                    Batería <span className="font-bold">{cocheDetectado.bateria}</span> •
                    Medida: <span className="font-bold">{cocheDetectado.neumaticos}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-10">
            {/* Sidebar de Filtros */}
            <aside className="w-full md:w-72">
              <div className="sticky top-10 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h4 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">
                  {categoria === "busqueda_global" ? "Filtrar Resultados" : "Filtros"}
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setFiltroSeleccionado("")}
                    className={`w-full py-3 px-5 rounded-xl text-left font-bold transition-all ${filtroSeleccionado === "" ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    Mostrar todo
                  </button>
                  {categoria === "busqueda_global" ? (
                    <>
                      <button onClick={() => setFiltroSeleccionado("aceites")} className={`w-full py-3 px-5 rounded-xl text-left font-bold transition-all ${filtroSeleccionado === "aceites" ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>🛢️ Aceites</button>
                      <button onClick={() => setFiltroSeleccionado("baterias")} className={`w-full py-3 px-5 rounded-xl text-left font-bold transition-all ${filtroSeleccionado === "baterias" ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>⚡ Baterías</button>
                      <button onClick={() => setFiltroSeleccionado("neumaticos")} className={`w-full py-3 px-5 rounded-xl text-left font-bold transition-all ${filtroSeleccionado === "neumaticos" ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>⭕ Neumáticos</button>
                    </>
                  ) : (
                    categorias.find(c => c.id === categoria)?.filtros.map(f => (
                      <button key={f} onClick={() => setFiltroSeleccionado(f)} className={`w-full py-3 px-5 rounded-xl text-left font-bold transition-all ${filtroSeleccionado === f ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{f}</button>
                    ))
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content: Productos */}
            <main className="flex-1">
              <div className="relative mb-8">
                <input
                  type="text"
                  placeholder={`Filtrar resultados...`}
                  className="w-full p-5 pl-12 rounded-2xl border border-gray-100 shadow-sm outline-none focus:border-blue-500 transition-all"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <span className="absolute left-4 top-5 text-gray-400">🔍</span>
              </div>

              {cargando ? (
                <div className="text-center py-20 text-gray-300 animate-pulse text-xl font-bold">Buscando en stock...</div>
              ) : productosFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {productosFiltrados.map(prod => {
                    const itemEnCarrito = cart.find(item => item.id === prod.id);
                    const cantidad = itemEnCarrito ? itemEnCarrito.quantity : 0;

                    return (
                      <div key={prod.id} className="group bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center gap-8 hover:shadow-xl transition-all border-l-4 hover:border-l-blue-600">
                        <div className="w-28 h-28 bg-gray-50 rounded-2xl flex items-center justify-center p-3">
                          {prod.img ? <img src={prod.img} className="w-full h-full object-contain" alt={prod.nombre} /> : <span className="text-5xl">📦</span>}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-500 uppercase">{prod.cat}</span>
                            {/* Añadimos el TIPO como una etiqueta sutil */}
                            {prod.tipo && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase">
                                {prod.tipo}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xl font-bold text-gray-800 mt-1">{prod.nombre}</h4>

                          <div className="flex items-baseline gap-2 mt-2">
                            <p className="text-2xl font-black text-blue-600">{prod.precio}</p>
                            {/* Opcional: Mostrar stock disponible de forma discreta */}
                            <span className="text-xs text-slate-400 font-medium">Stock: {prod.stock}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {cantidad > 0 ? (
                            <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200">
                              <button onClick={() => updateQuantity(prod.id, -1)} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-all font-bold text-xl">-</button>
                              <span className="w-12 text-center font-black text-slate-800 text-lg">{cantidad}</span>
                              <button
                                onClick={() => updateQuantity(prod.id, 1, prod.stock)} // <-- Pasamos prod.stock
                                className="..."
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(prod)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-md">
                              Añadir al carrito
                            </button>
                          )}
                          <a
                            href={prod.ficha}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors underline decoration-slate-200 underline-offset-4"
                          >
                            VER FICHA
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-32 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold text-xl">No se han encontrado resultados</p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-10">
            <div className="text-center md:text-left">
              <span className="text-white font-black text-2xl tracking-tighter italic">RECAMBIOSCLICK</span>
              <p className="mt-2 text-sm max-w-xs text-slate-400">Tu partner tecnológico para el mantenimiento de vehículos.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600 font-mono">PROYECTO FINAL DAW - GABRIEL AIZMAN</p>
            </div>
          </div>
          <div className="w-full border-t border-slate-800 pt-8 mt-4 text-center">
            <p className="text-[10px] leading-relaxed text-slate-600 max-w-3xl mx-auto uppercase tracking-widest">
              Este proyecto es educativo. Las imágenes mostradas en el carrusel y catálogo pertenecen a sus respectivos autores. No se realiza actividad comercial alguna con este sitio.
            </p>
          </div>
        </div>
      </footer>

      {/* PANEL LATERAL DEL CARRITO */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCheckout={() => {
          setIsDrawerOpen(false);
          setShowCheckout(true); 
        }}
      />
    </div>
  );
}

export default App;
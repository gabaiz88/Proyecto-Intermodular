import { useCart } from './CartContext';
import Swal from 'sweetalert2';

export const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateQuantity, totalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro para cerrar al hacer click fuera */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header del Carrito */}
          <div className="p-6 border-b flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Tu Pedido</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500 text-2xl">×</button>
          </div>

          {/* Listado de Productos */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-slate-400 mt-10">El carrito está vacío</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                  <img src={item.img} className="w-16 h-16 object-contain rounded-lg border bg-gray-50" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-700 text-sm leading-tight">{item.nombre}</h4>
                    <p className="text-blue-600 font-black text-sm">{item.precio}€</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1">
                    <button onClick={() => updateQuantity(item.id, -1, item.stock)} className="font-bold">-</button>
                    <span className="font-bold text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1, item.stock)} className="font-bold">+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer con el Total y el botón */}
          {cart.length > 0 && (
            <div className="p-6 border-t bg-slate-50">
              <div className="flex justify-between items-end mb-6">
                <span className="text-slate-500 font-bold uppercase text-xs">Total (IVA incl.)</span>
                <span className="text-3xl font-black text-blue-600">{totalPrice.toFixed(2)}€</span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-xl ..."
              >
                TRAMITAR PEDIDO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
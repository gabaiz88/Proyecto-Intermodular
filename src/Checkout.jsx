import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import Swal from 'sweetalert2';

export const Checkout = ({ onBack }) => {
    const { cart, totalPrice, clearCart } = useCart();
    const [cardNumber, setCardNumber] = useState([]);
    const [dateNumber, setDateNumber] = useState([]);
    const [cvvNumber, setCvvNumber] = useState([]);
    const [isFlipped, setIsFlipped] = useState(false);
    const [nombre, setNombre] = useState('TU NOMBRE');
    const [email, setEmail] = useState('');


    const maskCard = "0000-0000-0000-0000";
    const maskDate = "00/00";


    const handlePago = () => {
        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            Swal.fire({
                title: 'Email inválido',
                text: 'Por favor, introduce un correo electrónico válido para enviarte el recibo.',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        Swal.fire({
            title: '¡Compra confirmada!',
            html: `
        <p>Se han cargado <b>${totalPrice.toFixed(2)}€</b> a tu tarjeta.</p>
        <p style="margin-top: 1rem; font-size: 0.875rem; color: #4b5563;">
            Hemos enviado los detalles de tu compra y el número de seguimiento a: <br>
            <b>${email}</b>
        </p>
    `,
            icon: 'success',
            confirmButtonText: 'Volver a la tienda',
            confirmButtonColor: '#2563eb',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                clearCart();
                window.location.replace('/');
            }
        });
    };

    const handleCardInput = (e, arr, setArr, mask) => {
        const key = e.key;
        let newArr = [...arr];
        let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

        if (key === "Backspace" && newArr.length > 0) {
            newArr.pop();
        } else if (numbers.includes(key) && newArr.length < mask.length) {
            if (mask[newArr.length] === "-" || mask[newArr.length] === "/") {
                newArr.push(mask[newArr.length], key);
            } else {
                newArr.push(key);
            }
        }
        setArr(newArr);
    };

    useEffect(() => {
        if (cardNumber.length === 19 && dateNumber.length === 5) {
            setIsFlipped(true);
        }
        if (cvvNumber.length === 3) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
            });
            Toast.fire({ icon: 'success', title: 'Tarjeta validada' });
            setTimeout(() => setIsFlipped(false), 2000);
        }
    }, [cardNumber, dateNumber, cvvNumber]);

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <button onClick={onBack} className="mb-8 text-blue-600 font-bold self-start hover:underline">
                ← Volver a la tienda
            </button>

            <div className="flex flex-col md:flex-row gap-12 bg-white p-10 rounded-3xl shadow-2xl max-w-6xl w-full">

                {/* Pasarela de pago */}
                <div className="flex-1">
                    <h2 className="text-2xl font-black mb-6">Confirmar Pago</h2>

                    {/* Tarjeta */}
                    <div className={`relative w-80 h-48 mx-auto mb-10 transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white backface-hidden shadow-xl">
                            <div className="flex justify-between items-start mb-8">
                                <span className="text-sm font-bold italic">RecambiosClick Card</span>
                                <div className="w-10 h-8 bg-yellow-400 rounded-md opacity-80"></div>
                            </div>
                            <div className="text-xl tracking-widest font-mono mb-4 text-center">
                                {cardNumber.length > 0 ? cardNumber.join("") : "####-####-####-####"}
                            </div>
                            <div className="flex justify-between uppercase text-[10px]">
                                <div><p className="opacity-70">Titular</p><p className="text-sm font-bold">{nombre}</p></div>
                                <div><p className="opacity-70">Vencimiento</p><p className="text-sm font-bold">{dateNumber.length > 0 ? dateNumber.join("") : "00/00"}</p></div>
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-slate-800 rounded-2xl text-white rotate-y-180 backface-hidden shadow-xl flex flex-col justify-center">
                            <div className="h-10 bg-black w-full mb-4"></div>
                            <div className="px-6">
                                <div className="bg-white h-8 w-full rounded flex items-center justify-end px-4 text-black font-mono">
                                    {cvvNumber.join("")}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4 max-w-sm mx-auto">
                        <input type="text" placeholder="Número de Tarjeta" onKeyDown={(e) => handleCardInput(e, cardNumber, setCardNumber, maskCard)} value={cardNumber.join("")} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono" readOnly />
                        <div className="flex gap-4">
                            <input type="text" placeholder="MM/YY" onKeyDown={(e) => handleCardInput(e, dateNumber, setDateNumber, maskDate)} value={dateNumber.join("")} className="w-1/2 p-3 border rounded-xl outline-none font-mono" readOnly />
                            <input type="text" placeholder="CVV" onKeyDown={(e) => handleCardInput(e, cvvNumber, setCvvNumber, "000")} value={cvvNumber.join("")} className="w-1/2 p-3 border rounded-xl outline-none font-mono" readOnly />
                        </div>
                        <input type="text" placeholder="Nombre en la tarjeta" onChange={(e) => setNombre(e.target.value.toUpperCase())} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="mt-4">
                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Correo Electrónico para el recibo</label>
                            <input
                                type="email"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-80 bg-slate-50 p-6 rounded-2xl border flex flex-col">
                    <h3 className="font-bold text-slate-400 text-xs mb-4 tracking-widest uppercase">Tu Pedido</h3>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 max-h-80 scrollbar-thin">
                        {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={item.img}
                                        alt={item.name}
                                        className="w-10 h-10 object-contain bg-white rounded border p-1"
                                    />
                                    <div className="text-[11px]">
                                        <p className="font-bold text-slate-700 line-clamp-1">{item.name || item.nombre}</p>
                                        <p className="text-slate-400">Cant: {item.quantity || item.cantidad}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold">
                                    {(() => {
                                        // Convertido a String
                                        const p = String(item.precio || item.price || "0").replace(',', '.').replace(/[^0-9.]/g, '');
                                        const c = Number(item.cantidad || item.quantity || 1);

                                        // Multiplicacion
                                        const resultado = parseFloat(p) * c;

                                        // Si hay error, poner 0
                                        return isNaN(resultado) ? "0.00" : resultado.toFixed(2);
                                    })()}€
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>{(totalPrice / 1.21).toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>IVA (21%)</span>
                            <span>{(totalPrice - (totalPrice / 1.21)).toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-xl font-black text-blue-600 pt-2">
                            <span>Total</span>
                            <span>{totalPrice.toFixed(2)}€</span>
                        </div>
                    </div>

                    <button onClick={handlePago} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl mt-6 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">
                        PAGAR AHORA
                    </button>
                </div>
            </div>
        </div>
    );
};
import { createContext, useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2'

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Añadir al carrito
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existing = prevCart.find(item => item.id === product.id);

            if (existing) {
                if (existing.quantity >= product.stock) {
                    // AQUÍ EL ALERT LINDO
                    Swal.fire({
                        title: 'Sin stock suficiente',
                        text: `Lo sentimos, solo tenemos ${product.stock} unidades disponibles de este artículo.`,
                        icon: 'warning',
                        confirmButtonColor: '#2563eb', // El azul de tu logo
                        confirmButtonText: 'Entendido'
                    });
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            // Si el producto es nuevo en el carrito, pero por algún motivo no hay stock (stock: 0)
            if (product.stock <= 0) {
                Swal.fire('Producto agotado', 'Este artículo no tiene stock disponible.', 'error');
                return prevCart;
            }

            return [...prevCart, { ...product, quantity: 1 }];
        });
    };


    // Quitar o bajar cantidad
    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, amount, currentStock) => {
        setCart((prevCart) => {
            const item = prevCart.find(i => i.id === id);

            // Si intentamos sumar (+1) pero ya no hay stock disponible
            if (amount > 0 && item && item.quantity >= currentStock) {
                // USAMOS SWEETALERT AQUÍ TAMBIÉN
                Swal.fire({
                    title: 'Tope de stock alcanzado',
                    text: `Solo disponemos de ${currentStock} unidades`,
                    icon: 'info',
                    toast: true,               // Lo hace pequeñito
                    position: 'top-end',       // Sale en la esquina superior derecha
                    showConfirmButton: false,  // No necesita botón de OK
                    timer: 4000,               // Se cierra solo 
                    timerProgressBar: true
                });
                return prevCart;
            }

            return prevCart
                .map((item) =>
                    item.id === id ? { ...item, quantity: item.quantity + amount } : item
                )
                .filter((item) => item.quantity > 0);
        });
    };

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (parseFloat(item.precio) * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
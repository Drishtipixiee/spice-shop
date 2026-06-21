export interface WhatsAppItem {
  product_name: string;
  variant_label: string;
  quantity: number;
  unit_price: number;
}

export interface WhatsAppOrderData {
  items: WhatsAppItem[];
  subtotal: number;
  delivery_charge: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  address: string;
  pincode: string;
}

export function buildWhatsAppOrderMessage(data: WhatsAppOrderData): string {
  const itemLines = data.items
    .map((item) => {
      const lineTotal = item.unit_price * item.quantity;
      return `• ${item.product_name} ${item.variant_label} × ${item.quantity} = ₹${lineTotal.toFixed(2)}`;
    })
    .join('\n');

  const deliveryText =
    data.delivery_charge === 0 ? 'Free' : `₹${data.delivery_charge.toFixed(2)}`;

  const message = `Hello! I'd like to place an order 🛒

*Order Summary:*
${itemLines}

*Subtotal:* ₹${data.subtotal.toFixed(2)}
*Delivery:* ${deliveryText}
*Total:* ₹${data.total.toFixed(2)}

*Delivery Details:*
Name: ${data.customer_name}
Phone: ${data.customer_phone}
Address: ${data.address}
Pincode: ${data.pincode}

Please confirm my order. Thank you! 🙏`;

  return message;
}

export function getWhatsAppUrl(message: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

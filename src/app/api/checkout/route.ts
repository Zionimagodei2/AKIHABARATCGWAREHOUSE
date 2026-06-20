import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const VALID_PAYMENT_METHODS = ['bank_transfer', 'paypal', 'credit_card', 'wise', 'crypto']

interface CheckoutItem {
  productId?: string
  title: string
  price: number
  quantity: number
  image?: string
}

interface CheckoutBody {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  shippingCity: string
  shippingCountry: string
  shippingZip: string
  paymentMethod: string
  notes?: string
  items: CheckoutItem[]
  total: number
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json()

    // 1. Validate required fields
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingZip,
      paymentMethod,
      notes,
      items,
      total,
    } = body

    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      )
    }

    if (!customerEmail || !customerEmail.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer email is required' },
        { status: 400 }
      )
    }

    if (!paymentMethod || !paymentMethod.trim()) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
        { status: 400 }
      )
    }

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: `Invalid payment method. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}` },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    if (total === undefined || total === null || total <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid total amount is required' },
        { status: 400 }
      )
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item.title || !item.title.trim()) {
        return NextResponse.json(
          { success: false, error: `Item at index ${i} is missing a title` },
          { status: 400 }
        )
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        return NextResponse.json(
          { success: false, error: `Item at index ${i} has an invalid price` },
          { status: 400 }
        )
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json(
          { success: false, error: `Item at index ${i} has an invalid quantity` },
          { status: 400 }
        )
      }
    }

    // 2. Generate unique order ID
    const orderId = `AKI-${Date.now().toString(36).toUpperCase()}`

    const now = new Date().toISOString()

    // 3. Insert order into Supabase
    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      customer_phone: customerPhone?.trim() || null,
      shipping_address: shippingAddress?.trim() || null,
      shipping_city: shippingCity?.trim() || null,
      shipping_country: shippingCountry?.trim() || null,
      shipping_zip: shippingZip?.trim() || null,
      payment_method: paymentMethod,
      notes: notes?.trim() || null,
      total,
      status: 'pending',
      user_id: null,
      created_at: now,
      updated_at: now,
    })

    if (orderError) {
      console.error('Order insert error:', orderError)
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // 4. Insert order items into Supabase
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId || null,
      title: item.title.trim(),
      price: item.price,
      quantity: item.quantity,
      image: item.image || null,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      console.error('Order items insert error:', itemsError)
      // Attempt to clean up the order since items failed
      await supabase.from('orders').delete().eq('id', orderId)
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // 5. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          orderId,
          message: 'Order placed successfully',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during checkout' },
      { status: 500 }
    )
  }
}

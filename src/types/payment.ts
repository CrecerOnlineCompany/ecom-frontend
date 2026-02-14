/**
 * Tipos e Interfaces para Métodos de Pago
 * Define la estructura de datos esperados del backend
 */

/**
 * Respuesta de la API para obtener proveedores de pago
 */
export interface PaymentProvidersResponse {
  success: boolean
  providers: PaymentProvider[]
  count: number
  message?: string
}

/**
 * Respuesta de la API para obtener un proveedor específico
 */
export interface PaymentProviderResponse {
  success: boolean
  provider: PaymentProvider
  message?: string
}

/**
 * Datos de un proveedor de pago
 */
export interface PaymentProvider {
  id: number
  name: string
  display_name: string
  description?: string
  icon_url?: string
  is_active: boolean
  requires_redirect: boolean
  supports_webhook: boolean
  webhook_url?: string
}

/**
 * Respuesta al procesar un pago
 */
export interface ProcessPaymentResponse {
  success: boolean
  message: string
  data?: {
    payment_id: number
    ticket_id: number
    provider_id: number
    status: PaymentStatus
    redirect_url?: string
    transaction_id?: string
    confirmation_number?: string
  }
}

/**
 * Estado de un pago
 */
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'approved' 
  | 'declined' 
  | 'refunded'
  | 'cancelled'

/**
 * Respuesta al obtener estado de un pago
 */
export interface PaymentStatusResponse {
  success: boolean
  data: {
    payment_id: number
    status: PaymentStatus
    amount: number
    currency: string
    created_at: string
    updated_at: string
  }
}

/**
 * Datos para procesar un pago
 */
export interface PaymentProcessData {
  ticket_id: number
  payment_provider_id: number
  card_name?: string
  card_number?: string
  card_expiry?: string
  card_cvv?: string
  [key: string]: any
}

/**
 * Información de UI para un proveedor
 */
export interface ProviderUIInfo {
  name: string
  icon: string
  color: string
  description: string
}

/**
 * Error de validación de tarjeta
 */
export interface CardValidationError {
  field: 'cardNumber' | 'expiry' | 'cvv' | 'cardName'
  message: string
}

/**
 * Resultado de validación de tarjeta
 */
export interface CardValidationResult {
  valid: boolean
  errors: CardValidationError[]
}

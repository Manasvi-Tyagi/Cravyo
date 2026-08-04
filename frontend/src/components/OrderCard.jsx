import React from 'react'
import { StatusBadge, Button, InlineError } from './ui'
import { nextStatusFor, NEXT_STATUS_LABEL } from '../utils/orderStatus'

const dateFormatter = (withTime) => (value) => new Date(value).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
  ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
})

export default function OrderCard({
  order,
  role,
  onRequestCancel,
  cancelling,
  onRequestStatusChange,
  updating,
  actionError,
}) {
  const isMerchant = role === 'merchant'
  const formatDate = dateFormatter(isMerchant)
  const itemsSummary = order.items.map((item) => `${item.quantity}× ${item.name}`).join(' · ')
  const nextStatus = nextStatusFor(order.status)
  const canCancel = order.status === 'PLACED'

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          {isMerchant ? (
            <>
              <div className="customer-name">{order.customerId?.name || 'Customer'}</div>
              <div className="customer-email">{order.customerId?.email}</div>
            </>
          ) : (
            <div className="order-merchant-name">{order.merchantId?.restaurantName || order.merchantId?.name || 'Restaurant'}</div>
          )}
          <div className="order-date">{formatDate(order.createdAt)}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-items-summary">{itemsSummary}</div>

      {order.deliveryAddress && <div className="delivery-address-display">📍 {order.deliveryAddress}</div>}

      <div className="order-total-row">
        <span>Total</span>
        <span>₹{order.totalAmount}</span>
      </div>

      {actionError && <div className="order-inline-error"><InlineError>{actionError}</InlineError></div>}

      {!isMerchant && canCancel && (
        <div className="order-actions">
          <Button variant="destructive" size="sm" fullWidth loading={cancelling} loadingLabel="Cancelling…" onClick={onRequestCancel}>
            Cancel order
          </Button>
        </div>
      )}

      {isMerchant && nextStatus && (
        <div className="order-actions">
          <Button size="sm" fullWidth loading={updating} loadingLabel="Updating…" onClick={() => onRequestStatusChange(nextStatus)}>
            {NEXT_STATUS_LABEL[nextStatus]}
          </Button>
        </div>
      )}
    </div>
  )
}

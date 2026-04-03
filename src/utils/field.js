/**
 * Field-level visibility and editability constraint utilities.
 *
 * These helpers enforce backend-defined field rules on the frontend:
 *   - read_only_fields  → filter from submit payload (never sent to backend)
 *   - hidden fields     → filter from display data (never rendered or submitted)
 *
 * Rule priority (highest to lowest):
 *   1. Backend field metadata (read_only_fields, write_only, etc.)
 *   2. Per-module frontend configuration (passed as array argument)
 *   3. Default: all fields visible and editable
 *
 * Usage:
 *   import { filterReadonlyFields, filterHiddenFields } from '@/utils/field'
 *
 *   // Before submitting a form — strip backend read-only fields
 *   const payload = filterReadonlyFields({ ...form }, PRODUCT_READONLY_FIELDS)
 *
 *   // Before rendering a row — strip fields that must not be shown
 *   const safeRow = filterHiddenFields(row, HIDDEN_FIELDS)
 */

/**
 * Remove backend-computed / read-only fields from a submit payload.
 * Prevents accidentally overwriting immutable fields on write endpoints.
 *
 * @param {Object}   data           - source form data object
 * @param {string[]} readonlyFields - field keys that must not be submitted
 * @returns {Object} a new object without the specified read-only keys
 */
export function filterReadonlyFields(data, readonlyFields = []) {
  if (!readonlyFields.length) return { ...data }
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !readonlyFields.includes(key))
  )
}

/**
 * Remove fields that should not be displayed or submitted (hidden fields).
 * Use when a backend response contains fields that are not permitted for
 * the current user role or context.
 *
 * @param {Object}   data         - source data object (e.g. API response row)
 * @param {string[]} hiddenFields - field keys to strip from the result
 * @returns {Object} a new object without the hidden field keys
 */
export function filterHiddenFields(data, hiddenFields = []) {
  if (!hiddenFields.length) return { ...data }
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !hiddenFields.includes(key))
  )
}

// ── Per-module field constraint declarations ──────────────────────────────────
// Aligned with backend serializer read_only_fields / SerializerMethodField.

/**
 * Product fields that are backend-computed / read-only.
 * Source: store/serializers.py → ProductSerializer (read_only=True fields)
 * These must never appear in PUT/POST payloads sent by the admin.
 */
export const PRODUCT_READONLY_FIELDS = [
  'id',
  'seller_username',  // source='seller.username', read_only=True
  'category_name',    // source='category.name',   read_only=True
  'images',           // many=True, read_only=True  (uploaded via separate form field)
  'created_at',
  'updated_at',
]

/**
 * Banner fields that are backend read-only.
 * Source: store/serializers.py → BannerSerializer (read_only_fields)
 */
export const BANNER_READONLY_FIELDS = ['id', 'created_at']

/**
 * Order fields that are backend read-only.
 * Source: store/serializers.py → OrderSerializer (read_only_fields)
 */
export const ORDER_READONLY_FIELDS = [
  'id',
  'buyer',
  'seller',
  'product',
  'price',
  'created_at',
  'paid_at',
  'shipped_at',
  'completed_at',
  'cancel_time',
]

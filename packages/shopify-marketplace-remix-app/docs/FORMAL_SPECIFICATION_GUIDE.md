# Formal Specification Guide for Shopify Marketplace

## Overview

This guide accompanies the Z++ formal specification (`FORMAL_SPECIFICATION.zpp`) and provides:
- An introduction to the formal specification
- Explanation of Z++ notation used
- Practical examples of specification usage
- Verification and validation guidelines

## Table of Contents

1. [Introduction to Z++ Notation](#introduction-to-z-notation)
2. [Specification Structure](#specification-structure)
3. [Key Components](#key-components)
4. [Usage Examples](#usage-examples)
5. [Verification Guidelines](#verification-guidelines)
6. [Mapping to Implementation](#mapping-to-implementation)

## Introduction to Z++ Notation

Z++ is a formal specification language based on Z notation with object-oriented extensions. It uses mathematical notation to precisely specify system behavior.

### Basic Notation Elements

| Notation | Meaning | Example |
|----------|---------|---------|
| `ℕ` | Natural numbers (0, 1, 2, ...) | `price: ℕ` |
| `𝔹` | Boolean values (true, false) | `isOnline: 𝔹` |
| `ℙ` | Power set (set of all subsets) | `permissions: ℙ STRING` |
| `⇸` | Partial function | `fields: STRING ⇸ STRING` |
| `→` | Total function | `f: A → B` |
| `seq` | Sequence | `imageUrls: seq URL` |
| `∈` | Element of | `x ∈ S` |
| `∉` | Not element of | `x ∉ S` |
| `⊕` | Function override | `f ⊕ {x ↦ y}` |
| `∀` | For all | `∀ x: Type • P(x)` |
| `∃` | There exists | `∃ x: Type • P(x)` |
| `⇒` | Implies | `P ⇒ Q` |
| `∧` | Logical AND | `P ∧ Q` |
| `∨` | Logical OR | `P ∨ Q` |

## Specification Structure

The formal specification is organized into 15 sections:

### Section 1: Basic Types and Constants
Defines primitive types and enumerations used throughout the system.

```z++
[SHOP_ID, USER_ID, PRODUCT_ID, ORDER_ID, VENDOR_ID, SESSION_ID]
STATUS ::= pending | approved | rejected | active | inactive | archived
```

### Section 2: Basic Schema Definitions
Defines the core data structures (classes) with their attributes and invariants.

```z++
class Vendor
  vendorId: VENDOR_ID
  name: STRING
  status: VENDOR_STATUS
  commissionRate: 0..100
  inv: 0 ≤ commissionRate ≤ 100
end
```

### Section 3: System State Schema
Defines the overall system state and global invariants.

```z++
class MarketplaceState
  vendors: VENDOR_ID ⇸ Vendor
  products: PRODUCT_ID ⇸ Product
  orders: ORDER_ID ⇸ Order
  inv: ∀ p: Product | p ∈ ran products • p.vendorId ∈ dom vendors
end
```

### Section 4-8: Operation Schemas
Defines operations with preconditions and postconditions.

### Section 9: Composite Operations
Defines workflows composed of multiple operations.

### Section 10: Query Operations
Defines read-only operations that don't modify state.

### Section 11-15: Cross-cutting Concerns
Defines system-wide invariants, error handling, security, performance, and events.

## Key Components

### 1. Vendor Management

#### Vendor Registration
**Preconditions:**
- New vendor ID must not already exist
- Commission rate must be within bounds
- Initial status must be pending

**Postconditions:**
- Vendor added to system
- All other state unchanged
- Success result returned

#### Vendor Approval
**Preconditions:**
- Vendor must exist
- Vendor status must be pending

**Postconditions:**
- Vendor status changed to approved
- Approval timestamp recorded
- Success result returned

### 2. Product Management

#### Product Creation
**Preconditions:**
- Product ID must not exist
- Vendor must exist and be approved
- Vendor has not exceeded product limit
- Status depends on approval mode

**Postconditions:**
- Product added to system
- Status reflects approval mode
- Success message indicates auto-approval or pending

#### Product Publication
**Preconditions:**
- Product must exist
- Product must be approved
- Product quantity must be positive

**Postconditions:**
- Product status changed to published
- Publication timestamp recorded

### 3. Order Management

#### Order Creation
**Preconditions:**
- All products exist and are published
- Products have sufficient inventory
- All vendors are approved

**Postconditions:**
- Order created
- Product inventory decremented
- Order total calculated

#### Order Completion
**Preconditions:**
- Order must exist
- Order must be in shipped status

**Postconditions:**
- Order status changed to delivered
- Vendor revenue updated with payout amounts
- Completion timestamp recorded

## Usage Examples

### Example 1: Vendor Onboarding Flow

```z++
(* Create a new vendor *)
let vendor = Vendor {
  vendorId = "V001",
  shopId = "SHOP123",
  name = "Tech Supplies Inc",
  email = "contact@techsupplies.com",
  status = vendor_pending,
  commissionRate = 15,
  revenue = 0
}

(* Register the vendor *)
RegisterVendor with
  newVendor? = vendor
returns
  result! = "Vendor registered successfully"
  vendorId! = "V001"

(* Approve the vendor *)
ApproveVendor with
  vendorId? = "V001",
  approvalTime? = currentTimestamp()
returns
  result! = "Vendor approved successfully"
```

### Example 2: Product Creation and Publication

```z++
(* Create a product *)
let product = Product {
  productId = "P001",
  vendorId = "V001",
  shopId = "SHOP123",
  title = "Wireless Mouse",
  description = "High-quality wireless mouse",
  price = 2999,  (* $29.99 in cents *)
  quantity = 100,
  status = product_pending_review,
  imageUrls = ["https://cdn.shop/mouse1.jpg"]
}

(* Create the product *)
CreateProduct with
  newProduct? = product
returns
  result! = "Product created, pending review"
  productId! = "P001"

(* Approve the product *)
ApproveProduct with
  productId? = "P001"
returns
  result! = "Product approved"

(* Publish the product *)
PublishProduct with
  productId? = "P001",
  publishTime? = currentTimestamp()
returns
  result! = "Product published"
```

### Example 3: Order Processing

```z++
(* Create an order with multiple vendor products *)
let order = Order {
  orderId = "O001",
  shopId = "SHOP123",
  customerId = "C001",
  totalAmount = 5998,  (* $59.98 *)
  status = order_created,
  vendorOrders = [
    VendorOrder {
      vendorId = "V001",
      products = [
        OrderProduct {
          productId = "P001",
          quantity = 2,
          price = 2999
        }
      ],
      subtotal = 5998,
      commission = 900,  (* 15% *)
      vendorPayout = 5098
    }
  ]
}

(* Create the order *)
CreateOrder with
  newOrder? = order
returns
  result! = "Order created successfully"
  orderId! = "O001"

(* Process the order *)
ProcessOrder with
  orderId? = "O001"
returns
  result! = "Order processing started"

(* Complete the order *)
CompleteOrder with
  orderId? = "O001",
  completionTime? = currentTimestamp()
returns
  result! = "Order completed, vendor payouts calculated"
```

## Verification Guidelines

### 1. Invariant Checking

All invariants must hold before and after every operation:

```z++
(* Check vendor commission rate invariant *)
∀ v: Vendor | v ∈ ran vendors •
  minCommissionRate ≤ v.commissionRate ≤ maxCommissionRate

(* Check product-vendor relationship *)
∀ p: Product | p ∈ ran products •
  p.vendorId ∈ dom vendors

(* Check revenue consistency *)
sum({v: Vendor | v ∈ ran vendors • v.revenue}) =
sum({o: Order | o ∈ ran orders ∧ o.status = order_delivered •
     sum({vo: VendorOrder | vo ∈ o.vendorOrders • vo.vendorPayout})})
```

### 2. Precondition Verification

Before executing an operation, verify all preconditions:

```z++
(* Before publishing a product, verify: *)
productId? ∈ dom products  (* Product exists *)
products(productId?).status = product_approved  (* Product is approved *)
products(productId?).quantity > 0  (* Product has inventory *)
```

### 3. Postcondition Verification

After executing an operation, verify all postconditions:

```z++
(* After creating an order, verify: *)
orderId! ∈ dom orders'  (* Order was added *)
∀ vo: VendorOrder | vo ∈ order.vendorOrders •
  ∀ op: OrderProduct | op ∈ vo.products •
    products'(op.productId).quantity = 
      products(op.productId).quantity - op.quantity  (* Inventory decremented *)
```

### 4. State Consistency

Verify that all state transitions maintain consistency:

```z++
(* After any operation: *)
(* 1. All domain-range relationships are maintained *)
dom vendors' = {v: Vendor | v ∈ ran vendors' • v.vendorId}

(* 2. All foreign key relationships are valid *)
∀ p: Product | p ∈ ran products' • p.vendorId ∈ dom vendors'

(* 3. All calculated fields are correct *)
∀ o: Order | o ∈ ran orders' •
  o.totalAmount = sum({vo: VendorOrder | vo ∈ o.vendorOrders • vo.subtotal})
```

## Mapping to Implementation

### Type Mappings

| Z++ Type | TypeScript Type | Prisma Type |
|----------|-----------------|-------------|
| `ℕ` | `number` | `Int` |
| `𝔹` | `boolean` | `Boolean` |
| `STRING` | `string` | `String` |
| `TIMESTAMP` | `Date` | `DateTime` |
| `seq T` | `T[]` | `T[]` (JSON) |
| `T ⇸ U` | `Map<T, U>` | Relation |

### Operation Mappings

Each operation schema maps to:
1. **API Endpoint** (REST or GraphQL)
2. **Service Method** (Business logic)
3. **Database Transaction** (Prisma operations)

Example mapping for `CreateProduct`:

**Z++ Specification:**
```z++
class CreateProduct
  inputs: newProduct?: Product
  outputs: result!: STRING, productId!: PRODUCT_ID
  pre: newProduct?.vendorId ∈ dom vendors
  post: products' = products ⊕ {newProduct?.productId ↦ newProduct?}
end
```

**TypeScript Implementation:**
```typescript
// API Route: app/routes/app.products.create.tsx
export async function action({ request }: ActionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const newProduct = parseProductFromForm(formData);
  
  // Precondition checks
  const vendor = await prisma.vendor.findUnique({
    where: { id: newProduct.vendorId }
  });
  if (!vendor) throw new Error("Vendor not found");
  
  // Operation execution
  const product = await admin.graphql(`
    mutation createProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product { id title }
      }
    }
  `, { variables: { input: newProduct } });
  
  // Postcondition: Return result
  return json({ 
    result: "Product created successfully",
    productId: product.id 
  });
}
```

### Invariant Enforcement

Invariants should be enforced at multiple levels:

1. **Database Level** (Constraints, Triggers)
2. **Application Level** (Validation middleware)
3. **API Level** (Schema validation)

Example enforcement of commission rate invariant:

**Database:**
```sql
-- Prisma schema
model Vendor {
  commissionRate Int @default(15)
  @@check(commissionRate >= 5 AND commissionRate <= 30)
}
```

**Application:**
```typescript
function validateCommissionRate(rate: number): boolean {
  const MIN_COMMISSION = 5;
  const MAX_COMMISSION = 30;
  return rate >= MIN_COMMISSION && rate <= MAX_COMMISSION;
}
```

**API:**
```typescript
const VendorSchema = z.object({
  commissionRate: z.number().min(5).max(30)
});
```

## Formal Verification Tools

The Z++ specification can be verified using:

1. **Z/EVES** - Interactive theorem prover for Z specifications
2. **ProofPower** - Proof assistant with Z support
3. **CZT (Community Z Tools)** - Type checking and animation
4. **Alloy Analyzer** - Model finding for specifications

### Example Verification Task

Verify that the `CompleteOrder` operation correctly updates vendor revenue:

```z++
theorem revenue_update_correct:
  ∀ orderId: ORDER_ID, completionTime: TIMESTAMP •
    (orderId ∈ dom orders ∧ 
     orders(orderId).status = order_shipped) ⇒
    (let vendorPayouts = 
       {vo: VendorOrder | vo ∈ orders(orderId).vendorOrders • 
         vo.vendorId ↦ vo.vendorPayout} in
     ∀ vid ↦ payout ∈ vendorPayouts •
       CompleteOrder(orderId, completionTime) ⇒
         vendors'(vid).revenue = vendors(vid).revenue + payout)
```

## Testing Against Specification

### Property-Based Testing

Generate test cases from preconditions and postconditions:

```typescript
import { fc, test } from '@fast-check/jest';

test('CreateProduct maintains invariants', () => {
  fc.assert(fc.property(
    fc.record({
      productId: fc.string(),
      vendorId: fc.string(),
      price: fc.nat(),
      quantity: fc.nat()
    }),
    (product) => {
      // Precondition: Assume vendor exists
      const vendorExists = true; // Mock
      fc.pre(vendorExists);
      
      // Execute operation
      const result = createProduct(product);
      
      // Postcondition: Product added to system
      expect(result.success).toBe(true);
      expect(getProduct(product.productId)).toBeDefined();
      
      // Invariant: Product price >= 0
      expect(getProduct(product.productId).price).toBeGreaterThanOrEqual(0);
    }
  ));
});
```

### Model-Based Testing

Use the formal specification as a test oracle:

```typescript
class SpecificationOracle {
  private state: MarketplaceState;
  
  // Mirror Z++ operations
  createProduct(product: Product): Result {
    // Check preconditions
    if (!this.checkPreconditions_CreateProduct(product)) {
      return { success: false, error: "Precondition failed" };
    }
    
    // Apply state changes
    this.state.products.set(product.productId, product);
    
    // Verify postconditions
    if (!this.checkPostconditions_CreateProduct(product)) {
      throw new Error("Postcondition failed!");
    }
    
    return { success: true, productId: product.productId };
  }
}

// Use oracle in tests
test('Implementation matches specification', () => {
  const oracle = new SpecificationOracle();
  const implementation = new ProductService();
  
  const product = generateTestProduct();
  
  const oracleResult = oracle.createProduct(product);
  const implResult = implementation.createProduct(product);
  
  expect(implResult).toEqual(oracleResult);
});
```

## Benefits of Formal Specification

1. **Precision**: Unambiguous definition of system behavior
2. **Completeness**: Covers all cases including edge cases
3. **Consistency**: Formal verification of consistency
4. **Documentation**: Precise reference for implementation
5. **Testing**: Basis for systematic test generation
6. **Verification**: Mathematical proof of correctness
7. **Communication**: Clear communication of requirements
8. **Evolution**: Safe evolution through verified changes

## Conclusion

This formal specification provides a mathematical foundation for the Shopify Marketplace application. It:

- Defines precise semantics for all operations
- Establishes invariants that must always hold
- Provides a basis for verification and testing
- Serves as authoritative documentation
- Guides implementation decisions

By maintaining alignment between the specification and implementation, we ensure the system behaves correctly and consistently.

## References

- **Z Notation**: Spivey, J.M. "The Z Notation: A Reference Manual"
- **Z++**: Lano, K. "Z++: An Object-Oriented Extension to Z"
- **Formal Methods**: Woodcock, J. and Davies, J. "Using Z: Specification, Refinement, and Proof"
- **Shopify API**: https://shopify.dev/docs/api

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-18  
**Maintained by**: Development Team

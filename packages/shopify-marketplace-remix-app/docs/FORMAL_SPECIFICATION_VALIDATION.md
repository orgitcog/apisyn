# Formal Specification Validation Examples

This document provides concrete examples of how to validate the implementation against the formal specification.

## Table of Contents

1. [State Invariant Validation](#state-invariant-validation)
2. [Operation Precondition Validation](#operation-precondition-validation)
3. [Operation Postcondition Validation](#operation-postcondition-validation)
4. [Composite Operation Validation](#composite-operation-validation)
5. [Error Case Validation](#error-case-validation)

## State Invariant Validation

### Example 1: Product-Vendor Relationship Invariant

**Specification:**
```z++
inv: ∀ p: Product | p ∈ ran products • p.vendorId ∈ dom vendors
```

**Validation Code (TypeScript):**
```typescript
async function validateProductVendorInvariant(
  prisma: PrismaClient
): Promise<boolean> {
  // Get all products
  const products = await prisma.product.findMany();
  
  // Get all vendor IDs
  const vendorIds = new Set(
    (await prisma.vendor.findMany()).map(v => v.id)
  );
  
  // Check that every product's vendor exists
  for (const product of products) {
    if (!vendorIds.has(product.vendorId)) {
      console.error(
        `Invariant violated: Product ${product.id} ` +
        `references non-existent vendor ${product.vendorId}`
      );
      return false;
    }
  }
  
  return true;
}
```

**Test Case:**
```typescript
describe('Product-Vendor Invariant', () => {
  it('should maintain product-vendor relationship', async () => {
    // Arrange
    const vendor = await createTestVendor();
    const product = await createTestProduct(vendor.id);
    
    // Act & Assert
    expect(await validateProductVendorInvariant(prisma)).toBe(true);
    
    // Cleanup
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.vendor.delete({ where: { id: vendor.id } });
  });
  
  it('should fail when product references non-existent vendor', async () => {
    // Arrange: Create orphaned product (should be prevented by DB constraints)
    const product = await prisma.product.create({
      data: {
        id: 'P999',
        vendorId: 'NON_EXISTENT',
        title: 'Test',
        price: 100,
        quantity: 1
      }
    }).catch(() => null); // This should fail
    
    // Assert
    expect(product).toBeNull(); // Product creation should be rejected
  });
});
```

### Example 2: Commission Rate Bounds Invariant

**Specification:**
```z++
inv: ∀ v: Vendor | v ∈ ran vendors •
       minCommissionRate ≤ v.commissionRate ≤ maxCommissionRate
```

**Validation Code:**
```typescript
async function validateCommissionRateInvariant(
  prisma: PrismaClient,
  minRate: number = 5,
  maxRate: number = 30
): Promise<boolean> {
  const vendors = await prisma.vendor.findMany();
  
  for (const vendor of vendors) {
    if (vendor.commissionRate < minRate || vendor.commissionRate > maxRate) {
      console.error(
        `Invariant violated: Vendor ${vendor.id} has ` +
        `commission rate ${vendor.commissionRate} ` +
        `outside bounds [${minRate}, ${maxRate}]`
      );
      return false;
    }
  }
  
  return true;
}
```

**Test Case:**
```typescript
describe('Commission Rate Invariant', () => {
  it('should enforce commission rate bounds', async () => {
    // Arrange & Act
    const vendor = await createTestVendor({ commissionRate: 15 });
    
    // Assert
    expect(await validateCommissionRateInvariant(prisma)).toBe(true);
    expect(vendor.commissionRate).toBeGreaterThanOrEqual(5);
    expect(vendor.commissionRate).toBeLessThanOrEqual(30);
  });
  
  it('should reject commission rate below minimum', async () => {
    // Act & Assert
    await expect(
      createTestVendor({ commissionRate: 2 })
    ).rejects.toThrow();
  });
  
  it('should reject commission rate above maximum', async () => {
    // Act & Assert
    await expect(
      createTestVendor({ commissionRate: 50 })
    ).rejects.toThrow();
  });
});
```

### Example 3: Revenue Consistency Invariant

**Specification:**
```z++
inv: sum({v: Vendor | v ∈ ran vendors • v.revenue}) =
     sum({o: Order | o ∈ ran orders ∧ o.status = order_delivered •
          sum({vo: VendorOrder | vo ∈ o.vendorOrders • vo.vendorPayout})})
```

**Validation Code:**
```typescript
async function validateRevenueConsistency(
  prisma: PrismaClient
): Promise<{ valid: boolean; vendorTotal: number; orderTotal: number }> {
  // Sum of all vendor revenues
  const vendors = await prisma.vendor.findMany();
  const vendorTotal = vendors.reduce((sum, v) => sum + v.revenue, 0);
  
  // Sum of all payouts from delivered orders
  const orders = await prisma.order.findMany({
    where: { status: 'DELIVERED' },
    include: { vendorOrders: true }
  });
  
  const orderTotal = orders.reduce((sum, order) => {
    const orderPayouts = order.vendorOrders.reduce(
      (vSum, vo) => vSum + vo.vendorPayout,
      0
    );
    return sum + orderPayouts;
  }, 0);
  
  return {
    valid: vendorTotal === orderTotal,
    vendorTotal,
    orderTotal
  };
}
```

**Test Case:**
```typescript
describe('Revenue Consistency Invariant', () => {
  it('should maintain revenue consistency', async () => {
    // Arrange
    const vendor = await createTestVendor({ revenue: 0 });
    const order = await createTestOrder(vendor.id, 10000); // $100.00
    
    // Act: Complete order (should update vendor revenue)
    await completeOrder(order.id);
    
    // Assert
    const { valid, vendorTotal, orderTotal } = 
      await validateRevenueConsistency(prisma);
    
    expect(valid).toBe(true);
    expect(vendorTotal).toBe(orderTotal);
  });
});
```

## Operation Precondition Validation

### Example 1: RegisterVendor Preconditions

**Specification:**
```z++
pre:
  newVendor?.vendorId ∉ dom vendors
  newVendor?.status = vendor_pending
  minCommissionRate ≤ newVendor?.commissionRate ≤ maxCommissionRate
```

**Validation Code:**
```typescript
interface RegisterVendorInput {
  vendorId: string;
  name: string;
  email: string;
  commissionRate: number;
  status: VendorStatus;
}

async function checkRegisterVendorPreconditions(
  prisma: PrismaClient,
  input: RegisterVendorInput
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Check 1: Vendor ID must not already exist
  const existingVendor = await prisma.vendor.findUnique({
    where: { id: input.vendorId }
  });
  if (existingVendor) {
    errors.push(`Vendor ID ${input.vendorId} already exists`);
  }
  
  // Check 2: Initial status must be pending
  if (input.status !== 'PENDING') {
    errors.push(`Initial status must be PENDING, got ${input.status}`);
  }
  
  // Check 3: Commission rate must be within bounds
  const MIN_RATE = 5;
  const MAX_RATE = 30;
  if (input.commissionRate < MIN_RATE || input.commissionRate > MAX_RATE) {
    errors.push(
      `Commission rate must be between ${MIN_RATE} and ${MAX_RATE}, ` +
      `got ${input.commissionRate}`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Test Case:**
```typescript
describe('RegisterVendor Preconditions', () => {
  it('should pass with valid input', async () => {
    const input: RegisterVendorInput = {
      vendorId: 'V001',
      name: 'Test Vendor',
      email: 'test@example.com',
      commissionRate: 15,
      status: 'PENDING'
    };
    
    const result = await checkRegisterVendorPreconditions(prisma, input);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should fail with duplicate vendor ID', async () => {
    // Arrange: Create existing vendor
    await createTestVendor({ id: 'V001' });
    
    // Act
    const input: RegisterVendorInput = {
      vendorId: 'V001',
      name: 'Duplicate',
      email: 'dup@example.com',
      commissionRate: 15,
      status: 'PENDING'
    };
    
    const result = await checkRegisterVendorPreconditions(prisma, input);
    
    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Vendor ID V001 already exists');
  });
  
  it('should fail with invalid status', async () => {
    const input: RegisterVendorInput = {
      vendorId: 'V002',
      name: 'Test',
      email: 'test@example.com',
      commissionRate: 15,
      status: 'APPROVED' as any // Wrong initial status
    };
    
    const result = await checkRegisterVendorPreconditions(prisma, input);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(expect.stringContaining('PENDING'));
  });
  
  it('should fail with commission rate out of bounds', async () => {
    const input: RegisterVendorInput = {
      vendorId: 'V003',
      name: 'Test',
      email: 'test@example.com',
      commissionRate: 50, // Too high
      status: 'PENDING'
    };
    
    const result = await checkRegisterVendorPreconditions(prisma, input);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      expect.stringContaining('between 5 and 30')
    );
  });
});
```

### Example 2: CreateProduct Preconditions

**Specification:**
```z++
pre:
  newProduct?.productId ∉ dom products
  newProduct?.vendorId ∈ dom vendors
  vendors(newProduct?.vendorId).status = vendor_approved
  #{p: Product | p ∈ ran products ∧ 
    p.vendorId = newProduct?.vendorId} < maxVendorProducts
```

**Validation Code:**
```typescript
async function checkCreateProductPreconditions(
  prisma: PrismaClient,
  productId: string,
  vendorId: string,
  maxVendorProducts: number = 1000
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Check 1: Product ID must not exist
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId }
  });
  if (existingProduct) {
    errors.push(`Product ID ${productId} already exists`);
  }
  
  // Check 2: Vendor must exist
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId }
  });
  if (!vendor) {
    errors.push(`Vendor ${vendorId} does not exist`);
    return { valid: false, errors }; // Can't check further
  }
  
  // Check 3: Vendor must be approved
  if (vendor.status !== 'APPROVED') {
    errors.push(`Vendor ${vendorId} is not approved`);
  }
  
  // Check 4: Vendor has not exceeded product limit
  const vendorProductCount = await prisma.product.count({
    where: { vendorId }
  });
  if (vendorProductCount >= maxVendorProducts) {
    errors.push(
      `Vendor ${vendorId} has reached maximum product limit ` +
      `(${maxVendorProducts})`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Test Case:**
```typescript
describe('CreateProduct Preconditions', () => {
  it('should pass for approved vendor within limits', async () => {
    const vendor = await createTestVendor({ status: 'APPROVED' });
    
    const result = await checkCreateProductPreconditions(
      prisma,
      'P001',
      vendor.id
    );
    
    expect(result.valid).toBe(true);
  });
  
  it('should fail for non-existent vendor', async () => {
    const result = await checkCreateProductPreconditions(
      prisma,
      'P001',
      'NON_EXISTENT'
    );
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Vendor NON_EXISTENT does not exist');
  });
  
  it('should fail for non-approved vendor', async () => {
    const vendor = await createTestVendor({ status: 'PENDING' });
    
    const result = await checkCreateProductPreconditions(
      prisma,
      'P001',
      vendor.id
    );
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      expect.stringContaining('not approved')
    );
  });
  
  it('should fail when vendor exceeds product limit', async () => {
    const vendor = await createTestVendor({ status: 'APPROVED' });
    
    // Create max products for vendor
    for (let i = 0; i < 5; i++) {
      await createTestProduct(vendor.id, `P${i}`);
    }
    
    const result = await checkCreateProductPreconditions(
      prisma,
      'P999',
      vendor.id,
      5 // Set low limit for testing
    );
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      expect.stringContaining('maximum product limit')
    );
  });
});
```

## Operation Postcondition Validation

### Example 1: CreateOrder Postconditions

**Specification:**
```z++
post:
  orders' = orders ⊕ {newOrder?.orderId ↦ newOrder?}
  products' = {pid ↦ p | pid ↦ p ∈ products ∧
               (∃ vo: VendorOrder | vo ∈ newOrder?.vendorOrders •
                ∃ op: OrderProduct | op ∈ vo.products •
                  op.productId = pid ⇒ 
                    p.quantity = products(pid).quantity - op.quantity)}
```

**Validation Code:**
```typescript
async function verifyCreateOrderPostconditions(
  prisma: PrismaClient,
  orderId: string,
  initialProductQuantities: Map<string, number>
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Check 1: Order exists in system
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      vendorOrders: {
        include: { products: true }
      }
    }
  });
  
  if (!order) {
    errors.push(`Order ${orderId} was not created`);
    return { valid: false, errors };
  }
  
  // Check 2: Product quantities decremented correctly
  for (const vendorOrder of order.vendorOrders) {
    for (const orderProduct of vendorOrder.products) {
      const currentProduct = await prisma.product.findUnique({
        where: { id: orderProduct.productId }
      });
      
      if (!currentProduct) {
        errors.push(`Product ${orderProduct.productId} not found`);
        continue;
      }
      
      const initialQuantity = initialProductQuantities.get(
        orderProduct.productId
      );
      const expectedQuantity = initialQuantity! - orderProduct.quantity;
      
      if (currentProduct.quantity !== expectedQuantity) {
        errors.push(
          `Product ${orderProduct.productId} quantity is ` +
          `${currentProduct.quantity}, expected ${expectedQuantity}`
        );
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Test Case:**
```typescript
describe('CreateOrder Postconditions', () => {
  it('should create order and update inventory', async () => {
    // Arrange
    const vendor = await createTestVendor({ status: 'APPROVED' });
    const product = await createTestProduct(vendor.id, 'P001', {
      quantity: 100
    });
    
    const initialQuantities = new Map([['P001', 100]]);
    
    // Act
    const order = await createOrder({
      customerId: 'C001',
      items: [{ productId: 'P001', quantity: 5 }]
    });
    
    // Assert
    const result = await verifyCreateOrderPostconditions(
      prisma,
      order.id,
      initialQuantities
    );
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    
    // Verify specific postcondition
    const updatedProduct = await prisma.product.findUnique({
      where: { id: 'P001' }
    });
    expect(updatedProduct?.quantity).toBe(95); // 100 - 5
  });
});
```

### Example 2: CompleteOrder Postconditions

**Specification:**
```z++
post:
  orders' = orders ⊕ {orderId? ↦ o[status := order_delivered,
                                    completedAt := completionTime?]}
  vendors' = {vid ↦ v | vid ↦ v ∈ vendors ∧
              (∃ vo: VendorOrder | vo ∈ orders(orderId?).vendorOrders •
                vo.vendorId = vid ⇒ 
                  v.revenue = vendors(vid).revenue + vo.vendorPayout)}
```

**Validation Code:**
```typescript
async function verifyCompleteOrderPostconditions(
  prisma: PrismaClient,
  orderId: string,
  initialVendorRevenues: Map<string, number>
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Check 1: Order status updated to DELIVERED
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { vendorOrders: true }
  });
  
  if (!order) {
    errors.push(`Order ${orderId} not found`);
    return { valid: false, errors };
  }
  
  if (order.status !== 'DELIVERED') {
    errors.push(
      `Order status is ${order.status}, expected DELIVERED`
    );
  }
  
  // Check 2: completedAt timestamp set
  if (!order.completedAt) {
    errors.push('Order completedAt not set');
  }
  
  // Check 3: Vendor revenues updated
  for (const vendorOrder of order.vendorOrders) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorOrder.vendorId }
    });
    
    if (!vendor) {
      errors.push(`Vendor ${vendorOrder.vendorId} not found`);
      continue;
    }
    
    const initialRevenue = initialVendorRevenues.get(vendorOrder.vendorId) || 0;
    const expectedRevenue = initialRevenue + vendorOrder.vendorPayout;
    
    if (vendor.revenue !== expectedRevenue) {
      errors.push(
        `Vendor ${vendor.id} revenue is ${vendor.revenue}, ` +
        `expected ${expectedRevenue}`
      );
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Test Case:**
```typescript
describe('CompleteOrder Postconditions', () => {
  it('should update order status and vendor revenue', async () => {
    // Arrange
    const vendor = await createTestVendor({ 
      status: 'APPROVED',
      revenue: 0
    });
    const order = await createTestOrder(vendor.id, 10000); // $100
    
    const initialRevenues = new Map([[vendor.id, 0]]);
    
    // Act
    await completeOrder(order.id);
    
    // Assert
    const result = await verifyCompleteOrderPostconditions(
      prisma,
      order.id,
      initialRevenues
    );
    
    expect(result.valid).toBe(true);
    
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id }
    });
    expect(updatedOrder?.status).toBe('DELIVERED');
    expect(updatedOrder?.completedAt).toBeTruthy();
    
    const updatedVendor = await prisma.vendor.findUnique({
      where: { id: vendor.id }
    });
    expect(updatedVendor?.revenue).toBeGreaterThan(0);
  });
});
```

## Composite Operation Validation

### Example: Product Publication Flow

**Specification:**
```z++
class ProductPublicationFlow
  comprises CreateProduct ⨾ ApproveProduct ⨾ PublishProduct
```

**Test Case:**
```typescript
describe('Product Publication Flow', () => {
  it('should complete full publication workflow', async () => {
    // Arrange
    const vendor = await createTestVendor({ status: 'APPROVED' });
    
    // Step 1: CreateProduct
    const productData = {
      id: 'P001',
      vendorId: vendor.id,
      title: 'Test Product',
      price: 2999,
      quantity: 100
    };
    
    // Verify CreateProduct preconditions
    const createPreResult = await checkCreateProductPreconditions(
      prisma,
      productData.id,
      productData.vendorId
    );
    expect(createPreResult.valid).toBe(true);
    
    // Execute CreateProduct
    const product = await createProduct(productData);
    expect(product.status).toBe('PENDING_REVIEW');
    
    // Step 2: ApproveProduct
    const approvePreResult = await checkApproveProductPreconditions(
      prisma,
      product.id
    );
    expect(approvePreResult.valid).toBe(true);
    
    await approveProduct(product.id);
    
    const approvedProduct = await prisma.product.findUnique({
      where: { id: product.id }
    });
    expect(approvedProduct?.status).toBe('APPROVED');
    
    // Step 3: PublishProduct
    const publishPreResult = await checkPublishProductPreconditions(
      prisma,
      product.id
    );
    expect(publishPreResult.valid).toBe(true);
    
    await publishProduct(product.id);
    
    const publishedProduct = await prisma.product.findUnique({
      where: { id: product.id }
    });
    expect(publishedProduct?.status).toBe('PUBLISHED');
    expect(publishedProduct?.publishedAt).toBeTruthy();
    
    // Verify all invariants still hold
    expect(await validateProductVendorInvariant(prisma)).toBe(true);
  });
});
```

## Error Case Validation

### Example: Error Handling for Invalid Operations

**Specification:**
```z++
class OperationError
  outputs: error!: ErrorResponse
  post: error!.errorMessage = "Operation " ⊕ operation? ⊕ " failed: " ⊕ context?
```

**Test Case:**
```typescript
describe('Error Handling', () => {
  it('should return proper error for precondition violation', async () => {
    // Arrange: Non-approved vendor tries to create product
    const vendor = await createTestVendor({ status: 'PENDING' });
    
    // Act & Assert
    await expect(
      createProduct({
        vendorId: vendor.id,
        title: 'Test',
        price: 100,
        quantity: 1
      })
    ).rejects.toMatchObject({
      errorCode: 400,
      errorType: 'validation_error',
      errorMessage: expect.stringContaining('Vendor')
    });
  });
  
  it('should return proper error for not found', async () => {
    await expect(
      approveProduct('NON_EXISTENT')
    ).rejects.toMatchObject({
      errorCode: 404,
      errorType: 'not_found',
      errorMessage: expect.stringContaining('Product')
    });
  });
  
  it('should return proper error for authorization', async () => {
    const vendor = await createTestVendor();
    const otherVendor = await createTestVendor();
    const product = await createTestProduct(otherVendor.id);
    
    // Vendor trying to modify another vendor's product
    await expect(
      updateProduct(product.id, { userId: vendor.id, ... })
    ).rejects.toMatchObject({
      errorCode: 403,
      errorType: 'authorization_error'
    });
  });
});
```

## Conclusion

These validation examples demonstrate how to:

1. **Verify invariants** throughout the system lifecycle
2. **Check preconditions** before operations
3. **Validate postconditions** after operations
4. **Test composite flows** that chain multiple operations
5. **Handle errors** according to specification

By following these patterns, you can ensure the implementation faithfully adheres to the formal specification.

---

**Last Updated**: 2025-10-18  
**Version**: 1.0

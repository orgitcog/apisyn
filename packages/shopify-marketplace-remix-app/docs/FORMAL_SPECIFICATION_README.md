# Formal Specification Documentation

This directory contains the formal specification of the Shopify Marketplace Remix App using Z++ notation.

## 📚 Documents

### 1. [FORMAL_SPECIFICATION.zpp](./FORMAL_SPECIFICATION.zpp)
The complete formal specification written in Z++ notation. This document includes:
- Basic type definitions and enumerations
- State schemas for all system components
- Operation schemas with pre/post conditions
- System-wide invariants and constraints
- Error handling and security models
- Performance constraints
- Webhook event specifications

### 2. [FORMAL_SPECIFICATION_GUIDE.md](./FORMAL_SPECIFICATION_GUIDE.md)
A comprehensive guide to understanding and using the formal specification:
- Introduction to Z++ notation
- Explanation of specification structure
- Practical usage examples
- Verification guidelines
- Mapping to implementation
- Testing strategies

## 🎯 Purpose

The formal specification serves multiple purposes:

1. **Precise Documentation**: Unambiguous definition of system behavior
2. **Verification**: Mathematical basis for proving correctness
3. **Testing**: Foundation for systematic test generation
4. **Implementation Guide**: Clear reference for developers
5. **Communication**: Common language for stakeholders
6. **Evolution**: Safe system evolution through verified changes

## 🏗️ Specification Overview

The specification is organized into 15 major sections:

### Core Components

| Section | Description |
|---------|-------------|
| 1. Basic Types | Primitive types and enumerations (IDs, statuses, roles) |
| 2. Basic Schemas | Core data structures (Vendor, Product, Order, Session) |
| 3. System State | Overall system state and global invariants |
| 4. Initialization | Initial system state definition |

### Operations

| Section | Description |
|---------|-------------|
| 5. Vendor Management | Register, approve, suspend vendors |
| 6. Product Management | Create, approve, publish, update products |
| 7. Order Management | Create, process, complete orders |
| 8. Session Management | Create, validate, expire sessions |
| 9. Composite Operations | Multi-step workflows |
| 10. Query Operations | Read-only data retrieval |

### Cross-cutting Concerns

| Section | Description |
|---------|-------------|
| 11. System Invariants | Global consistency constraints |
| 12. Error Handling | Error response schemas |
| 13. Security | Authorization and permissions |
| 14. Performance | Scalability constraints |
| 15. Webhooks | Event processing schemas |

## 🔍 Key Concepts

### State Schema
```z++
class MarketplaceState
  vendors: VENDOR_ID ⇸ Vendor
  products: PRODUCT_ID ⇸ Product
  orders: ORDER_ID ⇸ Order
  sessions: SESSION_ID ⇸ Session
  ...
end
```

The state schema defines:
- All system entities as partial functions (⇸)
- Global invariants that must always hold
- Relationships between entities

### Operation Schema
```z++
class RegisterVendor
  extends MarketplaceState
  
  inputs: newVendor?: Vendor
  outputs: result!: STRING, vendorId!: VENDOR_ID
  
  pre: (* preconditions *)
  post: (* postconditions *)
end
```

Each operation defines:
- **Inputs**: Parameters (marked with ?)
- **Outputs**: Return values (marked with !)
- **Preconditions**: What must be true before execution
- **Postconditions**: What must be true after execution

### Invariants
```z++
inv: ∀ p: Product | p ∈ ran products • p.vendorId ∈ dom vendors
```

Invariants are properties that must always hold:
- Type constraints
- Business rules
- Consistency requirements
- Referential integrity

## 📖 Quick Start

### For Developers

1. Read the [Specification Guide](./FORMAL_SPECIFICATION_GUIDE.md) introduction
2. Review relevant sections in [FORMAL_SPECIFICATION.zpp](./FORMAL_SPECIFICATION.zpp)
3. Check the mapping to implementation section
4. Use invariants for validation logic

### For Testers

1. Review operation preconditions for test case generation
2. Use postconditions as test assertions
3. Verify invariants in integration tests
4. Follow the testing guidelines in the guide

### For Product Managers

1. Review the state schema to understand data model
2. Check operation schemas for feature behavior
3. Review composite operations for workflows
4. Examine invariants for business rules

## 🔗 Integration with Codebase

The formal specification maps to the implementation:

| Specification | Implementation |
|---------------|----------------|
| Basic Types | TypeScript types (`app/types/*.ts`) |
| State Schema | Prisma schema (`prisma/schema.prisma`) |
| Operations | API routes (`app/routes/app.*.tsx`) |
| Invariants | Validation logic and DB constraints |
| Queries | Loader functions in routes |

## ✅ Verification Checklist

When implementing features based on this specification:

- [ ] All preconditions checked before operation
- [ ] All postconditions satisfied after operation
- [ ] All relevant invariants maintained
- [ ] Error cases handled per error schemas
- [ ] Authorization checked per security schemas
- [ ] Performance constraints considered
- [ ] Tests cover specification requirements

## 🛠️ Tools

The specification can be processed with:

1. **Z/EVES** - Theorem prover
2. **CZT** - Type checker
3. **ProofPower** - Proof assistant
4. **Alloy Analyzer** - Model finder

For practical use without formal tools:
- Use specification for code reviews
- Generate test cases from operations
- Validate implementations against postconditions
- Use invariants in assertions

## 📊 Specification Metrics

| Metric | Count |
|--------|-------|
| Basic Types | 15 |
| Enumerations | 7 |
| Classes/Schemas | 35+ |
| Operations | 20+ |
| Invariants | 30+ |
| Lines of Specification | 850+ |

## 🔄 Maintenance

The specification should be updated when:

1. **New Features**: Add operation schemas
2. **Data Model Changes**: Update state schemas
3. **Business Rule Changes**: Revise invariants
4. **New Constraints**: Add to appropriate section

### Update Process

1. Modify the specification
2. Verify consistency of changes
3. Update the guide with examples
4. Update this README if structure changes
5. Communicate changes to team

## 📝 Example Usage

### Implementing a New Feature

1. **Define in Specification**: Add operation schema
```z++
class NewFeature
  extends MarketplaceState
  inputs: param?: Type
  outputs: result!: Type
  pre: (* constraints *)
  post: (* state changes *)
end
```

2. **Implement in Code**:
```typescript
export async function action({ request }: ActionArgs) {
  // Check preconditions
  if (!checkPreconditions()) {
    throw new Error("Precondition failed");
  }
  
  // Execute operation
  const result = await executeOperation();
  
  // Verify postconditions (in tests)
  assert(checkPostconditions());
  
  return json({ result });
}
```

3. **Write Tests**:
```typescript
test('NewFeature matches specification', () => {
  // Arrange: Set up preconditions
  const initialState = setupPreconditions();
  
  // Act: Execute operation
  const result = newFeature(params);
  
  // Assert: Verify postconditions
  expect(checkPostconditions(result)).toBe(true);
});
```

## 🎓 Learning Resources

- **Z Notation Tutorial**: [Spivey's Z Notation Reference Manual](http://spivey.oriel.ox.ac.uk/~mike/zrm/)
- **Z++ Language**: [Lano's Z++ Papers](http://www.dcs.kcl.ac.uk/staff/kevin/ZPlusPlus/)
- **Formal Methods**: [Woodcock & Davies "Using Z"](https://www.amazon.com/Using-Specification-Refinement-Proof-Programming/dp/0139484728)

## 💡 Best Practices

1. **Keep Specification and Code in Sync**: Review spec during code reviews
2. **Use Specification for Design**: Design new features in spec first
3. **Generate Tests from Spec**: Use operations as test case templates
4. **Document Deviations**: Note where implementation differs from spec
5. **Update Regularly**: Treat spec as living documentation

## 🤝 Contributing

When contributing to the specification:

1. Follow existing notation conventions
2. Maintain consistency with existing schemas
3. Add examples to the guide
4. Verify new invariants don't conflict
5. Update this README if needed

## 📞 Questions?

For questions about the formal specification:

1. Check the [Specification Guide](./FORMAL_SPECIFICATION_GUIDE.md)
2. Review example mappings in the guide
3. Consult the architecture documentation
4. Ask the development team

## 📄 License

This specification is part of the Shopify Marketplace Remix App project and follows the same license as the main repository.

---

**Version**: 1.0  
**Last Updated**: 2025-10-18  
**Status**: ✅ Complete

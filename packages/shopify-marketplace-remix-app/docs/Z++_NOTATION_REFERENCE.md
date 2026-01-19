# Z++ Notation Quick Reference Card

A quick reference card for reading the formal specification. Print or keep this handy!

## Mathematical Symbols

### Basic Sets and Types

| Symbol | Meaning | Example |
|--------|---------|---------|
| `ℕ` | Natural numbers (0, 1, 2, ...) | `price: ℕ` |
| `ℤ` | Integers (..., -1, 0, 1, ...) | `balance: ℤ` |
| `𝔹` | Boolean (true, false) | `isValid: 𝔹` |
| `ℙ S` | Power set (all subsets of S) | `ℙ STRING` |
| `S × T` | Cartesian product | `ℕ × STRING` |

### Ranges and Constraints

| Symbol | Meaning | Example |
|--------|---------|---------|
| `0..100` | Range from 0 to 100 | `percentage: 0..100` |
| `m..n` | Range from m to n | `age: 18..120` |

### Functions and Relations

| Symbol | Meaning | Description |
|--------|---------|-------------|
| `→` | Total function | Every input has output |
| `⇸` | Partial function | Some inputs may not have output |
| `↦` | Maps to | `x ↦ y` means x maps to y |
| `⊕` | Override | `f ⊕ {x ↦ y}` updates f at x |
| `dom f` | Domain | All inputs that f is defined for |
| `ran f` | Range | All possible outputs of f |
| `⨾` | Composition | `f ⨾ g` means apply f then g |
| `⩤` | Domain restriction | `{x} ⩤ f` excludes x from domain |

### Collections

| Symbol | Meaning | Example |
|--------|---------|---------|
| `seq T` | Sequence of T | `imageUrls: seq URL` |
| `[x, y, z]` | Sequence literal | `[1, 2, 3]` |
| `{x, y, z}` | Set literal | `{1, 2, 3}` |
| `{x ↦ y}` | Function/map literal | `{1 ↦ "one"}` |
| `#s` | Size/cardinality | `#products` = count |
| `∅` | Empty set | No elements |

### Set Operations

| Symbol | Meaning | Example |
|--------|---------|---------|
| `∈` | Element of | `x ∈ S` |
| `∉` | Not element of | `x ∉ S` |
| `⊆` | Subset of | `A ⊆ B` |
| `⊂` | Proper subset | `A ⊂ B` |
| `∪` | Union | `A ∪ B` |
| `∩` | Intersection | `A ∩ B` |
| `∖` | Difference | `A ∖ B` |
| `⊇` | Superset | `A ⊇ B` |

### Logic Operators

| Symbol | Meaning | Example |
|--------|---------|---------|
| `∧` | Logical AND | `P ∧ Q` |
| `∨` | Logical OR | `P ∨ Q` |
| `¬` | Logical NOT | `¬P` |
| `⇒` | Implies | `P ⇒ Q` |
| `⇔` | If and only if | `P ⇔ Q` |

### Quantifiers

| Symbol | Meaning | Example |
|--------|---------|---------|
| `∀` | For all | `∀ x: T • P(x)` |
| `∃` | There exists | `∃ x: T • P(x)` |
| `∃!` | Exists unique | `∃! x: T • P(x)` |

### Aggregation

| Symbol | Meaning | Example |
|--------|---------|---------|
| `sum` | Summation | `sum({x \| x ∈ S • f(x)})` |
| `max` | Maximum | `max({1, 2, 3})` |
| `min` | Minimum | `min({1, 2, 3})` |

## Z++ Specific Notation

### Class Definition

```z++
class ClassName
  attribute1: Type1
  attribute2: Type2
  
  (* Invariants - always true *)
  inv: condition1
  inv: condition2
end
```

### Operation Schema

```z++
class OperationName
  extends StateSchema
  
  inputs:
    param1?: Type1    (* ? means input *)
    param2?: Type2
  
  outputs:
    result!: Type3    (* ! means output *)
    value!: Type4
  
  pre:                (* Preconditions *)
    (* what must be true before *)
  
  post:               (* Postconditions *)
    (* what must be true after *)
    (* ' means "after" state *)
end
```

### State Priming

| Notation | Meaning |
|----------|---------|
| `x` | Current value of x |
| `x'` | Next/after value of x |
| `x?` | Input parameter x |
| `x!` | Output parameter x |

### Enumerations

```z++
STATUS ::= pending | approved | rejected
```

Means STATUS can be one of: `pending`, `approved`, or `rejected`

### Type Declarations

```z++
[TYPE_NAME]           (* Given type (primitive) *)
type option           (* Optional type *)
```

## Common Patterns

### Pattern 1: Partial Function (Database Table)

```z++
vendors: VENDOR_ID ⇸ Vendor
```

Reads as: "vendors is a partial function from VENDOR_ID to Vendor"
Meaning: Like a database table, maps vendor IDs to vendor objects

### Pattern 2: Invariant (Always True)

```z++
inv: ∀ p: Product | p ∈ ran products • p.vendorId ∈ dom vendors
```

Reads as: "For all products p in the range of products, p.vendorId is in the domain of vendors"
Meaning: Every product must have a valid vendor

### Pattern 3: Precondition (Must Be True Before)

```z++
pre: newVendor?.vendorId ∉ dom vendors
```

Reads as: "The new vendor's ID is not in the domain of vendors"
Meaning: Vendor ID must not already exist

### Pattern 4: Postcondition (Must Be True After)

```z++
post: vendors' = vendors ⊕ {newVendor?.vendorId ↦ newVendor?}
```

Reads as: "The after-state of vendors equals vendors overridden with new vendor"
Meaning: The new vendor has been added to the system

### Pattern 5: Set Comprehension

```z++
{x: Type | condition • expression}
```

Reads as: "The set of expressions for all x of Type where condition holds"

Example:
```z++
{p: Product | p ∈ ran products ∧ p.status = published • p.productId}
```
Meaning: Set of all product IDs for published products

### Pattern 6: Sequence Comprehension

```z++
[x: Type | condition]
```

Example:
```z++
[v: Vendor | v ∈ ran vendors ∧ v.status = pending]
```
Meaning: List of all pending vendors

### Pattern 7: Summation

```z++
sum({x: Type | condition • expression})
```

Example:
```z++
sum({o: Order | o ∈ ran orders • o.totalAmount})
```
Meaning: Sum of all order amounts

## Reading Tips

### Tip 1: Read `∀` as "for all"
```z++
∀ p: Product | p ∈ ran products • p.price ≥ 0
```
"For all products p in products, price is >= 0"

### Tip 2: Read `∃` as "there exists"
```z++
∃ v: Vendor | v ∈ ran vendors ∧ v.status = approved
```
"There exists a vendor v in vendors that is approved"

### Tip 3: Read `⇒` as "implies"
```z++
status = published ⇒ publishedAt ≠ null
```
"If status is published, then publishedAt is not null"

### Tip 4: Read `∈` as "in" or "belongs to"
```z++
vendorId ∈ dom vendors
```
"vendorId is in the domain of vendors"

### Tip 5: Read `'` as "after"
```z++
products' = products ⊕ {id ↦ product}
```
"products after equals products with product added"

## Quick Translation Guide

| Z++ | Plain English | TypeScript |
|-----|---------------|------------|
| `x: ℕ` | x is a natural number | `x: number` (>= 0) |
| `x: 𝔹` | x is a boolean | `x: boolean` |
| `x: seq T` | x is a sequence of T | `x: T[]` |
| `f: A ⇸ B` | f maps A to B (partial) | `f: Map<A, B>` |
| `x ∈ S` | x is in set S | `S.has(x)` |
| `x ∉ S` | x is not in S | `!S.has(x)` |
| `#S` | size of S | `S.size` or `S.length` |
| `dom f` | domain of f | `f.keys()` |
| `ran f` | range of f | `f.values()` |
| `f ⊕ {x ↦ y}` | f with x→y updated | `f.set(x, y)` |
| `∀ x: T • P(x)` | for all x of type T, P(x) | `T.every(x => P(x))` |
| `∃ x: T • P(x)` | exists x of type T, P(x) | `T.some(x => P(x))` |
| `sum({...})` | sum of set | `reduce((a,b) => a+b)` |

## Common Specification Patterns

### Pattern: Non-Null When Status

```z++
inv: status = approved ⇒ approvedAt ≠ null
```
Translation: "When approved, must have approval date"

### Pattern: Foreign Key

```z++
inv: ∀ p: Product | p ∈ ran products • p.vendorId ∈ dom vendors
```
Translation: "Every product references an existing vendor"

### Pattern: Range Constraint

```z++
inv: 0 ≤ commissionRate ≤ 100
```
Translation: "Commission rate is between 0 and 100"

### Pattern: Calculated Field

```z++
inv: totalAmount = sum({item | item ∈ items • item.price * item.quantity})
```
Translation: "Total equals sum of item prices times quantities"

### Pattern: Mutual Exclusion

```z++
inv: (status = active ∧ status ≠ inactive)
```
Translation: "Can't be both active and inactive"

### Pattern: Referential Integrity

```z++
inv: dom products = {p: Product | p ∈ ran products • p.productId}
```
Translation: "Product IDs in domain match those in range"

## Cheat Sheet for Common Tasks

### Check if something exists
```z++
x ∈ dom collection
```

### Add to collection
```z++
collection' = collection ⊕ {key ↦ value}
```

### Remove from collection
```z++
collection' = {key} ⩤ collection
```

### Filter collection
```z++
{x: Type | x ∈ ran collection ∧ condition}
```

### Count matching items
```z++
#{x: Type | x ∈ ran collection ∧ condition}
```

### Sum field values
```z++
sum({x: Type | x ∈ ran collection • x.field})
```

## Print-Friendly Version

**Quick Symbols:**
- `ℕ` = Natural numbers
- `𝔹` = Boolean  
- `∈` = in, belongs to
- `∉` = not in
- `∀` = for all
- `∃` = exists
- `⇒` = implies
- `∧` = and
- `∨` = or
- `'` = after/next state
- `?` = input parameter
- `!` = output parameter

**Remember:**
1. `inv:` = must always be true
2. `pre:` = must be true before operation
3. `post:` = must be true after operation
4. Primed variables (`x'`) refer to state after operation

---

**Pro Tip**: Keep this card handy while reading the specification. With practice, the notation becomes natural!

---

**Version**: 1.0  
**Last Updated**: 2025-10-18

*For the complete specification, see [FORMAL_SPECIFICATION.zpp](./FORMAL_SPECIFICATION.zpp)*

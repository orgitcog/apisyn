#!/usr/bin/env python3
"""
Shopify Zone Test API Demo Script
==================================
A comprehensive demonstration of Shopify Admin API and Storefront API capabilities.

This script demonstrates:
- Shop information retrieval
- Product management (CRUD operations)
- Customer management
- Order management
- Collection management
- Inventory management
- Webhook management
- Storefront API (GraphQL)

Author: Manus AI
Store: zone-teste.myshopify.com
"""

import os
import json
import requests
from datetime import datetime
from typing import Optional, Dict, Any, List


class ShopifyAdminAPI:
    """
    Shopify Admin REST API Client
    
    Provides methods for interacting with Shopify's Admin API including
    products, customers, orders, collections, inventory, and more.
    """
    
    def __init__(
        self,
        store_url: str = None,
        access_token: str = None,
        api_version: str = "2024-01"
    ):
        """
        Initialize the Shopify Admin API client.
        
        Args:
            store_url: The myshopify.com domain (e.g., 'zone-teste.myshopify.com')
            access_token: Admin API access token
            api_version: API version to use (default: 2024-01)
        """
        self.store_url = store_url or os.environ.get("SHOPIFY_STORE_URL", "zone-teste.myshopify.com")
        self.access_token = access_token or os.environ.get("SHOPIFY_ADMIN_API_ACCESS_TOKEN_ZONE_TEST")
        self.api_version = api_version
        self.base_url = f"https://{self.store_url}/admin/api/{self.api_version}"
        
        self.headers = {
            "X-Shopify-Access-Token": self.access_token,
            "Content-Type": "application/json"
        }
    
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make an API request to Shopify Admin API."""
        url = f"{self.base_url}/{endpoint}"
        
        response = requests.request(
            method=method,
            url=url,
            headers=self.headers,
            json=data,
            params=params
        )
        
        if response.status_code >= 400:
            print(f"Error {response.status_code}: {response.text}")
            response.raise_for_status()
        
        return response.json() if response.text else {}
    
    # ==================== SHOP ====================
    
    def get_shop(self) -> Dict[str, Any]:
        """
        Get shop information.
        
        Returns:
            Dict containing shop details including name, email, currency, etc.
        """
        return self._request("GET", "shop.json")
    
    def get_access_scopes(self) -> Dict[str, Any]:
        """
        Get the access scopes for the current API token.
        
        Returns:
            Dict containing list of access scopes
        """
        url = f"https://{self.store_url}/admin/oauth/access_scopes.json"
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    # ==================== PRODUCTS ====================
    
    def get_products(self, limit: int = 50, **kwargs) -> Dict[str, Any]:
        """
        Get a list of products.
        
        Args:
            limit: Maximum number of products to return (max 250)
            **kwargs: Additional query parameters (title, vendor, product_type, etc.)
        
        Returns:
            Dict containing list of products
        """
        params = {"limit": limit, **kwargs}
        return self._request("GET", "products.json", params=params)
    
    def get_product(self, product_id: int) -> Dict[str, Any]:
        """Get a single product by ID."""
        return self._request("GET", f"products/{product_id}.json")
    
    def create_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new product.
        
        Args:
            product_data: Product data including title, body_html, vendor, 
                         product_type, variants, images, etc.
        
        Returns:
            Dict containing the created product
        
        Example:
            product = api.create_product({
                "title": "Test Product",
                "body_html": "<p>Product description</p>",
                "vendor": "Zone",
                "product_type": "Electronics",
                "variants": [{"price": "99.99", "sku": "TEST-001"}]
            })
        """
        return self._request("POST", "products.json", data={"product": product_data})
    
    def update_product(self, product_id: int, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing product."""
        return self._request("PUT", f"products/{product_id}.json", data={"product": product_data})
    
    def delete_product(self, product_id: int) -> Dict[str, Any]:
        """Delete a product."""
        return self._request("DELETE", f"products/{product_id}.json")
    
    def get_product_count(self) -> Dict[str, Any]:
        """Get the count of products."""
        return self._request("GET", "products/count.json")
    
    # ==================== PRODUCT VARIANTS ====================
    
    def get_variants(self, product_id: int) -> Dict[str, Any]:
        """Get all variants for a product."""
        return self._request("GET", f"products/{product_id}/variants.json")
    
    def create_variant(self, product_id: int, variant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new variant for a product."""
        return self._request("POST", f"products/{product_id}/variants.json", data={"variant": variant_data})
    
    def update_variant(self, variant_id: int, variant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a variant."""
        return self._request("PUT", f"variants/{variant_id}.json", data={"variant": variant_data})
    
    # ==================== CUSTOMERS ====================
    
    def get_customers(self, limit: int = 50, **kwargs) -> Dict[str, Any]:
        """
        Get a list of customers.
        
        Args:
            limit: Maximum number of customers to return
            **kwargs: Additional query parameters (email, created_at_min, etc.)
        
        Returns:
            Dict containing list of customers
        """
        params = {"limit": limit, **kwargs}
        return self._request("GET", "customers.json", params=params)
    
    def get_customer(self, customer_id: int) -> Dict[str, Any]:
        """Get a single customer by ID."""
        return self._request("GET", f"customers/{customer_id}.json")
    
    def create_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new customer.
        
        Args:
            customer_data: Customer data including first_name, last_name, 
                          email, phone, addresses, etc.
        
        Returns:
            Dict containing the created customer
        
        Example:
            customer = api.create_customer({
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com",
                "phone": "+27123456789",
                "addresses": [{
                    "address1": "123 Main St",
                    "city": "Cape Town",
                    "country": "South Africa"
                }]
            })
        """
        return self._request("POST", "customers.json", data={"customer": customer_data})
    
    def update_customer(self, customer_id: int, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing customer."""
        return self._request("PUT", f"customers/{customer_id}.json", data={"customer": customer_data})
    
    def delete_customer(self, customer_id: int) -> Dict[str, Any]:
        """Delete a customer."""
        return self._request("DELETE", f"customers/{customer_id}.json")
    
    def search_customers(self, query: str) -> Dict[str, Any]:
        """Search customers by query string."""
        return self._request("GET", "customers/search.json", params={"query": query})
    
    def get_customer_count(self) -> Dict[str, Any]:
        """Get the count of customers."""
        return self._request("GET", "customers/count.json")
    
    # ==================== ORDERS ====================
    
    def get_orders(self, limit: int = 50, status: str = "any", **kwargs) -> Dict[str, Any]:
        """
        Get a list of orders.
        
        Args:
            limit: Maximum number of orders to return
            status: Order status filter (open, closed, cancelled, any)
            **kwargs: Additional query parameters
        
        Returns:
            Dict containing list of orders
        """
        params = {"limit": limit, "status": status, **kwargs}
        return self._request("GET", "orders.json", params=params)
    
    def get_order(self, order_id: int) -> Dict[str, Any]:
        """Get a single order by ID."""
        return self._request("GET", f"orders/{order_id}.json")
    
    def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new order.
        
        Args:
            order_data: Order data including line_items, customer, 
                       shipping_address, billing_address, etc.
        
        Returns:
            Dict containing the created order
        
        Example:
            order = api.create_order({
                "line_items": [{"variant_id": 123, "quantity": 1}],
                "customer": {"id": 456},
                "financial_status": "pending"
            })
        """
        return self._request("POST", "orders.json", data={"order": order_data})
    
    def update_order(self, order_id: int, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing order."""
        return self._request("PUT", f"orders/{order_id}.json", data={"order": order_data})
    
    def close_order(self, order_id: int) -> Dict[str, Any]:
        """Close an order."""
        return self._request("POST", f"orders/{order_id}/close.json")
    
    def cancel_order(self, order_id: int, reason: str = "other") -> Dict[str, Any]:
        """Cancel an order."""
        return self._request("POST", f"orders/{order_id}/cancel.json", data={"reason": reason})
    
    def get_order_count(self, status: str = "any") -> Dict[str, Any]:
        """Get the count of orders."""
        return self._request("GET", "orders/count.json", params={"status": status})
    
    # ==================== DRAFT ORDERS ====================
    
    def get_draft_orders(self, limit: int = 50) -> Dict[str, Any]:
        """Get a list of draft orders."""
        return self._request("GET", "draft_orders.json", params={"limit": limit})
    
    def create_draft_order(self, draft_order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new draft order.
        
        Args:
            draft_order_data: Draft order data including line_items, customer, etc.
        
        Returns:
            Dict containing the created draft order
        """
        return self._request("POST", "draft_orders.json", data={"draft_order": draft_order_data})
    
    def complete_draft_order(self, draft_order_id: int, payment_pending: bool = False) -> Dict[str, Any]:
        """Complete a draft order and convert it to an order."""
        return self._request(
            "PUT", 
            f"draft_orders/{draft_order_id}/complete.json",
            params={"payment_pending": payment_pending}
        )
    
    # ==================== COLLECTIONS ====================
    
    def get_custom_collections(self, limit: int = 50) -> Dict[str, Any]:
        """Get custom collections."""
        return self._request("GET", "custom_collections.json", params={"limit": limit})
    
    def get_smart_collections(self, limit: int = 50) -> Dict[str, Any]:
        """Get smart collections."""
        return self._request("GET", "smart_collections.json", params={"limit": limit})
    
    def create_custom_collection(self, collection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a custom collection.
        
        Args:
            collection_data: Collection data including title, body_html, etc.
        
        Returns:
            Dict containing the created collection
        """
        return self._request("POST", "custom_collections.json", data={"custom_collection": collection_data})
    
    def add_product_to_collection(self, collection_id: int, product_id: int) -> Dict[str, Any]:
        """Add a product to a collection."""
        collect_data = {
            "collection_id": collection_id,
            "product_id": product_id
        }
        return self._request("POST", "collects.json", data={"collect": collect_data})
    
    # ==================== INVENTORY ====================
    
    def get_locations(self) -> Dict[str, Any]:
        """Get all locations."""
        return self._request("GET", "locations.json")
    
    def get_inventory_levels(self, location_ids: List[int] = None, inventory_item_ids: List[int] = None) -> Dict[str, Any]:
        """
        Get inventory levels.
        
        Args:
            location_ids: List of location IDs to filter by
            inventory_item_ids: List of inventory item IDs to filter by
        
        Returns:
            Dict containing inventory levels
        """
        params = {}
        if location_ids:
            params["location_ids"] = ",".join(map(str, location_ids))
        if inventory_item_ids:
            params["inventory_item_ids"] = ",".join(map(str, inventory_item_ids))
        return self._request("GET", "inventory_levels.json", params=params)
    
    def set_inventory_level(self, location_id: int, inventory_item_id: int, available: int) -> Dict[str, Any]:
        """
        Set inventory level for an item at a location.
        
        Args:
            location_id: The location ID
            inventory_item_id: The inventory item ID
            available: The available quantity
        
        Returns:
            Dict containing the updated inventory level
        """
        data = {
            "location_id": location_id,
            "inventory_item_id": inventory_item_id,
            "available": available
        }
        return self._request("POST", "inventory_levels/set.json", data=data)
    
    def adjust_inventory_level(self, location_id: int, inventory_item_id: int, adjustment: int) -> Dict[str, Any]:
        """Adjust inventory level by a delta amount."""
        data = {
            "location_id": location_id,
            "inventory_item_id": inventory_item_id,
            "available_adjustment": adjustment
        }
        return self._request("POST", "inventory_levels/adjust.json", data=data)
    
    # ==================== WEBHOOKS ====================
    
    def get_webhooks(self) -> Dict[str, Any]:
        """Get all webhooks."""
        return self._request("GET", "webhooks.json")
    
    def create_webhook(self, topic: str, address: str, format: str = "json") -> Dict[str, Any]:
        """
        Create a new webhook.
        
        Args:
            topic: The webhook topic (e.g., 'orders/create', 'products/update')
            address: The URL to receive webhook notifications
            format: Response format ('json' or 'xml')
        
        Returns:
            Dict containing the created webhook
        
        Common topics:
            - orders/create, orders/updated, orders/cancelled
            - products/create, products/update, products/delete
            - customers/create, customers/update
            - inventory_levels/update
            - fulfillments/create
        """
        webhook_data = {
            "topic": topic,
            "address": address,
            "format": format
        }
        return self._request("POST", "webhooks.json", data={"webhook": webhook_data})
    
    def delete_webhook(self, webhook_id: int) -> Dict[str, Any]:
        """Delete a webhook."""
        return self._request("DELETE", f"webhooks/{webhook_id}.json")
    
    # ==================== DISCOUNTS / PRICE RULES ====================
    
    def get_price_rules(self, limit: int = 50) -> Dict[str, Any]:
        """Get price rules (discounts)."""
        return self._request("GET", "price_rules.json", params={"limit": limit})
    
    def create_price_rule(self, price_rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a price rule (discount).
        
        Args:
            price_rule_data: Price rule configuration
        
        Returns:
            Dict containing the created price rule
        
        Example:
            price_rule = api.create_price_rule({
                "title": "10% Off",
                "target_type": "line_item",
                "target_selection": "all",
                "allocation_method": "across",
                "value_type": "percentage",
                "value": "-10.0",
                "customer_selection": "all",
                "starts_at": "2024-01-01T00:00:00Z"
            })
        """
        return self._request("POST", "price_rules.json", data={"price_rule": price_rule_data})
    
    def create_discount_code(self, price_rule_id: int, code: str) -> Dict[str, Any]:
        """Create a discount code for a price rule."""
        return self._request(
            "POST", 
            f"price_rules/{price_rule_id}/discount_codes.json",
            data={"discount_code": {"code": code}}
        )
    
    # ==================== FULFILLMENT ====================
    
    def get_fulfillment_orders(self, order_id: int) -> Dict[str, Any]:
        """Get fulfillment orders for an order."""
        return self._request("GET", f"orders/{order_id}/fulfillment_orders.json")
    
    def create_fulfillment(self, fulfillment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a fulfillment.
        
        Args:
            fulfillment_data: Fulfillment data including line_items_by_fulfillment_order,
                             tracking info, etc.
        
        Returns:
            Dict containing the created fulfillment
        """
        return self._request("POST", "fulfillments.json", data={"fulfillment": fulfillment_data})
    
    # ==================== METAFIELDS ====================
    
    def get_metafields(self, resource: str, resource_id: int) -> Dict[str, Any]:
        """
        Get metafields for a resource.
        
        Args:
            resource: Resource type (products, customers, orders, etc.)
            resource_id: Resource ID
        
        Returns:
            Dict containing metafields
        """
        return self._request("GET", f"{resource}/{resource_id}/metafields.json")
    
    def create_metafield(
        self, 
        resource: str, 
        resource_id: int, 
        namespace: str,
        key: str,
        value: str,
        type: str = "single_line_text_field"
    ) -> Dict[str, Any]:
        """
        Create a metafield for a resource.
        
        Args:
            resource: Resource type
            resource_id: Resource ID
            namespace: Metafield namespace
            key: Metafield key
            value: Metafield value
            type: Value type (single_line_text_field, number_integer, json, etc.)
        
        Returns:
            Dict containing the created metafield
        """
        metafield_data = {
            "namespace": namespace,
            "key": key,
            "value": value,
            "type": type
        }
        return self._request(
            "POST", 
            f"{resource}/{resource_id}/metafields.json",
            data={"metafield": metafield_data}
        )


class ShopifyStorefrontAPI:
    """
    Shopify Storefront GraphQL API Client
    
    Provides methods for customer-facing operations including
    product browsing, cart management, and checkout.
    """
    
    def __init__(
        self,
        store_url: str = None,
        access_token: str = None,
        api_version: str = "2024-01"
    ):
        """
        Initialize the Shopify Storefront API client.
        
        Args:
            store_url: The myshopify.com domain
            access_token: Storefront API access token
            api_version: API version to use
        """
        self.store_url = store_url or os.environ.get("SHOPIFY_STORE_URL", "zone-teste.myshopify.com")
        self.access_token = access_token or os.environ.get("SHOPIFY_STOREFRONT_API_ACCESS_TOKEN_ZONE_TEST")
        self.api_version = api_version
        self.endpoint = f"https://{self.store_url}/api/{self.api_version}/graphql.json"
        
        self.headers = {
            "X-Shopify-Storefront-Access-Token": self.access_token,
            "Content-Type": "application/json"
        }
    
    def _query(self, query: str, variables: Optional[Dict] = None) -> Dict[str, Any]:
        """Execute a GraphQL query."""
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        
        response = requests.post(self.endpoint, headers=self.headers, json=payload)
        
        if response.status_code >= 400:
            print(f"Error {response.status_code}: {response.text}")
            response.raise_for_status()
        
        return response.json()
    
    def get_shop(self) -> Dict[str, Any]:
        """Get shop information."""
        query = """
        {
            shop {
                name
                description
                primaryDomain {
                    url
                    host
                }
                paymentSettings {
                    currencyCode
                    acceptedCardBrands
                }
            }
        }
        """
        return self._query(query)
    
    def get_products(self, first: int = 10) -> Dict[str, Any]:
        """
        Get products from the storefront.
        
        Args:
            first: Number of products to retrieve
        
        Returns:
            Dict containing products with edges/nodes structure
        """
        query = """
        query getProducts($first: Int!) {
            products(first: $first) {
                edges {
                    node {
                        id
                        title
                        description
                        handle
                        priceRange {
                            minVariantPrice {
                                amount
                                currencyCode
                            }
                            maxVariantPrice {
                                amount
                                currencyCode
                            }
                        }
                        images(first: 1) {
                            edges {
                                node {
                                    url
                                    altText
                                }
                            }
                        }
                        variants(first: 5) {
                            edges {
                                node {
                                    id
                                    title
                                    price {
                                        amount
                                        currencyCode
                                    }
                                    availableForSale
                                }
                            }
                        }
                    }
                }
            }
        }
        """
        return self._query(query, {"first": first})
    
    def get_product_by_handle(self, handle: str) -> Dict[str, Any]:
        """Get a product by its handle (URL slug)."""
        query = """
        query getProductByHandle($handle: String!) {
            productByHandle(handle: $handle) {
                id
                title
                description
                descriptionHtml
                handle
                productType
                vendor
                tags
                priceRange {
                    minVariantPrice {
                        amount
                        currencyCode
                    }
                }
                variants(first: 10) {
                    edges {
                        node {
                            id
                            title
                            sku
                            price {
                                amount
                                currencyCode
                            }
                            availableForSale
                            quantityAvailable
                        }
                    }
                }
                images(first: 5) {
                    edges {
                        node {
                            url
                            altText
                            width
                            height
                        }
                    }
                }
            }
        }
        """
        return self._query(query, {"handle": handle})
    
    def get_collections(self, first: int = 10) -> Dict[str, Any]:
        """Get collections from the storefront."""
        query = """
        query getCollections($first: Int!) {
            collections(first: $first) {
                edges {
                    node {
                        id
                        title
                        description
                        handle
                        image {
                            url
                            altText
                        }
                        products(first: 5) {
                            edges {
                                node {
                                    id
                                    title
                                }
                            }
                        }
                    }
                }
            }
        }
        """
        return self._query(query, {"first": first})
    
    def create_cart(self, lines: List[Dict] = None) -> Dict[str, Any]:
        """
        Create a new cart.
        
        Args:
            lines: Optional list of cart line items with merchandiseId and quantity
        
        Returns:
            Dict containing the created cart
        
        Example:
            cart = storefront.create_cart([
                {"merchandiseId": "gid://shopify/ProductVariant/123", "quantity": 1}
            ])
        """
        mutation = """
        mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
                cart {
                    id
                    checkoutUrl
                    lines(first: 10) {
                        edges {
                            node {
                                id
                                quantity
                                merchandise {
                                    ... on ProductVariant {
                                        id
                                        title
                                        price {
                                            amount
                                            currencyCode
                                        }
                                    }
                                }
                            }
                        }
                    }
                    cost {
                        totalAmount {
                            amount
                            currencyCode
                        }
                        subtotalAmount {
                            amount
                            currencyCode
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
        """
        input_data = {"lines": lines or []}
        return self._query(mutation, {"input": input_data})
    
    def add_to_cart(self, cart_id: str, lines: List[Dict]) -> Dict[str, Any]:
        """
        Add items to an existing cart.
        
        Args:
            cart_id: The cart ID
            lines: List of line items to add
        
        Returns:
            Dict containing the updated cart
        """
        mutation = """
        mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart {
                    id
                    lines(first: 10) {
                        edges {
                            node {
                                id
                                quantity
                                merchandise {
                                    ... on ProductVariant {
                                        id
                                        title
                                    }
                                }
                            }
                        }
                    }
                    cost {
                        totalAmount {
                            amount
                            currencyCode
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
        """
        return self._query(mutation, {"cartId": cart_id, "lines": lines})
    
    def search_products(self, query: str, first: int = 10) -> Dict[str, Any]:
        """
        Search for products.
        
        Args:
            query: Search query string
            first: Number of results to return
        
        Returns:
            Dict containing search results
        """
        gql_query = """
        query searchProducts($query: String!, $first: Int!) {
            products(first: $first, query: $query) {
                edges {
                    node {
                        id
                        title
                        handle
                        description
                        priceRange {
                            minVariantPrice {
                                amount
                                currencyCode
                            }
                        }
                    }
                }
            }
        }
        """
        return self._query(gql_query, {"query": query, "first": first})


def demo_admin_api():
    """Demonstrate Admin API capabilities."""
    print("\n" + "="*60)
    print("SHOPIFY ADMIN API DEMONSTRATION")
    print("="*60)
    
    api = ShopifyAdminAPI()
    
    # 1. Shop Information
    print("\n--- Shop Information ---")
    shop = api.get_shop()
    shop_data = shop.get("shop", {})
    print(f"Store Name: {shop_data.get('name')}")
    print(f"Email: {shop_data.get('email')}")
    print(f"Domain: {shop_data.get('domain')}")
    print(f"Currency: {shop_data.get('currency')}")
    print(f"Country: {shop_data.get('country_name')}")
    print(f"Plan: {shop_data.get('plan_display_name')}")
    
    # 2. Locations
    print("\n--- Locations ---")
    locations = api.get_locations()
    for loc in locations.get("locations", []):
        print(f"  - {loc.get('name')} (ID: {loc.get('id')})")
        print(f"    Country: {loc.get('country_name')}")
        print(f"    Active: {loc.get('active')}")
    
    # 3. Collections
    print("\n--- Collections ---")
    collections = api.get_custom_collections()
    for col in collections.get("custom_collections", []):
        print(f"  - {col.get('title')} (Handle: {col.get('handle')})")
    
    # 4. Products Count
    print("\n--- Products ---")
    product_count = api.get_product_count()
    print(f"Total Products: {product_count.get('count', 0)}")
    
    # 5. Customers Count
    print("\n--- Customers ---")
    customer_count = api.get_customer_count()
    print(f"Total Customers: {customer_count.get('count', 0)}")
    
    # 6. Orders Count
    print("\n--- Orders ---")
    order_count = api.get_order_count()
    print(f"Total Orders: {order_count.get('count', 0)}")
    
    # 7. Webhooks
    print("\n--- Webhooks ---")
    webhooks = api.get_webhooks()
    webhook_list = webhooks.get("webhooks", [])
    if webhook_list:
        for wh in webhook_list:
            print(f"  - Topic: {wh.get('topic')}, Address: {wh.get('address')}")
    else:
        print("  No webhooks configured")
    
    # 8. Access Scopes
    print("\n--- Access Scopes (Sample) ---")
    scopes = api.get_access_scopes()
    scope_list = scopes.get("access_scopes", [])
    print(f"Total Scopes: {len(scope_list)}")
    print("Sample scopes:")
    for scope in scope_list[:10]:
        print(f"  - {scope.get('handle')}")
    print("  ...")
    
    return api


def demo_storefront_api():
    """Demonstrate Storefront API capabilities."""
    print("\n" + "="*60)
    print("SHOPIFY STOREFRONT API DEMONSTRATION")
    print("="*60)
    
    storefront = ShopifyStorefrontAPI()
    
    # 1. Shop Information
    print("\n--- Shop Information (Storefront) ---")
    shop = storefront.get_shop()
    shop_data = shop.get("data", {}).get("shop", {})
    print(f"Name: {shop_data.get('name')}")
    print(f"Description: {shop_data.get('description')}")
    domain = shop_data.get("primaryDomain", {})
    print(f"Domain: {domain.get('url')}")
    payment = shop_data.get("paymentSettings", {})
    print(f"Currency: {payment.get('currencyCode')}")
    
    # 2. Collections
    print("\n--- Collections (Storefront) ---")
    collections = storefront.get_collections(first=5)
    edges = collections.get("data", {}).get("collections", {}).get("edges", [])
    for edge in edges:
        col = edge.get("node", {})
        print(f"  - {col.get('title')} (Handle: {col.get('handle')})")
    
    # 3. Products
    print("\n--- Products (Storefront) ---")
    products = storefront.get_products(first=5)
    edges = products.get("data", {}).get("products", {}).get("edges", [])
    if edges:
        for edge in edges:
            prod = edge.get("node", {})
            price_range = prod.get("priceRange", {}).get("minVariantPrice", {})
            print(f"  - {prod.get('title')}")
            print(f"    Price: {price_range.get('currencyCode')} {price_range.get('amount')}")
    else:
        print("  No products found")
    
    # 4. Cart Creation Demo
    print("\n--- Cart Creation (Demo) ---")
    cart = storefront.create_cart()
    cart_data = cart.get("data", {}).get("cartCreate", {}).get("cart", {})
    if cart_data:
        print(f"Cart ID: {cart_data.get('id')}")
        print(f"Checkout URL: {cart_data.get('checkoutUrl')}")
    
    return storefront


def demo_product_crud():
    """Demonstrate Product CRUD operations."""
    print("\n" + "="*60)
    print("PRODUCT CRUD DEMONSTRATION")
    print("="*60)
    
    api = ShopifyAdminAPI()
    
    # Create a test product
    print("\n--- Creating Test Product ---")
    product_data = {
        "title": "Demo Product - Zone Test",
        "body_html": "<p>This is a demonstration product created via the Shopify API.</p>",
        "vendor": "Zone Test",
        "product_type": "Demo",
        "tags": "demo, api-test, zone",
        "variants": [
            {
                "price": "199.99",
                "sku": "DEMO-001",
                "inventory_management": "shopify",
                "inventory_policy": "deny"
            }
        ]
    }
    
    try:
        created = api.create_product(product_data)
        product = created.get("product", {})
        product_id = product.get("id")
        print(f"Created Product ID: {product_id}")
        print(f"Title: {product.get('title')}")
        print(f"Handle: {product.get('handle')}")
        
        # Update the product
        print("\n--- Updating Product ---")
        update_data = {
            "id": product_id,
            "title": "Demo Product - Zone Test (Updated)",
            "body_html": "<p>This product has been updated via the API.</p>"
        }
        updated = api.update_product(product_id, update_data)
        print(f"Updated Title: {updated.get('product', {}).get('title')}")
        
        # Get the product
        print("\n--- Retrieving Product ---")
        retrieved = api.get_product(product_id)
        print(f"Retrieved: {retrieved.get('product', {}).get('title')}")
        
        # Delete the product
        print("\n--- Deleting Product ---")
        api.delete_product(product_id)
        print(f"Product {product_id} deleted successfully")
        
    except Exception as e:
        print(f"Error during CRUD demo: {e}")


def demo_customer_operations():
    """Demonstrate Customer operations."""
    print("\n" + "="*60)
    print("CUSTOMER OPERATIONS DEMONSTRATION")
    print("="*60)
    
    api = ShopifyAdminAPI()
    
    # Create a test customer
    print("\n--- Creating Test Customer ---")
    customer_data = {
        "first_name": "Test",
        "last_name": "Customer",
        "email": f"test.customer.{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
        "phone": "+27123456789",
        "verified_email": True,
        "addresses": [
            {
                "address1": "123 Test Street",
                "city": "Cape Town",
                "province": "Western Cape",
                "country": "South Africa",
                "zip": "8001"
            }
        ],
        "tags": "api-demo, test"
    }
    
    try:
        created = api.create_customer(customer_data)
        customer = created.get("customer", {})
        customer_id = customer.get("id")
        print(f"Created Customer ID: {customer_id}")
        print(f"Name: {customer.get('first_name')} {customer.get('last_name')}")
        print(f"Email: {customer.get('email')}")
        
        # Update customer
        print("\n--- Updating Customer ---")
        update_data = {
            "id": customer_id,
            "note": "Updated via API demo"
        }
        updated = api.update_customer(customer_id, update_data)
        print(f"Customer updated with note: {updated.get('customer', {}).get('note')}")
        
        # Search customers
        print("\n--- Searching Customers ---")
        search_results = api.search_customers("test")
        customers = search_results.get("customers", [])
        print(f"Found {len(customers)} customers matching 'test'")
        
        # Delete customer
        print("\n--- Deleting Customer ---")
        api.delete_customer(customer_id)
        print(f"Customer {customer_id} deleted successfully")
        
    except Exception as e:
        print(f"Error during customer demo: {e}")


def print_capabilities_summary():
    """Print a summary of API capabilities."""
    print("\n" + "="*60)
    print("SHOPIFY ZONE TEST API - CAPABILITIES SUMMARY")
    print("="*60)
    
    capabilities = """
╔══════════════════════════════════════════════════════════════╗
║                    ADMIN API CAPABILITIES                     ║
╠══════════════════════════════════════════════════════════════╣
║ SHOP MANAGEMENT                                               ║
║   • Get shop information (name, email, currency, timezone)    ║
║   • View access scopes and permissions                        ║
║   • Manage locations and fulfillment centers                  ║
╠══════════════════════════════════════════════════════════════╣
║ PRODUCT MANAGEMENT                                            ║
║   • Create, read, update, delete products                     ║
║   • Manage product variants (sizes, colors, etc.)             ║
║   • Handle product images and media                           ║
║   • Set product metafields for custom data                    ║
║   • Manage inventory levels per location                      ║
╠══════════════════════════════════════════════════════════════╣
║ CUSTOMER MANAGEMENT                                           ║
║   • Create, read, update, delete customers                    ║
║   • Search customers by various criteria                      ║
║   • Manage customer addresses                                 ║
║   • Handle customer tags and notes                            ║
╠══════════════════════════════════════════════════════════════╣
║ ORDER MANAGEMENT                                              ║
║   • Create, read, update orders                               ║
║   • Close and cancel orders                                   ║
║   • Manage draft orders                                       ║
║   • Handle fulfillments and shipping                          ║
║   • Process refunds and returns                               ║
╠══════════════════════════════════════════════════════════════╣
║ COLLECTION MANAGEMENT                                         ║
║   • Create custom and smart collections                       ║
║   • Add/remove products from collections                      ║
║   • Manage collection rules and sorting                       ║
╠══════════════════════════════════════════════════════════════╣
║ INVENTORY MANAGEMENT                                          ║
║   • Track inventory across multiple locations                 ║
║   • Set and adjust inventory levels                           ║
║   • Manage inventory items and SKUs                           ║
╠══════════════════════════════════════════════════════════════╣
║ DISCOUNTS & PRICING                                           ║
║   • Create price rules and discount codes                     ║
║   • Set percentage or fixed amount discounts                  ║
║   • Configure usage limits and conditions                     ║
╠══════════════════════════════════════════════════════════════╣
║ WEBHOOKS & AUTOMATION                                         ║
║   • Create webhooks for real-time notifications               ║
║   • Subscribe to order, product, customer events              ║
║   • Automate workflows based on store events                  ║
╠══════════════════════════════════════════════════════════════╣
║                  STOREFRONT API CAPABILITIES                  ║
╠══════════════════════════════════════════════════════════════╣
║ CUSTOMER-FACING OPERATIONS                                    ║
║   • Browse products and collections (GraphQL)                 ║
║   • Search products with filters                              ║
║   • Create and manage shopping carts                          ║
║   • Generate checkout URLs                                    ║
║   • Access product availability and pricing                   ║
╚══════════════════════════════════════════════════════════════╝

STORE DETAILS:
  • Store URL: zone-teste.myshopify.com
  • Country: South Africa
  • Currency: ZAR (South African Rand)
  • Plan: Developer Preview (Partner Test)
  • API Version: 2024-01

AUTHENTICATION:
  • Admin API: X-Shopify-Access-Token header
  • Storefront API: X-Shopify-Storefront-Access-Token header

RATE LIMITS:
  • Admin API: 2 requests/second (bucket of 40)
  • Storefront API: 100 cost points/second

AVAILABLE ACCESS SCOPES: 150+ scopes including:
  • read/write_products, read/write_customers
  • read/write_orders, read/write_inventory
  • read/write_fulfillments, read/write_discounts
  • read/write_draft_orders, read/write_themes
  • And many more...
"""
    print(capabilities)


def main():
    """Main entry point for the demo."""
    print("\n" + "#"*60)
    print("#" + " "*58 + "#")
    print("#" + "  SHOPIFY ZONE TEST API DEMO  ".center(58) + "#")
    print("#" + " "*58 + "#")
    print("#"*60)
    
    # Print capabilities summary
    print_capabilities_summary()
    
    # Run Admin API demo
    demo_admin_api()
    
    # Run Storefront API demo
    demo_storefront_api()
    
    # Run Product CRUD demo
    demo_product_crud()
    
    # Run Customer operations demo
    demo_customer_operations()
    
    print("\n" + "="*60)
    print("DEMO COMPLETE")
    print("="*60)
    print("\nThe demo script has demonstrated the key capabilities of")
    print("the Shopify Zone Test API. You can use the ShopifyAdminAPI")
    print("and ShopifyStorefrontAPI classes in your own applications.")
    print("\nFor more information, see:")
    print("  • Admin API: https://shopify.dev/docs/api/admin-rest")
    print("  • Storefront API: https://shopify.dev/docs/api/storefront")


if __name__ == "__main__":
    main()

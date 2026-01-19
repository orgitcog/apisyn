# Shopify Zone Test API Demonstration

This document provides a comprehensive overview of the Shopify Zone Test API, including its capabilities, a demonstration script, and the results of its execution. The provided credentials and endpoints are for the `zone-teste.myshopify.com` store.

## API Capabilities Summary

The Shopify Zone Test API provides extensive access to a store's data and functionality through two primary APIs: the Admin API (REST) and the Storefront API (GraphQL).

### Admin API Capabilities

The Admin API is designed for back-end operations and provides a wide range of capabilities, including:

- **Shop Management:** Retrieve shop information, manage locations, and view access scopes.
- **Product Management:** Full CRUD (Create, Read, Update, Delete) operations for products and their variants, images, and metafields.
- **Customer Management:** Manage customer data, including addresses, tags, and notes.
- **Order Management:** Create, retrieve, and update orders, manage fulfillments, and process refunds.
- **Collection Management:** Organize products into custom and smart collections.
- **Inventory Management:** Track and adjust inventory levels across multiple locations.
- **Discounts & Pricing:** Create and manage price rules and discount codes.
- **Webhooks & Automation:** Subscribe to store events for real-time notifications and workflow automation.

### Storefront API Capabilities

The Storefront API is designed for customer-facing applications and provides the following capabilities:

- **Product & Collection Browsing:** Retrieve product and collection information for display on a website or app.
- **Cart Management:** Create and manage shopping carts.
- **Checkout:** Generate checkout URLs to complete purchases.

## Demo Script

The following Python script demonstrates how to use the Shopify Admin and Storefront APIs. It includes classes for interacting with both APIs and functions that showcase various features.

```python
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
    
    # ... (the rest of the script is omitted for brevity)
```

*Full script available in the attached `shopify_api_demo.py` file.*

## Demo Execution Output

The script was executed successfully, and the output below demonstrates the results of the API calls.

```
############################################################
#                                                          #
#                SHOPIFY ZONE TEST API DEMO                #
#                                                          #
############################################################

============================================================
SHOPIFY ZONE TEST API - CAPABILITIES SUMMARY
============================================================

...

============================================================
DEMO COMPLETE
============================================================

The demo script has demonstrated the key capabilities of
the Shopify Zone Test API. You can use the ShopifyAdminAPI
and ShopifyStorefrontAPI classes in your own applications.

For more information, see:
  • Admin API: https://shopify.dev/docs/api/admin-rest
  • Storefront API: https://shopify.dev/docs/api/storefront
```

*Full output available in the attached `demo_output.txt` file.*

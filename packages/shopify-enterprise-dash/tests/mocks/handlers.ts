import { http, HttpResponse } from 'msw';

// Mock API endpoints
export const handlers = [
  // Supabase Auth endpoints
  http.post('https://test.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        role: 'authenticated',
      },
    });
  }),

  http.post('https://test.supabase.co/auth/v1/signup', () => {
    return HttpResponse.json({
      id: 'mock-user-id',
      email: 'test@example.com',
      role: 'authenticated',
    });
  }),

  http.post('https://test.supabase.co/auth/v1/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('https://test.supabase.co/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'mock-user-id',
      email: 'test@example.com',
      role: 'authenticated',
    });
  }),

  // Supabase REST API endpoints for stores
  http.get('https://test.supabase.co/rest/v1/stores', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Store 1',
        url: 'test-store-1.myshopify.com',
        revenue: 50000,
        orders: 500,
        status: 'active',
        last_sync: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Test Store 2',
        url: 'test-store-2.myshopify.com',
        revenue: 75000,
        orders: 750,
        status: 'active',
        last_sync: new Date().toISOString(),
      },
    ]);
  }),

  http.post('https://test.supabase.co/rest/v1/stores', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-store-id',
      ...body,
      revenue: 0,
      orders: 0,
      status: body.status || 'pending',
      last_sync: new Date().toISOString(),
    });
  }),

  http.patch('https://test.supabase.co/rest/v1/stores', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: '1',
      name: 'Test Store 1',
      ...body,
    });
  }),

  http.delete('https://test.supabase.co/rest/v1/stores', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // User profiles endpoints
  http.get('https://test.supabase.co/rest/v1/user_profiles', () => {
    return HttpResponse.json([
      {
        id: 'mock-user-id',
        email: 'test@example.com',
        display_name: 'Test User',
        role: 'admin',
        status: 'active',
      },
    ]);
  }),

  http.post('https://test.supabase.co/rest/v1/user_profiles', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'mock-user-id',
      ...body,
    });
  }),

  http.patch('https://test.supabase.co/rest/v1/user_profiles', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'mock-user-id',
      ...body,
    });
  }),

  // Analytics endpoints
  http.get('https://test.supabase.co/rest/v1/analytics', () => {
    return HttpResponse.json({
      totalRevenue: 500000,
      totalOrders: 5000,
      averageOrderValue: 100,
      conversionRate: 3.5,
    });
  }),

  // Shopify Admin API mock
  http.get('https://*.myshopify.com/admin/api/*/shop.json', () => {
    return HttpResponse.json({
      shop: {
        id: 123456789,
        name: 'Test Shop',
        email: 'shop@example.com',
        domain: 'test-shop.myshopify.com',
        currency: 'USD',
      },
    });
  }),

  http.get('https://*.myshopify.com/admin/api/*/products.json', () => {
    return HttpResponse.json({
      products: [
        {
          id: 1,
          title: 'Test Product',
          vendor: 'Test Vendor',
          product_type: 'Test Type',
          status: 'active',
        },
      ],
    });
  }),

  http.get('https://*.myshopify.com/admin/api/*/orders.json', () => {
    return HttpResponse.json({
      orders: [
        {
          id: 1,
          order_number: 1001,
          total_price: '100.00',
          currency: 'USD',
          financial_status: 'paid',
        },
      ],
    });
  }),

  // OpenAI API mock
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      id: 'chatcmpl-123',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a mock AI response for testing.',
          },
          finish_reason: 'stop',
        },
      ],
    });
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = {
  authError: http.post('https://test.supabase.co/auth/v1/token', () => {
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  serverError: http.get('https://test.supabase.co/rest/v1/stores', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),

  networkError: http.get('https://test.supabase.co/rest/v1/stores', () => {
    return HttpResponse.error();
  }),
};

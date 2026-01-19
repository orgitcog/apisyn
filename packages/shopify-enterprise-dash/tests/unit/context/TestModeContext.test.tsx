import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { TestModeProvider, useTestMode } from '@/context/TestModeContext';

// Mock import.meta.env
vi.stubEnv('VITE_TEST_MODE', 'false');

describe('TestModeContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestModeProvider>{children}</TestModeProvider>
  );

  describe('useTestMode hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useTestMode());
      }).toThrow('useTestMode must be used within a TestModeProvider');
    });

    it('should return context values when used inside provider', () => {
      const { result } = renderHook(() => useTestMode(), { wrapper });

      expect(result.current).toHaveProperty('isTestMode');
      expect(result.current).toHaveProperty('toggleTestMode');
      expect(result.current).toHaveProperty('organizations');
      expect(result.current).toHaveProperty('updateOrganizations');
      expect(result.current).toHaveProperty('testStoreData');
      expect(result.current).toHaveProperty('updateTestStoreData');
    });
  });

  describe('isTestMode', () => {
    it('should default to false when VITE_TEST_MODE is not true', () => {
      const { result } = renderHook(() => useTestMode(), { wrapper });
      expect(result.current.isTestMode).toBe(false);
    });

    it('should toggle test mode', () => {
      const { result } = renderHook(() => useTestMode(), { wrapper });

      expect(result.current.isTestMode).toBe(false);

      act(() => {
        result.current.toggleTestMode();
      });

      expect(result.current.isTestMode).toBe(true);

      act(() => {
        result.current.toggleTestMode();
      });

      expect(result.current.isTestMode).toBe(false);
    });
  });

  describe('organizations', () => {
    it('should have default organizations', () => {
      const { result } = renderHook(() => useTestMode(), { wrapper });

      expect(result.current.organizations).toHaveLength(2);
      expect(result.current.organizations[0].name).toBe('North America Division');
      expect(result.current.organizations[1].name).toBe('European Division');
    });

    it('should have stores within organizations', () => {
      const { result } = renderHook(() => useTestMode(), { wrapper });

      const naOrg = result.current.organizations[0];
      expect(naOrg.stores).toHaveLength(2);
      expect(naOrg.stores[0].name).toBe('NA Fashion Direct');
      expect(naOrg.stores[0].status).toBe('active');
    });

    it('should update organizations', () => {
      const { result } = renderHook(() => useTestMode(), { wrapper });

      const newOrgs = [
        {
          id: 'new-org',
          name: 'New Organization',
          stores: [],
        },
      ];

      act(() => {
        result.current.updateOrganizations(newOrgs);
      });

      expect(result.current.organizations).toHaveLength(1);
      expect(result.current.organizations[0].name).toBe('New Organization');
    });
  });

  describe('testStoreData', () => {
    it('should have default test store data', () => {
      const { result } = renderHook(() => useTestMode(), { wrapper });

      expect(result.current.testStoreData).toEqual({
        name: 'Test Store',
        domain: 'test-store.myshopify.com',
        plan: 'enterprise',
      });
    });

    it('should update test store data', () => {
      const { result } = renderHook(() => useTestMode(), { wrapper });

      const newData = {
        name: 'Updated Store',
        domain: 'updated.myshopify.com',
        plan: 'basic',
      };

      act(() => {
        result.current.updateTestStoreData(newData);
      });

      expect(result.current.testStoreData).toEqual(newData);
    });
  });

  describe('organization metrics', () => {
    it('should have valid metrics for stores', () => {
      const { result } = renderHook(() => useTestMode(), { wrapper });

      const store = result.current.organizations[0].stores[0];

      expect(store.metrics).toHaveProperty('revenue');
      expect(store.metrics).toHaveProperty('orders');
      expect(store.metrics).toHaveProperty('customers');
      expect(typeof store.metrics.revenue).toBe('number');
      expect(typeof store.metrics.orders).toBe('number');
      expect(typeof store.metrics.customers).toBe('number');
    });

    it('should have lastSync timestamp', () => {
      const { result } = renderHook(() => useTestMode(), { wrapper });

      const store = result.current.organizations[0].stores[0];
      expect(store.lastSync).toBeDefined();
      expect(new Date(store.lastSync)).toBeInstanceOf(Date);
    });
  });
});

import { useState, useCallback } from 'react';
import { TopBar as PolarisTopBar, ActionList } from '@shopify/polaris';
// Icons available for future use: Search, Bell, User from 'lucide-react'

export function TopBar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const toggleIsUserMenuOpen = useCallback(
    () => setIsUserMenuOpen((isUserMenuOpen) => !isUserMenuOpen),
    [],
  );

  const handleSearchResultsDismiss = useCallback(() => {
    setIsSearchActive(false);
    setSearchValue('');
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setIsSearchActive(value.length > 0);
  }, []);

  const userMenuMarkup = (
    <PolarisTopBar.UserMenu
      actions={[
        {
          items: [{content: 'Profile'}, {content: 'Settings'}, {content: 'Sign out'}],
        },
      ]}
      name="Admin User"
      detail="Enterprise Admin"
      initials="AU"
      open={isUserMenuOpen}
      onToggle={toggleIsUserMenuOpen}
    />
  );

  const searchResultsMarkup = (
    <ActionList
      items={[
        {content: 'Search result 1'},
        {content: 'Search result 2'},
      ]}
    />
  );

  const searchFieldMarkup = (
    <PolarisTopBar.SearchField
      onChange={handleSearchChange}
      value={searchValue}
      placeholder="Search"
      showFocusBorder
    />
  );

  return (
    <PolarisTopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      searchResultsVisible={isSearchActive}
      searchField={searchFieldMarkup}
      searchResults={searchResultsMarkup}
      onSearchResultsDismiss={handleSearchResultsDismiss}
    />
  );
}
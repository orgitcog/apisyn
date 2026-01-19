import React, { useState, useCallback } from "react";
import { TopBar as PolarisTopBar, ActionList, _Icon } from "@shopify/polaris";
import { _Search, _Bell, _User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleIsUserMenuOpen = useCallback(
    () => setIsUserMenuOpen((isUserMenuOpen) => !isUserMenuOpen),
    [],
  );

  const handleSearchResultsDismiss = useCallback(() => {
    setIsSearchActive(false);
    setSearchValue("");
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setIsSearchActive(value.length > 0);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const userMenuMarkup = (
    <PolarisTopBar.UserMenu
      actions={[
        {
          items: [
            {
              content: "Profile",
              onAction: () => navigate("/settings"),
            },
            {
              content: "Settings",
              onAction: () => navigate("/settings"),
            },
            {
              content: "Sign out",
              onAction: handleSignOut,
            },
          ],
        },
      ]}
      name={user?.display_name || "User"}
      detail={user?.role || "Enterprise User"}
      initials={(user?.display_name || "U")[0].toUpperCase()}
      open={isUserMenuOpen}
      onToggle={toggleIsUserMenuOpen}
      avatar={user?.avatar_url}
    />
  );

  const searchResultsMarkup = (
    <ActionList
      items={[
        { content: "Dashboard", onAction: () => navigate("/") },
        { content: "Analytics", onAction: () => navigate("/analytics") },
        { content: "Users", onAction: () => navigate("/users") },
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

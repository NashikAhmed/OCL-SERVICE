import React from "react";
import { useLocation } from "react-router-dom";
import StickyTabs from "./StickyTabs";

interface GlobalStickyTabsProps {
  children: React.ReactNode;
}

const GlobalStickyTabs: React.FC<GlobalStickyTabsProps> = ({ children }) => {
  const location = useLocation();
  const hideTabs = location.pathname.startsWith("/medicine");
  return (
    <>
      {children}
      {!hideTabs && <StickyTabs />}
    </>
  );
};

export default GlobalStickyTabs;

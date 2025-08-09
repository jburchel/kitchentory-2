"use client"

import * as React from "react"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import { BottomNav } from "./bottom-nav"

export function MainNav() {
  return (
    <>
      {/* Desktop Navigation */}
      <DesktopNav />
      
      {/* Mobile Top Navigation */}
      <MobileNav />
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </>
  )
}
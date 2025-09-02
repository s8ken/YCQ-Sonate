"use client"

import type React from "react"
import { useState } from "react"
import { Box } from "@mui/material"
import Header from "./Header"
import Sidebar from "./Sidebar"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header toggleDrawer={toggleDrawer} />
      <Sidebar open={drawerOpen} toggleDrawer={toggleDrawer} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          bgcolor: "background.default",
          minHeight: "100vh",
          pt: { xs: 8, sm: 9 }, // Account for fixed header
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout

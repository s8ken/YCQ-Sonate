"use client"

import type React from "react"
import { useState } from "react"
import { Button, Avatar, Menu, MenuItem, Divider, Box, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"
import MenuIcon from "@mui/icons-material/Menu"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"

interface HeaderProps {
  toggleDrawer?: () => void
  user?: any
  mode?: "light" | "dark"
  toggleTheme?: () => void
}

const Header: React.FC<HeaderProps> = ({ toggleDrawer, user, mode = "light", toggleTheme }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()
  const theme = useTheme()

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    handleClose()
    router.push("/login")
  }

  const handleProfile = () => {
    router.push("/settings")
    handleClose()
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.2)",
        height: 64,
        display: "flex",
        alignItems: "center",
        px: 3,
      }}
    >
      {user && toggleDrawer && (
        <Button
          onClick={toggleDrawer}
          sx={{
            mr: 2,
            minWidth: "auto",
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <MenuIcon />
        </Button>
      )}

      <Box
        onClick={() => router.push("/")}
        sx={{
          flexGrow: 1,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "1.25rem",
          background: "linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        SYMBI Trust Protocol
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        {toggleTheme && (
          <Button
            onClick={toggleTheme}
            sx={{
              ml: 1,
              minWidth: "auto",
              color: "white",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </Button>
        )}

        {user && (
          <>
            <Button
              onClick={handleMenu}
              sx={{
                ml: 1,
                minWidth: "auto",
                "&:hover": { transform: "scale(1.05)" },
                transition: "transform 0.2s ease",
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Avatar>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleProfile}>Profile & Settings</MenuItem>
              <MenuItem
                onClick={() => {
                  router.push("/reports")
                  handleClose()
                }}
              >
                Reports
              </MenuItem>
              <MenuItem
                onClick={() => {
                  router.push("/context-bridge")
                  handleClose()
                }}
              >
                Context Bridge
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Box>
    </Box>
  )
}

export default Header

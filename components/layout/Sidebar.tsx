"use client"

import type React from "react"
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material"
import { useRouter, usePathname } from "next/navigation"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ChatIcon from "@mui/icons-material/Chat"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import SettingsIcon from "@mui/icons-material/Settings"
import AssessmentIcon from "@mui/icons-material/Assessment"
import LinkIcon from "@mui/icons-material/Link"
import PersonIcon from "@mui/icons-material/Person"
import LogoutIcon from "@mui/icons-material/Logout"
import BookOpenIcon from "@mui/icons-material/MenuBook"

interface SidebarProps {
  open: boolean
  toggleDrawer: () => void
  user?: any
  mode?: "light" | "dark"
}

const Sidebar: React.FC<SidebarProps> = ({ open, toggleDrawer, user, mode = "light" }) => {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/", color: "#667eea" },
    { text: "Conversations", icon: <ChatIcon />, path: "/conversations", color: "#10b981" },
    { text: "Agents", icon: <SmartToyIcon />, path: "/agents", color: "#8b5cf6" },
    { text: "Assistants", icon: <SmartToyIcon />, path: "/assistants", color: "#ec4899" },
    { text: "Case Studies", icon: <BookOpenIcon />, path: "/case-studies", color: "#f97316" },
    { text: "Reports", icon: <AssessmentIcon />, path: "/reports", color: "#f59e0b" },
    { text: "Context Bridge", icon: <LinkIcon />, path: "/context-bridge", color: "#3b82f6" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings", color: "#6b7280" },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    toggleDrawer()
    router.push("/login")
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    toggleDrawer()
  }

  if (!user) return null

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={toggleDrawer}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
          background:
            mode === "dark"
              ? "linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          borderRight: "1px solid",
          borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 800, mb: 0.5 }}>
            SYMBI
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 600 }}>
            Trust Protocol
          </Typography>
          <Chip
            label="AI Powered"
            size="small"
            sx={{
              mt: 1,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
      </Box>

      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isSelected = pathname === item.path
          return (
            <ListItem
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                color: isSelected ? "white" : "text.primary",
                background: isSelected
                  ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`
                  : "transparent",
                "&:hover": {
                  background: isSelected
                    ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`
                    : mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.04)",
                  transform: "translateX(4px)",
                  cursor: "pointer",
                },
                borderRadius: 2,
                mb: 1,
                transition: "all 0.2s ease-in-out",
                boxShadow: isSelected ? `0 4px 12px ${item.color}40` : "none",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <ListItemIcon
                sx={{
                  color: isSelected ? "white" : item.color,
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiListItemText-primary": {
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: "0.95rem",
                  },
                }}
              />
              {isSelected && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 4,
                    height: 20,
                    bgcolor: "white",
                    borderRadius: 2,
                  }}
                />
              )}
            </ListItem>
          )
        })}
      </List>

      <Box sx={{ mt: "auto", p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            borderRadius: 2,
            background: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
            border: "1px solid",
            borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
            mb: 1,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <PersonIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {user?.name || "User"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || "user@example.com"}
            </Typography>
          </Box>
          <IconButton
            onClick={handleLogout}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "error.main",
                bgcolor: "error.main",
                color: "white",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  )
}

export default Sidebar

// SidebarNav.jsx
import React, { useState } from "react";
import {
  Box,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Typography,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  IoChatbubbleEllipsesOutline,
  IoCalendar,
  IoNotifications,
  IoCall,
  IoDocument,
  IoEllipsisHorizontal,
  IoApps,
  IoHelpCircle,
  IoSettings,
  IoLogOut,
  IoPeople,
  IoCheckmarkCircle,
  IoMoon,
  IoTime,
  IoCloseCircle,
} from "react-icons/io5";

const SidebarNav = ({
  currentUser,
  pendingRequestsCount,
  onOpenFriendRequests,
  onLogout,
  activeTab,
  onTabChange,
}) => {
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [appsMenuAnchor, setAppsMenuAnchor] = useState(null);
  const [userStatus, setUserStatus] = useState("available");

  const tabs = [
    { id: "chat", icon: IoChatbubbleEllipsesOutline, label: "Chat" },
    { id: "teams", icon: IoPeople, label: "Teams" },
    { id: "calendar", icon: IoCalendar, label: "Calendar" },
    { id: "calls", icon: IoCall, label: "Calls" },
    { id: "files", icon: IoDocument, label: "Files" },
  ];

  const statusOptions = [
    { value: "available", label: "Available", color: "#92c353", icon: IoCheckmarkCircle },
    { value: "busy", label: "Busy", color: "#c50f1f", icon: IoCloseCircle },
    { value: "away", label: "Away", color: "#faa81a", icon: IoTime },
    { value: "dnd", label: "Do not disturb", color: "#c50f1f", icon: IoCloseCircle },
    { value: "offline", label: "Appear offline", color: "#8a8886", icon: null },
  ];

  const getStatusColor = (status) => {
    const option = statusOptions.find(s => s.value === status);
    return option?.color || "#8a8886";
  };

  const handleStatusChange = (status) => {
    setUserStatus(status);
    setProfileMenuAnchor(null);
    // Here you would typically send status update to backend
  };

  return (
    <Box
      sx={{
        width: 68,
        backgroundColor: "#464775",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 1,
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* User Avatar with Status */}
      <Box sx={{ position: "relative", mb: 2, mt: 1 }}>
        <Tooltip title="Profile & Status" placement="right">
          <IconButton
            onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
            sx={{
              p: 0,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <Avatar
              alt={`${currentUser.firstName || ''} ${currentUser.lastName || ''}`}
              src={currentUser.profilePic}
              sx={{
                width: 40,
                height: 40,
                cursor: "pointer",
                border: "2px solid transparent",
                "&:hover": {
                  border: "2px solid rgba(255,255,255,0.3)",
                },
              }}
            >
              {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
            </Avatar>
          </IconButton>
        </Tooltip>
        
        {/* Status Indicator */}
        <Box
          sx={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: getStatusColor(userStatus),
            border: "3px solid #464775",
            boxSizing: "border-box",
          }}
        />
      </Box>

      {/* Main Navigation Tabs */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          width: "100%",
          alignItems: "center",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Tooltip key={tab.id} title={tab.label} placement="right">
              <IconButton
                onClick={() => window.location = `/${tab.label}`}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 0,
                  position: "relative",
                  color: isActive ? "#fff" : "#c8c6d4",
                  backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  borderLeft: isActive ? "3px solid #6264a7" : "3px solid transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    color: "#fff",
                  },
                }}
              >
                <Icon size={24} />
              </IconButton>
            </Tooltip>
          );
        })}

        {/* Divider */}
        <Divider 
          sx={{ 
            width: 40, 
            my: 1,
            backgroundColor: "rgba(255,255,255,0.1)" 
          }} 
        />

        {/* Apps Menu */}
        <Tooltip title="Apps" placement="right">
          <IconButton
            onClick={(e) => setAppsMenuAnchor(e.currentTarget)}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 0,
              color: "#c8c6d4",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#fff",
              },
            }}
          >
            <IoApps size={24} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Bottom Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          width: "100%",
          alignItems: "center",
          pb: 1,
        }}
      >
        {/* Notifications */}
        <Tooltip title="Activity & Notifications" placement="right">
          <IconButton
            onClick={onOpenFriendRequests}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 0,
              color: "#c8c6d4",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#fff",
              },
            }}
          >
            <Badge
              badgeContent={pendingRequestsCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  right: 8,
                  top: 8,
                  minWidth: 18,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 600,
                },
              }}
            >
              <IoNotifications size={24} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* More Options */}
        <Tooltip title="More" placement="right">
          <IconButton
            sx={{
              width: 48,
              height: 48,
              borderRadius: 0,
              color: "#c8c6d4",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#fff",
              },
            }}
          >
            <IoEllipsisHorizontal size={24} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={() => setProfileMenuAnchor(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            ml: 1,
            minWidth: 280,
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
        }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 2, borderBottom: "1px solid #f0f0f0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Avatar
              src={currentUser.profilePic}
              sx={{ width: 48, height: 48 }}
            >
              {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {currentUser.firstName} {currentUser.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: "#616161" }}>
                {currentUser.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Status Options */}
        <Box sx={{ py: 1 }}>
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: "block",
              color: "#616161",
              fontWeight: 600,
            }}
          >
            Set status
          </Typography>
          {statusOptions.map((option) => {
            const StatusIcon = option.icon;
            return (
              <MenuItem
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor: userStatus === option.value ? "#f5f5f5" : "transparent",
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: option.color,
                    mr: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {StatusIcon && (
                    <StatusIcon size={10} color="white" />
                  )}
                </Box>
                <Typography variant="body2">{option.label}</Typography>
              </MenuItem>
            );
          })}
        </Box>

        <Divider />

        {/* Settings */}
        <MenuItem sx={{ py: 1.5 }}>
          <ListItemIcon>
            <IoSettings size={20} />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        {/* Help */}
        <MenuItem sx={{ py: 1.5 }}>
          <ListItemIcon>
            <IoHelpCircle size={20} />
          </ListItemIcon>
          <ListItemText>Help</ListItemText>
        </MenuItem>

        <Divider />

        {/* Logout */}
        <MenuItem
          onClick={onLogout}
          sx={{
            py: 1.5,
            color: "#c50f1f",
            "&:hover": {
              backgroundColor: "#fef0f0",
            },
          }}
        >
          <ListItemIcon>
            <IoLogOut size={20} color="#c50f1f" />
          </ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>

      {/* Apps Menu */}
      <Menu
        anchorEl={appsMenuAnchor}
        open={Boolean(appsMenuAnchor)}
        onClose={() => setAppsMenuAnchor(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            ml: 1,
            minWidth: 280,
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1.5,
            display: "block",
            color: "#616161",
            fontWeight: 600,
          }}
        >
          Apps
        </Typography>
        
        <MenuItem sx={{ py: 1.5 }}>
          <ListItemIcon>
            <IoDocument size={20} color="#6264a7" />
          </ListItemIcon>
          <ListItemText>Files</ListItemText>
        </MenuItem>

        <MenuItem sx={{ py: 1.5 }}>
          <ListItemIcon>
            <IoCalendar size={20} color="#6264a7" />
          </ListItemIcon>
          <ListItemText>Calendar</ListItemText>
        </MenuItem>

        <MenuItem sx={{ py: 1.5 }}>
          <ListItemIcon>
            <IoCall size={20} color="#6264a7" />
          </ListItemIcon>
          <ListItemText>Calls</ListItemText>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem sx={{ py: 1.5 }}>
          <ListItemText>
            <Typography variant="body2" color="primary">
              Discover more apps
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SidebarNav;
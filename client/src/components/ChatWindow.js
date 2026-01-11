import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Tooltip,
  IconButton,
  Paper,
  CircularProgress,
  InputBase,
} from "@mui/material";
import {
  IoChatbubbleEllipsesOutline,
  IoVideocam,
  IoCall,
  IoInformationCircle,
  IoCheckmarkDone,
  IoAttach,
  IoHappy,
  IoSend,
  IoEllipsisVertical,
  IoClose,
} from "react-icons/io5";

const ChatWindow = ({
  activeChat,
  currentUser,
  oldMessages,
  isLoadingMessages,
  isSendingMessage,
  replyToMessage,
  message,
  messagesEndRef,
  fileInputRef,

  getInitials,
  getUserStatus,
  formatTimestamp,
  renderTypingIndicator,

  onOpenChatInfo,
  onOpenMessageMenu,
  onSubmit,
  onMessageChange,
  onFileSelect,
  onCancelReply,
  onToggleEmoji,
}) => {
  const findRepliedMessage = (replyId) =>
    oldMessages.find((m) => m.id === replyId);

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      {activeChat ? (
        <>
          {/* ================= Header ================= */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #e5e7eb",
              backgroundColor: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor:
                    activeChat.type === "group" ? "#fbbf24" : "#6264a7",
                }}
              >
                {getInitials(
                  activeChat.name ||
                    `${activeChat.firstName} ${activeChat.lastName}`
                )}
              </Avatar>

              <Box>
                <Typography fontWeight={600}>
                  {activeChat.name ||
                    `${activeChat.firstName} ${activeChat.lastName}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activeChat.type === "group"
                    ? `${activeChat.members?.length || 0} members`
                    : getUserStatus(activeChat.id)}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Tooltip title="Video Call">
                <IconButton size="small">
                  <IoVideocam />
                </IconButton>
              </Tooltip>
              <Tooltip title="Audio Call">
                <IconButton size="small">
                  <IoCall />
                </IconButton>
              </Tooltip>
              <Tooltip title="Chat Info">
                <IconButton size="small" onClick={onOpenChatInfo}>
                  <IoInformationCircle />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* ================= Messages ================= */}
          <Box sx={{ flexGrow: 1, p: 3, overflow: "auto", bgcolor: "#fafafa" }}>
            {isLoadingMessages ? (
              <Box textAlign="center">
                <CircularProgress />
              </Box>
            ) : (
              oldMessages.map((msg) => {
                const isSent = msg.from?.id === currentUser.id;
                const repliedMsg = msg.replyTo
                  ? findRepliedMessage(msg.replyTo)
                  : null;

                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      justifyContent: isSent ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Paper
                      sx={{
                        px: 2,
                        py: 1.5,
                        maxWidth: "60%",
                        bgcolor: isSent ? "#4f46e5" : "white",
                        color: isSent ? "white" : "black",
                        borderRadius: 2,
                        position: "relative",
                      }}
                    >
                      {/* 🔥 DISTINCT REPLY BUBBLE */}
                      {repliedMsg && (
                        <Box
                          sx={{
                            mb: 1,
                            p: 1,
                            borderLeft: "4px solid #22c55e",
                            bgcolor: isSent
                              ? "rgba(255,255,255,0.18)"
                              : "#f1f5f9",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: isSent ? "#e0e7ff" : "#22c55e",
                            }}
                          >
                            {repliedMsg.from?.id === currentUser.id
                              ? "You"
                              : repliedMsg.from?.firstName}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              opacity: 0.8,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 220,
                            }}
                          >
                            {repliedMsg.text || "Message"}
                          </Typography>
                        </Box>
                      )}

                      {/* Actual message */}
                      <Typography variant="body2">{msg.text}</Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {formatTimestamp(msg.timestamp || msg.createdAt)}
                        </Typography>
                        {isSent && <IoCheckmarkDone size={14} />}
                      </Box>

                      {/* ⋮ Menu */}
                      <IconButton
                        size="small"
                        onClick={(e) => onOpenMessageMenu(e, msg)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          opacity: 0,
                          transition: "opacity 0.2s",
                          "&:hover": { opacity: 1 },
                        }}
                      >
                        <IoEllipsisVertical size={14} />
                      </IconButton>
                    </Paper>
                  </Box>
                );
              })
            )}

            <div ref={messagesEndRef} />
            {renderTypingIndicator()}
          </Box>

          {/* ================= Reply Preview Above Input ================= */}
          {replyToMessage && (
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: "#eef2ff",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  Replying to{" "}
                  {replyToMessage.from?.id === currentUser.id
                    ? "You"
                    : replyToMessage.from?.firstName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 260,
                  }}
                >
                  {replyToMessage.text}
                </Typography>
              </Box>

              <IconButton size="small" onClick={onCancelReply}>
                <IoClose />
              </IconButton>
            </Box>
          )}

          {/* ================= Input ================= */}
          <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb", bgcolor: "white" }}>
            <Paper
              component="form"
              onSubmit={onSubmit}
              sx={{ display: "flex", alignItems: "center", p: 1 }}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                multiple
                onChange={onFileSelect}
              />

              <IconButton onClick={() => fileInputRef.current.click()}>
                <IoAttach />
              </IconButton>

              <InputBase
                fullWidth
                value={message}
                onChange={onMessageChange}
                placeholder="Type a message..."
              />

              <IconButton onClick={onToggleEmoji}>
                <IoHappy />
              </IconButton>

              <IconButton type="submit" disabled={isSendingMessage}>
                {isSendingMessage ? (
                  <CircularProgress size={20} />
                ) : (
                  <IoSend />
                )}
              </IconButton>
            </Paper>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
          }}
        >
          <IoChatbubbleEllipsesOutline size={64} />
          <Typography>Select a conversation</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChatWindow;

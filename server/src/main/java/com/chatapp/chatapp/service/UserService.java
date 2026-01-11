package com.chatapp.chatapp.service;

import com.chatapp.chatapp.model.User;
import com.chatapp.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    public User updateUser(String id, User user) {
        user.setId(id);
        return userRepository.save(user);
    }
    
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    
    public User addFriendRequest(String currentUserId, String targetEmail) {
        Optional<User> targetUserOpt = userRepository.findByEmail(targetEmail);
        if (targetUserOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User targetUser = targetUserOpt.get();
        if (!targetUser.getPendingRequest().contains(currentUserId)) {
            targetUser.getPendingRequest().add(currentUserId);
            return userRepository.save(targetUser);
        }
        return targetUser;
    }
    
    public User acceptFriendRequest(String currentUserId, String friendId) {
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Optional<User> friendUserOpt = userRepository.findById(friendId);
        
        if (currentUserOpt.isEmpty() || friendUserOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User currentUser = currentUserOpt.get();
        User friendUser = friendUserOpt.get();
        String roomId = UUID.randomUUID().toString();
        
        currentUser.getPendingRequest().remove(friendId);
        currentUser.getUserFriend().add(new User.UserFriend(friendId, roomId));
        friendUser.getUserFriend().add(new User.UserFriend(currentUserId, roomId));
        
        userRepository.save(currentUser);
        userRepository.save(friendUser);
        
        return currentUser;
    }
    
    public User declineFriendRequest(String currentUserId, String friendId) {
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        if (currentUserOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User currentUser = currentUserOpt.get();
        currentUser.getPendingRequest().remove(friendId);
        return userRepository.save(currentUser);
    }
}
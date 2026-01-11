package com.chatapp.chatapp.controller;

import com.chatapp.chatapp.model.User;
import com.chatapp.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }
    
    @PostMapping("/update/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/friend-request")
    public ResponseEntity<User> addFriendRequest(@RequestBody Map<String, String> request) {
        String currentUserId = request.get("currentUserId");
        String targetEmail = request.get("targetEmail");
        return ResponseEntity.ok(userService.addFriendRequest(currentUserId, targetEmail));
    }
    
    @PostMapping("/accept-friend/{currentUserId}/{friendId}")
    public ResponseEntity<User> acceptFriend(@PathVariable String currentUserId, @PathVariable String friendId) {
        return ResponseEntity.ok(userService.acceptFriendRequest(currentUserId, friendId));
    }
    
    @PostMapping("/decline-friend/{currentUserId}/{friendId}")
    public ResponseEntity<User> declineFriend(@PathVariable String currentUserId, @PathVariable String friendId) {
        return ResponseEntity.ok(userService.declineFriendRequest(currentUserId, friendId));
    }
}

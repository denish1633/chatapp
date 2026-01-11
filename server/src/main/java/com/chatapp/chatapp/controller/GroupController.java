package com.chatapp.chatapp.controller;

import com.chatapp.chatapp.dto.CreateGroupRequest;
import com.chatapp.chatapp.model.Group;
import com.chatapp.chatapp.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/group")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class GroupController {
    
    private final GroupService groupService;
    
    @PostMapping
    public ResponseEntity<Group> createGroup(
            @RequestBody CreateGroupRequest request,
            @RequestParam String userId) {
        return ResponseEntity.ok(groupService.createGroup(request, userId));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Group>> getUserGroups(@PathVariable String userId) {
        return ResponseEntity.ok(groupService.getUserGroups(userId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable String id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }
    
    @PostMapping("/{groupId}/member")
    public ResponseEntity<Group> addMember(
            @PathVariable String groupId,
            @RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        return ResponseEntity.ok(groupService.addMemberToGroup(groupId, userId));
    }
    
    @DeleteMapping("/{groupId}/member/{userId}")
    public ResponseEntity<Group> removeMember(
            @PathVariable String groupId,
            @PathVariable String userId) {
        return ResponseEntity.ok(groupService.removeMemberFromGroup(groupId, userId));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable String id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok().build();
    }
}

package com.chatapp.chatapp.service;


import com.chatapp.chatapp.dto.CreateGroupRequest;
import com.chatapp.chatapp.model.Group;
import com.chatapp.chatapp.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {
    
    private final GroupRepository groupRepository;
    
    public Group createGroup(CreateGroupRequest request, String createdBy) {
        Group group = new Group();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setGroupPic(request.getGroupPic());
        group.setRoomId(UUID.randomUUID().toString());
        group.setCreatedBy(createdBy);
        group.setCreatedAt(LocalDateTime.now());
        
        Group.GroupMember admin = new Group.GroupMember(
            createdBy, 
            "ADMIN", 
            LocalDateTime.now()
        );
        group.getMembers().add(admin);
        
        if (request.getMemberIds() != null) {
            List<Group.GroupMember> members = request.getMemberIds().stream()
                .filter(id -> !id.equals(createdBy))
                .map(id -> new Group.GroupMember(id, "MEMBER", LocalDateTime.now()))
                .collect(Collectors.toList());
            group.getMembers().addAll(members);
        }
        
        return groupRepository.save(group);
    }
    
    public List<Group> getUserGroups(String userId) {
        return groupRepository.findByMembers_UserId(userId);
    }
    
    public Group getGroupById(String id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }
    
    public Group addMemberToGroup(String groupId, String userId) {
        Group group = getGroupById(groupId);
        
        boolean alreadyMember = group.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(userId));
        
        if (!alreadyMember) {
            Group.GroupMember member = new Group.GroupMember(
                userId, 
                "MEMBER", 
                LocalDateTime.now()
            );
            group.getMembers().add(member);
            return groupRepository.save(group);
        }
        return group;
    }
    
    public Group removeMemberFromGroup(String groupId, String userId) {
        Group group = getGroupById(groupId);
        group.getMembers().removeIf(m -> m.getUserId().equals(userId));
        return groupRepository.save(group);
    }
    
    public void deleteGroup(String groupId) {
        groupRepository.deleteById(groupId);
    }
}

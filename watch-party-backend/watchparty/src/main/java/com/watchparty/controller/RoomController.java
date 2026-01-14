package com.watchparty.controller;

import com.watchparty.dto.JoinRoomRequest;
import com.watchparty.model.Room;
import com.watchparty.service.RoomService;
import com.watchparty.service.RoomStateStore;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.watchparty.websocket.WatchEvent;
import java.util.Map;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final RoomStateStore roomStateStore;

    @PostMapping("/create")
    public Room createRoom(Authentication authentication) {
        String email = authentication.getName();
        return roomService.createRoom(email);
    }
    @PostMapping("/join")
    public Room joinRoom(@RequestBody JoinRoomRequest request) {

        return roomService.joinRoom(request.getRoomCode());
    }
    @GetMapping("/{roomCode}/me")
    public Map<String, Boolean> me(
            @PathVariable String roomCode,
            Authentication auth
    ) {
        Room room = roomService.getByRoomCode(roomCode);
        boolean isHost = room.getHostEmail().equals(auth.getName());
        return Map.of("host", isHost);
    }

    @GetMapping("/{roomCode}/state")
    public WatchEvent getState(@PathVariable String roomCode) {
        return roomStateStore.get(roomCode);
    }



}
